<?php

namespace App\Services;

use App\Contracts\IdentityProvisioningServiceInterface;
use App\Models\User;
use Illuminate\Support\Facades\Http;

class AsgardeoIdentityProvisioningService implements IdentityProvisioningServiceInterface
{
    public function provisionTeacher(User $user, string $plainPassword, bool $resetPassword = false): array
    {
        if (! $this->isEnabled()) {
            return [
                'provider' => 'asgardeo',
                'enabled' => false,
                'provisioned' => false,
                'skipped' => true,
            ];
        }

        $existingId = $user->identity_provider_user_id ?: $this->findUserIdByUsername($user->email);

        if ($existingId) {
            $response = $this->patchUser($existingId, $this->buildProfilePatch($user));

            if ($resetPassword) {
                $this->patchUser($existingId, $this->buildPasswordPatch($plainPassword));
            }

            return [
                'provider' => 'asgardeo',
                'enabled' => true,
                'provisioned' => true,
                'created' => false,
                'user_id' => $response['id'] ?? $existingId,
            ];
        }

        $response = $this->usersRequest()
            ->post('', $this->buildCreatePayload($user, $plainPassword))
            ->throw()
            ->json() ?? [];

        return [
            'provider' => 'asgardeo',
            'enabled' => true,
            'provisioned' => true,
            'created' => true,
            'user_id' => $response['id'] ?? null,
        ];
    }

    public function syncTeacherProfile(User $user): array
    {
        if (! $this->isEnabled()) {
            return [
                'provider' => 'asgardeo',
                'enabled' => false,
                'synced' => false,
                'skipped' => true,
            ];
        }

        $existingId = $user->identity_provider_user_id ?: $this->findUserIdByUsername($user->email);

        if (! $existingId) {
            return [
                'provider' => 'asgardeo',
                'enabled' => true,
                'synced' => false,
                'missing_remote_user' => true,
            ];
        }

        $response = $this->patchUser($existingId, $this->buildProfilePatch($user));

        return [
            'provider' => 'asgardeo',
            'enabled' => true,
            'synced' => true,
            'user_id' => $response['id'] ?? $existingId,
        ];
    }

    private function buildCreatePayload(User $user, string $plainPassword): array
    {
        return [
            'schemas' => [
                'urn:ietf:params:scim:schemas:core:2.0:User',
            ],
            'userName' => $user->email,
            'password' => $plainPassword,
            'active' => (bool) $user->active_status,
            'name' => [
                'formatted' => $user->name,
            ],
            'emails' => [
                [
                    'value' => $user->email,
                    'primary' => true,
                ],
            ],
            'phoneNumbers' => $user->contact ? [
                [
                    'value' => $user->contact,
                    'type' => 'mobile',
                ],
            ] : [],
        ];
    }

    private function buildProfilePatch(User $user): array
    {
        return [
            'schemas' => [
                'urn:ietf:params:scim:api:messages:2.0:PatchOp',
            ],
            'Operations' => [
                [
                    'op' => 'replace',
                    'value' => [
                        'userName' => $user->email,
                        'active' => (bool) $user->active_status,
                        'name' => [
                            'formatted' => $user->name,
                        ],
                        'emails' => [
                            [
                                'value' => $user->email,
                                'primary' => true,
                            ],
                        ],
                        'phoneNumbers' => $user->contact ? [
                            [
                                'value' => $user->contact,
                                'type' => 'mobile',
                            ],
                        ] : [],
                    ],
                ],
            ],
        ];
    }

    private function buildPasswordPatch(string $plainPassword): array
    {
        return [
            'schemas' => [
                'urn:ietf:params:scim:api:messages:2.0:PatchOp',
            ],
            'Operations' => [
                [
                    'op' => 'replace',
                    'value' => [
                        'password' => $plainPassword,
                    ],
                ],
            ],
        ];
    }

    private function findUserIdByUsername(string $email): ?string
    {
        $response = $this->usersRequest()
            ->get('', [
                'filter' => sprintf('userName eq "%s"', $email),
            ])
            ->throw()
            ->json();

        return $response['Resources'][0]['id'] ?? null;
    }

    private function patchUser(string $userId, array $payload): array
    {
        return $this->usersRequest()
            ->withHeaders(['Content-Type' => 'application/json'])
            ->patch($userId, $payload)
            ->throw()
            ->json() ?? [];
    }

    private function usersRequest()
    {
        return Http::baseUrl(rtrim((string) config('services.asgardeo.scim_base_url'), '/') . '/')
            ->withToken($this->getAccessToken())
            ->acceptJson()
            ->asJson();
    }

    private function getAccessToken(): string
    {
        $tokenUrl = (string) config('services.asgardeo.token_url');
        $clientId = (string) config('services.asgardeo.client_id');
        $clientSecret = (string) config('services.asgardeo.client_secret');
        $scope = (string) config('services.asgardeo.scopes');

        if ($tokenUrl === '' || $clientId === '' || $clientSecret === '') {
            throw new \RuntimeException('Asgardeo management API configuration is incomplete.');
        }

        $response = Http::asForm()
            ->withBasicAuth($clientId, $clientSecret)
            ->post($tokenUrl, [
                'grant_type' => 'client_credentials',
                'scope' => $scope,
            ])
            ->throw()
            ->json();

        $accessToken = $response['access_token'] ?? null;

        if (! is_string($accessToken) || $accessToken === '') {
            throw new \RuntimeException('Failed to obtain Asgardeo management access token.');
        }

        return $accessToken;
    }

    private function isEnabled(): bool
    {
        return (bool) config('services.asgardeo.enabled', false);
    }
}
