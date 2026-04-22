<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    public function index()
    {
        try {
            $roles = Role::with('permissions:id,name')
                ->orderBy('name')
                ->get(['id', 'name'])
                ->map(fn ($role) => [
                    'id'               => $role->id,
                    'name'             => $role->name,
                    'permissions'      => $role->permissions
                        ->pluck('name')
                        ->groupBy(fn ($p) => explode('.', $p, 2)[0])
                        ->map(fn ($group, $category) => $group
                            ->map(fn ($p) => substr($p, strlen($category) + 1))
                            ->values()
                        ),
                    'permission_count' => $role->permissions->count(),
                ]);

            return response()->json([
                'status' => 'success',
                'data'   => $roles,
            ]);
        } catch (\Throwable $e) {
            Log::error('Roles fetch error', ['message' => $e->getMessage()]);

            return response()->json(['status' => 'error', 'message' => 'Failed to fetch roles'], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'role_name'          => 'required|string',
                'selectedPermissions' => 'required|array|min:1',
                'selectedPermissions.*' => 'string|exists:permissions,name',
            ]);

            $permissionNames = collect($validated['selectedPermissions'])
                ->filter(fn ($name) => is_string($name) && $name !== '')
                ->unique()
                ->values();

            $permissions = Permission::query()
                ->whereIn('name', $permissionNames)
                ->get(['name', 'guard_name']);

            if ($permissions->count() !== $permissionNames->count()) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'One or more selected permissions are invalid.',
                ], 422);
            }

            $guards = $permissions->pluck('guard_name')->unique()->values();

            if ($guards->count() !== 1) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Selected permissions must belong to the same guard.',
                    'errors'  => [
                        'selectedPermissions' => ['Permissions from multiple guards are not allowed.'],
                    ],
                ], 422);
            }

            $guardName = $guards->first();

            if (Role::query()->where('name', $validated['role_name'])->where('guard_name', $guardName)->exists()) {
                return response()->json([
                    'status' => 'error',
                    'errors' => [
                        'role_name' => ['The role name has already been taken for this guard.'],
                    ],
                ], 422);
            }

            $role = Role::create([
                'name'       => $validated['role_name'],
                'guard_name' => $guardName,
            ]);

            $role->syncPermissions($permissions->pluck('name')->values()->all());

            return response()->json([
                'status'  => 'success',
                'message' => 'Role created successfully.',
                'data'    => ['id' => $role->id, 'name' => $role->name],
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['status' => 'error', 'errors' => $e->errors()], 422);
        } catch (\Throwable $e) {
            Log::error('Role create error', ['message' => $e->getMessage()]);

            return response()->json(['status' => 'error', 'message' => 'Failed to create role'], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $role = Role::find($id);

            if (!$role) {
                return response()->json(['status' => 'error', 'message' => 'Role not found'], 404);
            }

            $validated = $request->validate([
                'role_name'             => 'required|string|unique:roles,name,' . $role->id,
                'selectedPermissions'   => 'required|array|min:1',
                'selectedPermissions.*' => 'string|exists:permissions,name',
            ]);

            $role->name = $validated['role_name'];
            $role->save();
            $role->syncPermissions($validated['selectedPermissions']);

            return response()->json([
                'status'  => 'success',
                'message' => 'Role updated successfully.',
                'data'    => ['id' => $role->id, 'name' => $role->name],
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['status' => 'error', 'errors' => $e->errors()], 422);
        } catch (\Throwable $e) {
            Log::error('Role update error', ['message' => $e->getMessage()]);

            return response()->json(['status' => 'error', 'message' => 'Failed to update role'], 500);
        }
    }

    public function getpermissions(){
        try{
            $permissions = Permission::orderBy('name')
                ->pluck('name')
                ->groupBy(fn ($p) => explode('.', $p, 2)[0])
                ->map(fn ($group, $category) => $group
                    ->map(fn ($p) => substr($p, strlen($category) + 1))
                    ->values()
                );

            return response()->json([
                'status' => 'success',
                'data'   => $permissions,
            ]);
        }

        catch (\Throwable $e) {
            Log::error('permission fetch error', ['message' => $e->getMessage()]);
            return response()->json(['status' => 'error', 'message' => 'Failed to fetch permission'], 500);
        }
    }

    public function getuserpermissions($roleid){

        try {

            $role = Role::find($roleid);

            if (!$role){
                return response()->json([
                    'status' => 'error',
                    'message' => 'Invalid role'
                ], 404);
            }

            $permissions = $role->permissions()->get([ 'name']);

            return response()->json([
                'status' => 'success',
                'data'   => [
                    'role_name'   => $role->name,
                    'permissions' => $permissions,
                ],
            ]);
        }
        catch (\Throwable $e) {
            Log::error('permission fetch error', ['message' => $e->getMessage()]);
            return response()->json(['status' => 'error', 'message' => 'Failed to fetch permission'], 500);
        }

    }

    public function destroy($roelid){

        try {
            Role::destroy($roelid);

            return response()->json([
                'status' => 'success',
                'message' => 'role deleted successfully'
            ]);
        }

        catch(\Throwable $e) {
            Log::error('permission delete error', ['message' => $e->getMessage()]);
            return response()->json(['status' => 'error', 'message' => 'Failed to delete permission'], 500);
        }

    }
}
