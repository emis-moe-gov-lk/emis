<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AuthIdentityController extends Controller
{
    public function __invoke(Request $request)
    {
        $user = $request->user()?->loadMissing([
            'people.gender',
            'roles:id,name',
            'currentAppointment.officeLevel:office_level_id,office_level_name',
            'currentAppointment.workplace',
            'currentAppointment.workplace.zonal',
            'currentAppointment.workplace.divisional.zonalEducationOffice',
            'currentAppointment.workplace.institution.zonalEducationOffice',
        ]);

        $roles = $user?->roles?->pluck('name')->values()->all() ?? [];
        $permissions = $user?->getAllPermissions()->pluck('name')->values()->all() ?? [];
        $currentAppointment = $user?->currentAppointment;
        $workplace = $currentAppointment?->workplace;
        $workplaceOffice = $workplace?->office();
        $zonalOffice = $workplace?->zonal
            ?? $workplace?->divisional?->zonalEducationOffice
            ?? $workplace?->institution?->zonalEducationOffice;

        return response()->json([
            'status' => 'success',
            'data'   => [
                'token'       => [
                    'email' => $request->attributes->get('jwt_email'),
                ],
                'user'        => [
                    'id'              => $user?->id,
                    'people_id'       => $user?->people_id,
                    'name'            => $user?->name,
                    'email'           => $user?->email,
                    'contact'         => $user?->contact,
                    'gender'          => $user?->people?->gender?->gender_name,
                    'active_status'   => $user?->active_status,
                    'profile_picture' => $user?->profile_picture,
                ],
                'people_id'     => $user?->people_id,
                'roles'         => $roles,
                'permissions'   => $permissions,
                'primary_role'  => $roles[0] ?? null,
                'office_level'  => $currentAppointment?->officeLevel?->office_level_name,
                'office_level_id' => $currentAppointment?->office_level_id,
                'workplace'     => $workplace ? [
                    'workplace_id'       => $workplace->workplace_id,
                    'office_level_id'    => $workplace->office_level_id,
                    'office_level_name'  => $currentAppointment?->officeLevel?->office_level_name,
                    'name'               => $workplace->office_name,
                    'address'            => $workplace->address,
                    'office'             => $workplaceOffice ? [
                        'id'          => $workplaceOffice->id ?? null,
                        'name'        => $workplaceOffice->name ?? $workplaceOffice->short_name ?? null,
                        'short_name'  => $workplaceOffice->short_name ?? null,
                        'workplace_id'=> $workplaceOffice->workplace_id ?? null,
                    ] : null,
                    'zonal_education_office' => $zonalOffice ? [
                        'id'           => $zonalOffice->id,
                        'name'         => $zonalOffice->name,
                        'short_name'   => $zonalOffice->short_name,
                        'workplace_id' => $zonalOffice->workplace_id,
                    ] : null,
                ] : null,
            ],
        ]);
    }
}
