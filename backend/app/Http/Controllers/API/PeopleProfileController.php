<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\DivisionalSecretariatOffice;
use App\Models\People;
use App\Models\User;
use App\Traits\ResolvesZonalScope;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PeopleProfileController extends Controller
{
    use ResolvesZonalScope;

    private function resolveDsOffice(?string $value): ?DivisionalSecretariatOffice
    {
        $normalized = trim((string) $value);

        if ($normalized === '') {
            return null;
        }

        if (ctype_digit($normalized)) {
            return DivisionalSecretariatOffice::find((int) $normalized);
        }

        return DivisionalSecretariatOffice::where('dso_id', $normalized)->first();
    }

    private function resolveDsOfficePrimaryKey(?string $value): ?int
    {
        return $this->resolveDsOffice($value)?->id;
    }

    public function update(Request $request, string $people_id)
    {
        $roles = $this->resolvedRoles($request);
        $callerPeopleId = auth()->user()?->people_id;
        $isSelf = $callerPeopleId === $people_id;
        $isAdmin = $this->hasAnyRole($roles, [
            'development officer',
            'development officer head',
            'zonal deo',
            'zonal deo head',
            'zonal director',
            'zonal deputy director',
            'super admin',
        ]);

        if (! $isSelf && ! $isAdmin) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Unauthorized',
            ], 403);
        }

        $person = People::where('people_id', $people_id)->first();

        if (! $person) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Person not found',
            ], 404);
        }

        $section = (string) $request->input('section');

        if (! in_array($section, ['personal', 'health', 'contact', 'address', 'temporary', 'current_appointment', 'my_appointment', 'wop'], true)) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Invalid update section',
            ], 422);
        }

        $rules = match ($section) {
            'personal' => [
                'titleId'       => 'nullable|string',
                'fullName'      => 'nullable|string|max:255',
                'genderId'      => 'nullable|string',
                'dateOfBirth'   => 'nullable|date',
                'ethnicityId'   => 'nullable|string',
                'religionId'    => 'nullable|string',
                'civilStatusId' => 'nullable|string',
            ],
            'health' => [
                'bloodGroupId'    => 'nullable|string',
                'healthCondition' => 'nullable|in:0,1',
                'knownProblems'   => 'nullable|string|max:500',
            ],
            'contact' => [
                'email' => 'nullable|email',
                'phone' => 'nullable|digits:10',
            ],
            'address' => [
                'districtId'   => 'nullable|string',
                'dsOfficeId'   => 'nullable|string',
                'gnDivisionId' => 'nullable|string',
                'addressLine1' => 'nullable|string|max:255',
                'addressLine2' => 'nullable|string|max:255',
                'addressLine3' => 'nullable|string|max:255',
                'postalCode'   => 'nullable|string|max:20',
                'latitude'     => 'nullable|string|max:100',
                'longitude'    => 'nullable|string|max:100',
            ],
            'temporary' => [
                'tAddressLine1' => 'nullable|string|max:255',
                'tAddressLine2' => 'nullable|string|max:255',
                'tAddressLine3' => 'nullable|string|max:255',
                'tPostalCode'   => 'nullable|string|max:20',
            ],
            'current_appointment' => [
                'currentAppointmentDate'        => 'nullable|date',
                'currentAppointmentService'     => 'nullable|string',
                'currentAppointmentRank'        => 'nullable|string',
                'currentAppointmentPosition'    => 'nullable|string',
                'currentAppointmentInstitution' => 'nullable|string',
            ],
            'my_appointment' => [
                'firstAppointmentDate'        => 'nullable|date',
                'firstAppointmentLetter'      => 'nullable|string',
                'firstAppointmentService'     => 'nullable|string',
                'firstAppointmentRank'        => 'nullable|string',
                'firstAppointmentPosition'    => 'nullable|string',
                'firstAppointmentInstitution' => 'nullable|string',
            ],
            'wop' => [
                'w_op_no'      => 'nullable|string|max:10',
                'pay_sheet_no' => 'nullable|string|max:10',
            ],
        };

        $validated = $request->validate($rules);

        if ($section === 'contact') {
            $email = ! empty($validated['email']) ? strtolower(trim((string) $validated['email'])) : null;
            $phone = ! empty($validated['phone']) ? (string) $validated['phone'] : null;

            $emailConflict = $email && (
                People::where('email', $email)->where('people_id', '!=', $person->people_id)->exists()
                || User::where('email', $email)->where('people_id', '!=', $person->people_id)->exists()
            );

            $phoneConflict = $phone && (
                People::where('phone', $phone)->where('people_id', '!=', $person->people_id)->exists()
                || User::where('contact', $phone)->where('people_id', '!=', $person->people_id)->exists()
            );

            if ($emailConflict || $phoneConflict) {
                return response()->json([
                    'status' => 'validation_error',
                    'errors' => array_filter([
                        'email' => $emailConflict ? ['Email is already used by another profile.'] : null,
                        'phone' => $phoneConflict ? ['Phone number is already used by another profile.'] : null,
                    ]),
                ], 422);
            }
        }

        DB::transaction(function () use ($section, $validated, $person) {
            if ($section === 'personal') {
                $fullName = ! empty($validated['fullName'])
                    ? ucwords(strtolower($validated['fullName']))
                    : null;

                $person->update(array_filter([
                    'title_id'           => $validated['titleId'] ?? null,
                    'full_name'          => $fullName,
                    'name_with_initials' => $fullName ? People::generateInitials($fullName) : null,
                    'gender_id'          => $validated['genderId'] ?? null,
                    'date_of_birth'      => $validated['dateOfBirth'] ?? null,
                    'ethnicity_id'       => $validated['ethnicityId'] ?? null,
                    'religion_id'        => $validated['religionId'] ?? null,
                    'civil_status_id'    => $validated['civilStatusId'] ?? null,
                ], fn ($v) => $v !== null));
            }

            if ($section === 'health') {
                $person->update(array_filter([
                    'blood_group_id'   => $validated['bloodGroupId'] ?? null,
                    'health_condition' => isset($validated['healthCondition']) ? (int) $validated['healthCondition'] : null,
                    'health_problem'   => $validated['knownProblems'] ?? null,
                ], fn ($v) => $v !== null));
            }

            if ($section === 'contact') {
                $person->update(array_filter([
                    'email' => $email,
                    'phone' => $phone,
                ], fn ($v) => $v !== null));
            }

            if ($section === 'address') {
                $person->update(array_filter([
                    'district_id'    => $validated['districtId'] ?? null,
                    'ds_office_id'   => ! empty($validated['dsOfficeId']) ? $this->resolveDsOfficePrimaryKey((string) $validated['dsOfficeId']) : null,
                    'gn_division_id' => $validated['gnDivisionId'] ?? null,
                    'address_line1'  => $validated['addressLine1'] ?? null,
                    'address_line2'  => $validated['addressLine2'] ?? null,
                    'address_line3'  => $validated['addressLine3'] ?? null,
                    'postal_code'    => $validated['postalCode'] ?? null,
                    'latitude'       => $validated['latitude'] ?? null,
                    'longitude'      => $validated['longitude'] ?? null,
                ], fn ($v) => $v !== null));
            }

            if ($section === 'temporary') {
                $person->update([
                    't_address_line1' => $validated['tAddressLine1'] ?? null,
                    't_address_line2' => $validated['tAddressLine2'] ?? null,
                    't_address_line3' => $validated['tAddressLine3'] ?? null,
                    't_postal_code'   => $validated['tPostalCode'] ?? null,
                ]);
            }

            if ($section === 'current_appointment') {
                $person->currentAppointment()->update([
                    'appoint_date' => $validated['currentAppointmentDate'],
                    'service_id'   => $validated['currentAppointmentService'],
                    'rank_id'      => $validated['currentAppointmentRank'],
                    'position_id'  => $validated['currentAppointmentPosition'],
                ]);
            }

            if ($section === 'my_appointment') {
                $person->appointment()->update([
                    'first_appointment_date' => $validated['firstAppointmentDate'],
                    'appointment_letter_no'  => ($validated['firstAppointmentLetter'] ?? null) ?: null,
                    'service_id'             => $validated['firstAppointmentService'],
                    'rank_id'                => $validated['firstAppointmentRank'],
                    'position_id'            => $validated['firstAppointmentPosition'],
                ]);
            }

            if ($section === 'wop') {
                $person->appointment()->update([
                    'w_op_no'      => $validated['w_op_no'],
                    'pay_sheet_no' => $validated['pay_sheet_no'],
                ]);
            }
        });

        $person->refresh();

        return response()->json([
            'status'  => 'success',
            'message' => 'Profile updated successfully',
            'data'    => $person,
        ]);
    }
}
