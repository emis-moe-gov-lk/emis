<?php

namespace App\Http\Controllers\API;

use App\Models\People;
use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Log;
use Spatie\Permission\Models\Role;

class UserApiController extends Controller
{
    public function __invoke(Request $request, string $people_id)
    {
        try {
            $authPeopleId = $request->attributes->get('jwt_people_id') ?? auth()->user()?->people_id;

            if (! $authPeopleId) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Unauthenticated',
                ], 401);
            }

            $roles = $request->attributes->get('jwt_roles', []);
            $role  = $roles[0] ?? null;

            // If requesting someone else's profile, verify the token user
            // has a higher hierarchy level than the target user.
            if ($authPeopleId !== $people_id) {
                $tokenUserRole = $role
                    ? Role::where('name', $role)->first()
                    : null;

                $targetUser = User::where('people_id', $people_id)->first();
                $targetRole = $targetUser
                    ? $targetUser->roles()->first()
                    : null;

                $tokenLevel  = $tokenUserRole?->level;
                $targetLevel = $targetRole?->level;

                // Deny if hierarchy levels are missing or token user is not higher
                if ($tokenLevel === null || $targetLevel === null || $tokenLevel >= $targetLevel) {
                    return response()->json([
                        'status'  => 'error',
                        'message' => 'Forbidden',
                    ], 403);
                }
            }

            // Base relations common to all user types
            $baseRelations = [
                'title',
                'gender',
                'religion',
                'ethnicity',
                'civilStatus',
                'bloodGroup',
                'district',
                'gnDivision',
                'appointment',
                'currentAppointment',
                'currentAppointment.workplace',
                'currentAppointment.workplace.ministry',
                'currentAppointment.workplace.provincial',
                'currentAppointment.workplace.zonal',
                'currentAppointment.workplace.divisional',
                'currentAppointment.workplace.institution',
                'appointmentHistory',
            ];

            // Role-specific relations
            $roleRelations = match (true) {
                $role === 'teacher' => [
                    'teacher',
                    'teacher.teacherCategory',
                    'teacher.teacherType',
                    'teacher.medium',
                    'teacher.appointmentSubject',
                    'teacher.mainSubject',
                    'teacher.secondarySubject',
                    'teacher.currentTeachingSubject',
                ],
                $role === 'principal' => [
                    'principal',
                    'principal.recruitmentCategory',
                ],
                $role === 'sleas' => [
                    'educationAdministratorService',
                    'educationAdministratorService.recruitmentCategory',
                    'educationAdministratorService.serviceSubject',
                    'cadreSubject',
                    'cadreSubject.medium',
                    'cadreSubject.mainSubject',
                ],
                default => [
                    'educationAdministratorService',
                    'educationAdministratorService.recruitmentCategory',
                    'educationAdministratorService.serviceSubject',
                ],
            };

            $person = People::with(array_merge($baseRelations, $roleRelations))
                ->where('people_id', $people_id)
                ->first();

            if (! $person) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'User not found',
                ], 404);
            }

            // Fetch roles and permissions from the User record
            $user        = User::where('people_id', $people_id)->first();
            $permissions = $user
                ? $user->getAllPermissions()->pluck('name')->values()->all()
                : [];

            return response()->json([
                'status' => 'success',
                'data'   => array_merge($person->toArray(), [
                    'roles'       => $roles,
                    'permissions' => $permissions,
                ]),
            ]);
        } catch (\Throwable $e) {
            Log::error('User Profile Fetch Error', [
                'message' => $e->getMessage(),
                'file'    => $e->getFile(),
                'line'    => $e->getLine(),
            ]);

            return response()->json([
                'status'  => 'error',
                'message' => 'Failed to fetch user profile',
            ], 500);
        }
    }
}
