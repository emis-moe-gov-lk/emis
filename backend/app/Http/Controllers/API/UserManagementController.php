<?php

namespace App\Http\Controllers\API;

use App\Helpers\NicHelper;
use App\Http\Controllers\Controller;
use App\Mail\ResetPasswordMail;
use App\Services\TeacherToPrincipalPromotionService;
use App\Services\Wso2IsProvisioningService;
use App\Models\User;
use App\Models\Workplaces;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UserManagementController extends Controller
{
    private function isSuperAdmin(Request $request): bool
    {
        return (bool) $request->user()?->hasRole('super admin');
    }

    // -------------------------------------------------------
    // GET /users
    // -------------------------------------------------------
    public function index(Request $request)
    {
        if (! $this->isSuperAdmin($request)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Forbidden'
            ], 403);
        }

        try {

            $perPage = (int) $request->get('per_page', 20);
            $search  = trim($request->get('search', ''));

            $query = User::query()
                ->select('id', 'name', 'email', 'nic', 'active_status')
                ->with([
                    'roles:id,name',
                    'currentAppointment.workplace:workplace_id,name'
                ]);

            if ($search !== '') {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('nic', 'like', "%{$search}%");
                });
            }

            $users = $query->paginate($perPage);

            \Log::debug($users);

            $data = $users->through(function ($user) {



                return [
                    'name'      => $user->name,
                    'id'        => $user->id,
                    'status'    => $user->active_status,
                    'nic'       => $user->nic,
                    'email'     => $user->email,
                    'role'      => $user->roles->pluck('name'),
                    'workplace' => $user->currentAppointment?->workplace?->name

                ];
            });

            return response()->json([
                'status' => 'success',
                'data'   => $data
            ]);

        } catch (\Throwable $e) {

            Log::error('User index error', [
                'message' => $e->getMessage()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch users'
            ], 500);
        }
    }

    // -------------------------------------------------------
    // POST /users
    // -------------------------------------------------------
    public function store(Request $request, Wso2IsProvisioningService $wso2Is)
    {
        if (! $this->isSuperAdmin($request)) {
            return response()->json(['status' => 'error', 'message' => 'Forbidden'], 403);
        }

        try {
            $validated = $request->validate([
                'name'                  => 'required|string|max:255',
                'nic'                   => ['required', 'string', 'regex:/^(\d{9}[vVxX]|\d{12})$/'],
                'email'                 => 'required|email|lowercase|unique:users,email',
                'contact'               => 'required|digits:10|unique:users,contact',
                'roles'                 => 'required|array|min:1',
                'password'              => ['required', 'string', 'confirmed', Password::defaults()],
            ]);

            $nic    = NicHelper::normalize($validated['nic']);
            $nicHash = NicHelper::hash($nic);

            // NIC must belong to an existing People record
            $person = \App\Models\People::where('nic_hash', $nicHash)->first();
            if (! $person) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'This NIC does not exist in the People database.',
                ], 422);
            }

            // Check NIC not already taken by another user
            if (User::where('nic_hash', $nicHash)->exists()) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'A user with this NIC already exists.',
                ], 422);
            }

            $user = User::updateOrCreate(
                ['nic_hash' => $nicHash],
                [
                    'nic'       => $nic,
                    'nic_hash'  => $nicHash,
                    'people_id' => $person->people_id,
                    'name'      => $person->name_with_initials,
                    'email'     => $validated['email'],
                    'contact'   => $validated['contact'],
                    'password'  => Hash::make($validated['password']),
                ]
            );

            $user->syncRoles($validated['roles']);

            $primaryRole = strtolower(trim((string) ($validated['roles'][0] ?? '')));
            if ($primaryRole !== '') {
                $wso2Is->provisionUser($user, $validated['password'], $primaryRole);
            }

            return response()->json([
                'status'  => 'success',
                'message' => 'User created successfully.',
                'data'    => $user->load('roles'),
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['status' => 'validation_error', 'errors' => $e->errors()], 422);
        } catch (\Throwable $e) {
            Log::error('User store error', ['message' => $e->getMessage()]);

            return response()->json(['status' => 'error', 'message' => 'Failed to create user'], 500);
        }
    }

    // -------------------------------------------------------
    // GET /users/{id}
    // -------------------------------------------------------
    public function show(Request $request, string $id)
    {
        if (! $this->isSuperAdmin($request)) {
            return response()->json(['status' => 'error', 'message' => 'Forbidden'], 403);
        }

        try {
            $user = User::with([
                'roles:id,name',
                'people.title:title_id,title_name',
                'people.gender:gender_id,gender_name',
                'people.religion:religion_id,religion_name',
                'people.ethnicity:ethnicity_id,ethnicity_name',
                'people.civilStatus:civil_status_id,civil_status_name',
                'people.bloodGroup:blood_group_id,blood_group',
                'people.district:district_id,district_name',
                'currentAppointment.service:service_id,service_name',
                'currentAppointment.rank:rank_id,rank_name',
                'currentAppointment.position:position_id,position_name',
                'currentAppointment.officeLevel:office_level_id,office_level_name',
                'currentAppointment.workplace',
            ])->find($id);

            if (! $user) {
                return response()->json(['status' => 'error', 'message' => 'User not found'], 404);
            }

            $people      = $user->people;
            $appointment = $user->currentAppointment;

            return response()->json([
                'status' => 'success',
                'data'   => [
                    'account' => [
                        'id'             => $user->id,
                        'name'           => $user->name,
                        'email'          => $user->email,
                        'nic'            => $user->nic,
                        'contact'        => $user->contact,
                        'active_status'  => $user->active_status,
                        'profile_picture'=> $user->profile_picture,
                        'roles'          => $user->roles->pluck('name'),
                    ],
                    'personal' => $people ? [
                        'people_id'          => $people->people_id,
                        'full_name'          => $people->full_name,
                        'name_with_initials' => $people->name_with_initials,
                        'date_of_birth'      => $people->date_of_birth,
                        'title'              => $people->title?->title_name,
                        'gender'             => $people->gender?->gender_name,
                        'religion'           => $people->religion?->religion_name,
                        'ethnicity'          => $people->ethnicity?->ethnicity_name,
                        'civil_status'       => $people->civilStatus?->civil_status_name,
                        'blood_group'        => $people->bloodGroup?->blood_group,
                        'health_status'      => $people->health_status,
                        'permanent_address'  => [
                            'line1'       => $people->address_line1,
                            'line2'       => $people->address_line2,
                            'line3'       => $people->address_line3,
                            'postal_code' => $people->postal_code,
                            'district'    => $people->district?->district_name,
                        ],
                        'temporary_address'  => [
                            'line1'       => $people->t_address_line1,
                            'line2'       => $people->t_address_line2,
                            'line3'       => $people->t_address_line3,
                            'postal_code' => $people->t_postal_code,
                        ],
                    ] : null,
                    'appointment' => $appointment ? [
                        'appoint_date'          => $appointment->appoint_date,
                        'appointment_letter_no' => $appointment->appointment_letter_no,
                        'service'               => $appointment->service?->service_name,
                        'rank'                  => $appointment->rank?->rank_name,
                        'position'              => $appointment->position?->position_name,
                        'office_level'          => $appointment->officeLevel?->office_level_name,
                        'workplace'             => $appointment->workplace?->office_name,
                        'service_years'         => $appointment->service_years,
                    ] : null,
                ],
            ]);
        } catch (\Throwable $e) {
            Log::error('User show error', ['message' => $e->getMessage()]);

            return response()->json(['status' => 'error', 'message' => 'Failed to fetch user'], 500);
        }
    }

    // -------------------------------------------------------
    // PATCH /users/{id}
    // -------------------------------------------------------
    public function update(Request $request, string $id, TeacherToPrincipalPromotionService $promotionService, Wso2IsProvisioningService $wso2Is)
    {
        if (! $this->isSuperAdmin($request)) {
            return response()->json(['status' => 'error', 'message' => 'Forbidden'], 403);
        }

        try {
            $user = User::find($id);

            if (! $user) {
                return response()->json(['status' => 'error', 'message' => 'User not found'], 404);
            }

            $validated = $request->validate([
                'name'    => 'sometimes|string|max:255',
                'email'   => ['sometimes', 'email', 'lowercase', Rule::unique('users', 'email')->ignore($user->id)],
                'nic'     => ['sometimes', 'string', 'regex:/^(\d{9}[vVxX]|\d{12})$/'],
                'contact' => ['sometimes', 'digits:10', Rule::unique('users', 'contact')->ignore($user->id)],
                'roles'   => 'sometimes|array|min:1',
                'roles.*' => 'string|exists:roles,name',
                'reason'  => 'sometimes|nullable|string|max:1000',
            ]);

            $previousRoles = $user->roles()->pluck('name')->all();

            // Check NIC not taken by another user
            if (isset($validated['nic'])) {
                $nicHash  = NicHelper::hash(NicHelper::normalize($validated['nic']));
                $nicTaken = User::where('nic_hash', $nicHash)->where('id', '!=', $user->id)->exists();
                if ($nicTaken) {
                    return response()->json([
                        'status'  => 'error',
                        'message' => 'This NIC is already registered to another user.',
                    ], 422);
                }
            }

            $fields = [];
            if (isset($validated['name']))    $fields['name']    = $validated['name'];
            if (isset($validated['email']))   $fields['email']   = $validated['email'];
            if (isset($validated['nic']))     $fields['nic']     = NicHelper::normalize($validated['nic']);
            if (isset($validated['contact'])) $fields['contact'] = $validated['contact'];

            if (! empty($fields)) {
                $user->update($fields);
            }

            if (isset($validated['roles'])) {
                $isTeacherToPrincipal = $promotionService->isTeacherToPrincipalTransition(
                    $previousRoles,
                    $validated['roles']
                );

                if ($isTeacherToPrincipal) {
                    $changedByPeopleId = $request->attributes->get('jwt_people_id') ?? auth()->user()?->people_id;
                    $promotionResult = $promotionService->promote(
                        $user,
                        $validated['roles'],
                        $changedByPeopleId,
                        $validated['reason'] ?? null
                    );

                    if ($promotionResult['promoted'] ?? false) {
                        return response()->json([
                            'status'  => 'success',
                            'message' => 'User updated and promoted to principal successfully.',
                            'data'    => $user->fresh()->load('roles'),
                        ]);
                    }
                }

                $newPrimaryRole = strtolower(trim((string) ($validated['roles'][0] ?? '')));
                if ($newPrimaryRole !== '') {
                    $wso2Is->updateUserRole(
                        $user,
                        strtolower(trim((string) ($previousRoles[0] ?? ''))),
                        $newPrimaryRole
                    );
                }
                $user->syncRoles($validated['roles']);
            }

            return response()->json([
                'status'  => 'success',
                'message' => 'User updated successfully.',
                'data'    => $user->load('roles'),
            ]);
        } catch (\RuntimeException $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
            ], 422);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['status' => 'validation_error', 'errors' => $e->errors()], 422);
        } catch (\Throwable $e) {
            Log::error('User update error', ['message' => $e->getMessage()]);

            return response()->json(['status' => 'error', 'message' => 'Failed to update user'], 500);
        }
    }

    // -------------------------------------------------------
    // DELETE /users/{id}
    // -------------------------------------------------------
    public function destroy(Request $request, string $id)
    {
        if (! $this->isSuperAdmin($request)) {
            return response()->json(['status' => 'error', 'message' => 'Forbidden'], 403);
        }

        try {
            $user = User::find($id);

            if (! $user) {
                return response()->json(['status' => 'error', 'message' => 'User not found'], 404);
            }

            $user->delete();

            return response()->json(['status' => 'success', 'message' => 'User deleted successfully.']);

        } catch (\Throwable $e) {
            Log::error('User delete error', ['message' => $e->getMessage()]);
            return response()->json(['status' => 'error', 'message' => 'Failed to delete user'], 500);
        }
    }

    // -------------------------------------------------------
    // PATCH /users/{id}/toggle-status
    // -------------------------------------------------------
    public function toggleStatus(Request $request, string $id)
    {
        if (! $this->isSuperAdmin($request)) {
            return response()->json(['status' => 'error', 'message' => 'Forbidden'], 403);
        }

        try {
            $user = User::find($id);

            if (! $user) {
                return response()->json(['status' => 'error', 'message' => 'User not found'], 404);
            }

            $user->active_status = $user->active_status ? 0 : 1;
            $user->save();

            return response()->json([
                'status'  => 'success',
                'message' => $user->active_status ? 'User activated successfully.' : 'User deactivated successfully.',
                'data'    => ['active_status' => $user->active_status],
            ]);
        } catch (\Throwable $e) {
            Log::error('User toggle status error', ['message' => $e->getMessage()]);

            return response()->json(['status' => 'error', 'message' => 'Failed to update status'], 500);
        }
    }

    // -------------------------------------------------------
    // POST /users/{id}/reset-password
    // -------------------------------------------------------
    public function resetPassword(Request $request, string $id)
    {
        if (! $this->isSuperAdmin($request)) {
            return response()->json(['status' => 'error', 'message' => 'Forbidden'], 403);
        }

        try {
            $user = User::find($id);

            if (! $user) {
                return response()->json(['status' => 'error', 'message' => 'User not found'], 404);
            }

            $newPassword    = 'User@' . rand(1000, 9999);
            $user->password = Hash::make($newPassword);
            $user->save();

            Mail::to($user->email)->send(new ResetPasswordMail($newPassword));

            return response()->json([
                'status'  => 'success',
                'message' => 'Password reset successfully. New password is ' . $newPassword,
            ]);
        } catch (\Throwable $e) {
            Log::error('User reset password error', ['message' => $e->getMessage()]);

            return response()->json(['status' => 'error', 'message' => 'Failed to reset password'], 500);
        }
    }
}
