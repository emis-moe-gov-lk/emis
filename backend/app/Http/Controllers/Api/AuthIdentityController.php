<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class AuthIdentityController extends Controller
{
    public function __invoke(Request $request)
    {
        $email = $request->attributes->get('jwt_email');

        $user = User::with('people.gender')->where('email', $email)->first();

        $permissions = $user
            ? $user->getAllPermissions()->pluck('name')->values()->all()
            : [];

        return response()->json([
            'status' => 'success',
            'data'   => [
                'people_id'   => $request->attributes->get('jwt_people_id'),
                'email'       => $email,
                'name'        => $user?->name,
                'gender'      => $user?->people?->gender?->gender_name,
                'roles'       => $request->attributes->get('jwt_roles', []),
                'permissions' => $permissions,
            ],
        ]);
    }
}
