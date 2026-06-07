<?php

namespace App\Auth;


use App\Models\User;
use Firebase\JWT\JWK;
use Firebase\JWT\JWT;
use GuzzleHttp\Client;
use Illuminate\Auth\GuardHelpers;
use Illuminate\Contracts\Auth\Guard;
use Illuminate\Contracts\Auth\UserProvider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Throwable;

class JwtGuard implements Guard
{
    use GuardHelpers;

    public function __construct(UserProvider $provider, private Request $request) {}

    public function user(): ?\Illuminate\Contracts\Auth\Authenticatable
    {
        if ($this->user !== null) {
            return $this->user;
        }

        $token = $this->bearerToken();

        if (! $token) {
            return null;
        }

        try {
            $keys    = $this->getJwks();
            JWT::$leeway = 60;
            $payload = JWT::decode($token, $keys);
        } catch (Throwable $e) {
            Log::warning('JWT decode failed', [
                'message' => $e->getMessage(),
            ]);

            return null;
        }

        $roles = (array) ($payload->roles ?? []);
        $this->request->attributes->set('jwt_roles', $roles);

        // Primary resolution: the IS user id. The IS apps are configured with
        // subject claim = http://wso2.org/claims/userid (the immutable SCIM
        // UUID), which provisioning persists as identity_provider_user_id.
        $sub = isset($payload->sub) ? trim((string) $payload->sub) : '';

        $user = $sub !== ''
            ? User::query()->where('identity_provider_user_id', $sub)->first()
            : null;

        if (! $user) {
            $user = $this->resolveByEmailClaim($payload, $sub);
        }

        if (! $user) {
            return null;
        }

        $this->request->attributes->set('jwt_email', strtolower((string) $user->email));
        $this->request->attributes->set('jwt_people_id', $user->people_id);

        return $this->user = $user;
    }

    /**
     * Fallback for users that exist in IS but were never linked locally
     * (e.g. created by the ansible playbook, or provisioning ran while IS
     * was unreachable). On a successful match the IS user id is backfilled
     * so every subsequent request resolves by sub.
     */
    private function resolveByEmailClaim(object $payload, string $sub): ?User
    {
        $email = $payload->email
            ?? $payload->preferred_username
            ?? $payload->upn
            ?? $payload->username
            ?? null;

        if (! $email) {
            Log::warning('JWT user resolution failed: sub did not match and no email claim found', [
                'sub' => $sub,
            ]);
            return null;
        }

        $email = strtolower(trim((string) $email));

        $user = User::query()
            ->whereRaw('LOWER(email) = ?', [$email])
            ->first();

        if (! $user) {
            Log::warning('JWT user resolution failed: no matching local user', [
                'sub'   => $sub,
                'email' => $email,
            ]);
            return null;
        }

        if ($sub !== '') {
            Log::info('JWT user resolved by email fallback; backfilling identity_provider_user_id', [
                'sub'       => $sub,
                'people_id' => $user->people_id,
            ]);
            $user->forceFill(['identity_provider_user_id' => $sub])->saveQuietly();
        }

        return $user;
    }

    public function validate(array $credentials = []): bool
    {
        return false;
    }

    private function getJwks(): array
    {
        $jwks = Cache::remember('jwks_keyset', 3600, function () {
            $client = new Client([
                'verify' => config('auth.wso2_verify_ssl'),
            ]);

            $response = $client->get(config('auth.jwks_uri'));

            return json_decode((string) $response->getBody(), true);
        });

        return JWK::parseKeySet($jwks);
    }

    private function bearerToken(): ?string
    {
        $header = $this->request->header('Authorization', '');

        if (str_starts_with($header, 'Bearer ')) {
            return substr($header, 7);
        }

        return null;
    }
}
