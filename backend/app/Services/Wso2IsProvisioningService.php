<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class Wso2IsProvisioningService
{
    private function isEnabled(): bool
    {
        return (bool) config('services.wso2_is.enabled', false);
    }

    private function baseUrl(): string
    {
        return rtrim((string) config('services.wso2_is.base_url'), '/');
    }

    private function verifySsl(): bool
    {
        return (bool) config('services.wso2_is.verify_ssl', true);
    }

    private function getAccessToken(): string
    {
        $clientId     = (string) config('services.wso2_is.m2m_client_id');
        $clientSecret = (string) config('services.wso2_is.m2m_client_secret');
        $tokenUrl     = $this->baseUrl() . '/oauth2/token';

        if ($clientId === '' || $clientSecret === '') {
            throw new \RuntimeException('WSO2 IS M2M credentials are not configured.');
        }

        $response = Http::withOptions(['verify' => $this->verifySsl()])
            ->asForm()
            ->withBasicAuth($clientId, $clientSecret)
            ->post($tokenUrl, ['grant_type' => 'client_credentials'])
            ->throw()
            ->json();

        $token = $response['access_token'] ?? null;

        if (! is_string($token) || $token === '') {
            throw new \RuntimeException('WSO2 IS M2M token response missing access_token.');
        }

        return $token;
    }

    private function scimRequest(): \Illuminate\Http\Client\PendingRequest
    {
        return Http::withOptions(['verify' => $this->verifySsl()])
            ->withToken($this->getAccessToken())
            ->acceptJson()
            ->asJson();
    }

    private function findUserIdByEmail(string $email): ?string
    {
        $response = $this->scimRequest()
            ->get($this->baseUrl() . '/scim2/Users', [
                'filter' => sprintf('userName eq "%s"', $email),
            ])
            ->throw()
            ->json();

        return $response['Resources'][0]['id'] ?? null;
    }

    private function createScimUser(User $user, string $plainPassword): string
    {
        $response = $this->scimRequest()
            ->post($this->baseUrl() . '/scim2/Users', [
                'schemas'  => ['urn:ietf:params:scim:schemas:core:2.0:User'],
                'userName' => $user->email,
                'password' => $plainPassword,
                'name'     => ['formatted' => $user->name],
                'emails'   => [['value' => $user->email, 'primary' => true]],
                'phoneNumbers' => $user->contact
                    ? [['value' => $user->contact, 'type' => 'mobile']]
                    : [],
                'active' => (bool) $user->active_status,
            ])
            ->throw()
            ->json();

        $isUserId = $response['id'] ?? null;

        if (! is_string($isUserId) || $isUserId === '') {
            throw new \RuntimeException('WSO2 IS user creation succeeded but returned no user ID.');
        }

        return $isUserId;
    }

    private function patchScimUser(string $isUserId, array $operations): void
    {
        $this->scimRequest()
            ->patch($this->baseUrl() . '/scim2/Users/' . $isUserId, [
                'schemas'    => ['urn:ietf:params:scim:api:messages:2.0:PatchOp'],
                'Operations' => $operations,
            ])
            ->throw();
    }

    private function roleIdForRole(string $role): ?string
    {
        $roleIds = (array) config('services.wso2_is.role_ids', []);
        $key     = strtolower(trim($role));

        return $roleIds[$key] ?? null;
    }

    private function assignRoleToUser(string $isUserId, string $roleId): void
    {
        $this->scimRequest()
            ->patch($this->baseUrl() . '/scim2/v2/Roles/' . $roleId, [
                'schemas'    => ['urn:ietf:params:scim:api:messages:2.0:PatchOp'],
                'Operations' => [[
                    'op'    => 'add',
                    'path'  => 'users',
                    'value' => [['value' => $isUserId]],
                ]],
            ])
            ->throw();
    }

    private function removeRoleFromUser(string $isUserId, string $roleId): void
    {
        $this->scimRequest()
            ->patch($this->baseUrl() . '/scim2/v2/Roles/' . $roleId, [
                'schemas'    => ['urn:ietf:params:scim:api:messages:2.0:PatchOp'],
                'Operations' => [[
                    'op'    => 'remove',
                    'path'  => sprintf('users[value eq "%s"]', $isUserId),
                ]],
            ])
            ->throw();
    }

    /**
     * Create (or find) the user in WSO2 IS and assign their role.
     * Called on initial account provisioning for any role.
     */
    public function provisionUser(User $user, string $plainPassword, string $role): array
    {
        if (! $this->isEnabled()) {
            return ['enabled' => false, 'skipped' => true];
        }

        try {
            $isUserId = $this->findUserIdByEmail($user->email);

            if ($isUserId) {
                // User already exists in IS — sync profile instead of creating
                $this->patchScimUser($isUserId, [[
                    'op'    => 'replace',
                    'value' => [
                        'name'         => ['formatted' => $user->name],
                        'phoneNumbers' => $user->contact
                            ? [['value' => $user->contact, 'type' => 'mobile']]
                            : [],
                        'active' => (bool) $user->active_status,
                    ],
                ]]);
                $created = false;
            } else {
                $isUserId = $this->createScimUser($user, $plainPassword);
                $created  = true;
            }

            $roleId         = $this->roleIdForRole($role);
            $roleAssigned   = false;

            if ($roleId) {
                $this->assignRoleToUser($isUserId, $roleId);
                $roleAssigned = true;
            } else {
                Log::warning('WSO2 IS: no role_id configured for role, skipping role assignment', [
                    'role'      => $role,
                    'people_id' => $user->people_id,
                ]);
            }

            // Persist the IS user ID and mark provider
            $user->forceFill([
                'identity_provider'         => 'wso2_is',
                'identity_provider_user_id' => $isUserId,
                'account_provisioned_at'    => now(),
            ])->saveQuietly();

            return [
                'enabled'       => true,
                'provisioned'   => true,
                'created'       => $created,
                'is_user_id'    => $isUserId,
                'role'          => $role,
                'role_assigned' => $roleAssigned,
            ];
        } catch (\Throwable $e) {
            Log::error('WSO2 IS provisioning failed', [
                'people_id' => $user->people_id,
                'email'     => $user->email,
                'role'      => $role,
                'message'   => $e->getMessage(),
            ]);

            return [
                'enabled'     => true,
                'provisioned' => false,
                'error'       => $e->getMessage(),
            ];
        }
    }

    /**
     * Sync name, phone, and active status for an existing IS user.
     */
    public function syncUserProfile(User $user): array
    {
        if (! $this->isEnabled()) {
            return ['enabled' => false, 'skipped' => true];
        }

        $isUserId = $user->identity_provider_user_id;

        if (! $isUserId) {
            return ['enabled' => true, 'skipped' => true, 'reason' => 'no_is_user_id'];
        }

        try {
            $this->patchScimUser($isUserId, [[
                'op'    => 'replace',
                'value' => [
                    'name'         => ['formatted' => $user->name],
                    'phoneNumbers' => $user->contact
                        ? [['value' => $user->contact, 'type' => 'mobile']]
                        : [],
                    'active' => (bool) $user->active_status,
                ],
            ]]);

            return ['enabled' => true, 'synced' => true, 'is_user_id' => $isUserId];
        } catch (\Throwable $e) {
            Log::error('WSO2 IS profile sync failed', [
                'people_id' => $user->people_id,
                'is_user_id' => $isUserId,
                'message'   => $e->getMessage(),
            ]);

            return ['enabled' => true, 'synced' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Swap roles in WSO2 IS when a user transitions between roles (e.g. teacher → principal).
     */
    public function updateUserRole(User $user, string $fromRole, string $toRole): array
    {
        if (! $this->isEnabled()) {
            return ['enabled' => false, 'skipped' => true];
        }

        $isUserId = $user->identity_provider_user_id;

        if (! $isUserId) {
            return ['enabled' => true, 'skipped' => true, 'reason' => 'no_is_user_id'];
        }

        try {
            $fromRoleId = $this->roleIdForRole($fromRole);
            $toRoleId   = $this->roleIdForRole($toRole);

            if ($fromRoleId) {
                $this->removeRoleFromUser($isUserId, $fromRoleId);
            } else {
                Log::warning('WSO2 IS: no role_id for fromRole, skipping removal', [
                    'fromRole'  => $fromRole,
                    'people_id' => $user->people_id,
                ]);
            }

            if ($toRoleId) {
                $this->assignRoleToUser($isUserId, $toRoleId);
            } else {
                Log::warning('WSO2 IS: no role_id for toRole, skipping assignment', [
                    'toRole'    => $toRole,
                    'people_id' => $user->people_id,
                ]);
            }

            return [
                'enabled'         => true,
                'role_updated'    => true,
                'from_role'       => $fromRole,
                'to_role'         => $toRole,
                'from_role_found' => (bool) $fromRoleId,
                'to_role_found'   => (bool) $toRoleId,
            ];
        } catch (\Throwable $e) {
            Log::error('WSO2 IS role update failed', [
                'people_id' => $user->people_id,
                'is_user_id' => $isUserId,
                'fromRole'  => $fromRole,
                'toRole'    => $toRole,
                'message'   => $e->getMessage(),
            ]);

            return ['enabled' => true, 'role_updated' => false, 'error' => $e->getMessage()];
        }
    }
}
