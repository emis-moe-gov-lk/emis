<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\People;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MobileTeacherProfileController extends Controller
{
    public function __invoke(Request $request)
    {
        try {
            $email    = $request->attributes->get('jwt_email');
            $peopleId = $request->attributes->get('jwt_people_id');
            $roles    = $request->attributes->get('jwt_roles', []);

            if (! in_array('Teacher', $roles)) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Access denied. This endpoint is only accessible to teachers.',
                ], 403);
            }

            $user = User::where('email', $email)->first();

            $permissions = $user
                ? $user->getAllPermissions()->pluck('name')->values()->all()
                : [];

            $teacher = People::with([
                'title',
                'gender',
                'religion',
                'ethnicity',
                'civilStatus',
                'bloodGroup',
                'district',
                'gnDivision',

                'myAppointments',
                'appointment',
                'currentAppointment',
                'appointmentHistory',

                'currentAppointment.workplace',
                'currentAppointment.workplace.ministry',
                'currentAppointment.workplace.provincial',
                'currentAppointment.workplace.zonal',
                'currentAppointment.workplace.divisional',
                'currentAppointment.workplace.institution',

                'teacher',
                'teacher.appointmentSubject',
                'teacher.mainSubject',
                'teacher.secondarySubject',
                'teacher.currentTeachingSubject',

                'educationQualifications',
                'educationQualifications.qualification',
                'educationQualifications.qualificationGrade',

                'familiesAsHusband',
                'familiesAsHusband.memberB',
                'familiesAsHusband.children',
                'familiesAsWife',
                'familiesAsWife.memberA',
                'familiesAsWife.children',
            ])
                ->where('people_id', $peopleId)
                ->first();

            if (! $teacher) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Teacher profile not found',
                ], 404);
            }

            return response()->json([
                'status' => 'success',
                'data'   => [
                    'identity' => [
                        'people_id'   => $peopleId,
                        'email'       => $email,
                        'name'        => $user?->name,
                        'gender'      => $user?->people?->gender?->gender_name,
                        'roles'       => $roles,
                        'permissions' => $permissions,
                    ],
                    'profile' => $teacher,
                ],
            ], 200);
        } catch (\Throwable $e) {
            Log::error('Mobile Teacher Profile Error', [
                'message' => $e->getMessage(),
                'file'    => $e->getFile(),
                'line'    => $e->getLine(),
            ]);

            return response()->json([
                'status'  => 'error',
                'message' => 'Failed to fetch teacher profile',
            ], 500);
        }
    }
}
