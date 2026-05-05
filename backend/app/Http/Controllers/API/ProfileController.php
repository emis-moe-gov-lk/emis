<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\People;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use App\Services\TeacherAccountProvisioningService;

class ProfileController extends Controller
{
    // -------------------------------------------------------
    // PATCH /profile
    // Update the authenticated user's own profile.
    // -------------------------------------------------------
    public function update(Request $request)
    {
        $user = $request->user() ?: User::where('email', $request->attributes->get('jwt_email'))->first();

        if (! $user) {
            return response()->json([
                'status'  => 'error',
                'message' => 'User not found',
            ], 404);
        }

        try {
            $validated = $request->validate([
                'name'    => 'sometimes|string|max:255',
                'email'   => ['sometimes', 'email', 'lowercase', Rule::unique('users', 'email')->ignore($user->id)],
                'contact' => ['sometimes', 'digits:10', Rule::unique('users', 'contact')->ignore($user->id)],
            ]);

            $fullName         = isset($validated['name']) ? ucwords(strtolower($validated['name'])) : null;
            $nameWithInitials = $fullName ? People::generateInitials($fullName) : null;

            DB::transaction(function () use ($user, $validated, $fullName, $nameWithInitials) {
                $userFields = array_filter([
                    'name'    => $nameWithInitials,
                    'email'   => $validated['email'] ?? null,
                    'contact' => $validated['contact'] ?? null,
                ], fn($v) => ! is_null($v));

                if (! empty($userFields)) {
                    $user->update($userFields);
                }

                if ($user->people_id) {
                    $peopleFields = array_filter([
                        'full_name'          => $fullName,
                        'name_with_initials' => $nameWithInitials,
                        'email'              => $validated['email'] ?? null,
                        'phone'              => $validated['contact'] ?? null,
                    ], fn($v) => ! is_null($v));

                    if (! empty($peopleFields)) {
                        $person = People::where('people_id', $user->people_id)->first();
                        $person?->update($peopleFields);
                    }
                }
            });

            return response()->json([
                'status'  => 'success',
                'message' => 'Profile updated successfully',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status'        => 'validation_error',
                'errors'        => $e->errors(),
            ], 422);
        } catch (\Throwable $e) {
            Log::error('Profile update error', ['message' => $e->getMessage()]);

            return response()->json([
                'status'        => 'error',
                'message'       => 'Failed to update profile',
            ], 500);
        }
    }

    // -------------------------------------------------------
    // PATCH /profile/password
    // Change the authenticated user's own password.
    // -------------------------------------------------------
    public function changePassword(Request $request)
{
    $user  = $request->user() ?: User::where('email', $request->attributes->get('jwt_email'))->first();

    if (! $user) {
        return response()->json([
            'status'  => 'error',
            'message' => 'User not found',
        ], 404);
    }

    try {
        $validated = $request->validate([
            'current_password' => 'required|string',
            'new_password'     => ['required', 'string', 'confirmed', Password::defaults()],
        ]);

        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Current password is incorrect',
            ], 422);
        }

        if (Hash::check($validated['new_password'], $user->password)) {
            return response()->json([
                'status'  => 'error',
                'message' => 'New password must be different',
            ], 422);
        }

        $user->update([
            'password' => Hash::make($validated['new_password']),
            'must_change_password' => false,
            'password_changed_at' => now(),
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Password changed successfully',
        ]);

    } catch (\Illuminate\Validation\ValidationException $e) {
        return response()->json([
            'status' => 'validation_error',
            'errors' => $e->errors(),
        ], 422);
    } catch (\Throwable $e) {
        \Log::error('Password change error', ['message' => $e->getMessage()]);

        return response()->json([
            'status'  => 'error',
            'message' => 'Failed to change password',
        ], 500);
    }
}

    public function completeExternalPasswordChange(Request $request, TeacherAccountProvisioningService $teacherAccountProvisioningService)
    {
        $user = $request->user() ?: User::where('email', $request->attributes->get('jwt_email'))->first();

        if (! $user) {
            return response()->json([
                'status'  => 'error',
                'message' => 'User not found',
            ], 404);
        }

        $teacherAccountProvisioningService->completePasswordChange($user);

        return response()->json([
            'status' => 'success',
            'message' => 'Password change status updated successfully',
        ]);
    }
}
