<?php

namespace App\Services;

use App\Helpers\NicHelper;
use App\Models\People;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class TeacherAccountProvisioningService
{
    private function buildDefaultTeacherPassword(string $nic): string
    {
        return 'Pw' . $nic;
    }

    public function provisionFromPerson(People $person, bool $resetDefaultPassword = false): array
    {
        $email = strtolower(trim((string) ($person->email ?? '')));
        $nic = NicHelper::normalize((string) ($person->nic ?? ''));
        $defaultPassword = $this->buildDefaultTeacherPassword($nic);

        if ($email === '') {
            throw ValidationException::withMessages([
                'email' => 'Teacher email is required before confirming the profile.',
            ]);
        }

        if ($nic === '') {
            throw ValidationException::withMessages([
                'nic' => 'Teacher NIC is required before confirming the profile.',
            ]);
        }

        $conflict = User::query()
            ->where('email', $email)
            ->where('people_id', '!=', $person->people_id)
            ->first();

        if ($conflict) {
            throw ValidationException::withMessages([
                'email' => 'Teacher email is already used by another user account.',
            ]);
        }

        $user = User::query()->firstOrNew([
            'people_id' => $person->people_id,
        ]);

        $isNewUser = ! $user->exists;
        $shouldInitializePassword = $isNewUser || $resetDefaultPassword;

        $user->fill([
            'nic' => $nic,
            'nic_hash' => NicHelper::hash($nic),
            'people_id' => $person->people_id,
            'name' => $person->name_with_initials ?: $person->full_name,
            'email' => $email,
            'contact' => $person->phone,
            'identity_provider' => 'local',
            'active_status' => true,
        ]);

        if ($shouldInitializePassword) {
            $user->password = $defaultPassword;
            $user->must_change_password = true;
            $user->password_initialized_at = now();
            $user->password_changed_at = null;
            $user->default_password_version = max(1, (int) ($user->default_password_version ?: 0)) + ($resetDefaultPassword && $user->exists ? 1 : 0);
        } elseif ($isNewUser === false) {
            // Existing teacher accounts keep their current password state.
            $user->identity_provider = $user->identity_provider ?: 'local';
        }

        $user->save();
        $user->assignRole('teacher');

        return [
            'user' => $user->fresh(['roles']),
            'password_initialized' => $shouldInitializePassword,
            'remote' => [
                'provider' => 'local',
                'enabled' => false,
                'provisioned' => false,
                'skipped' => true,
            ],
        ];
    }

    public function syncProfile(People $person): array
    {
        $user = User::query()->where('people_id', $person->people_id)->first();

        if (! $user) {
            return [
                'synced' => false,
                'reason' => 'local_user_not_found',
            ];
        }

        $nicChanged = $user->nic_hash !== $person->nic_hash;

        $user->fill([
            'nic' => $person->nic,
            'nic_hash' => $person->nic_hash,
            'name' => $person->name_with_initials ?: $person->full_name,
            'email' => strtolower(trim((string) ($person->email ?? $user->email))),
            'contact' => $person->phone,
        ]);

        if ($user->isDirty()) {
            $user->save();
        }

        if ($nicChanged) {
            Log::info('Teacher NIC updated without resetting account password', [
                'people_id' => $person->people_id,
                'user_id' => $user->id,
                'identity_provider' => $user->identity_provider,
            ]);
        }

        return [
            'synced' => true,
            'user' => $user->fresh(),
            'remote' => [
                'provider' => 'local',
                'enabled' => false,
                'synced' => false,
                'skipped' => true,
            ],
        ];
    }

    public function completePasswordChange(User $user): User
    {
        $user->forceFill([
            'must_change_password' => false,
            'password_changed_at' => now(),
        ])->saveQuietly();

        return $user->fresh();
    }
}
