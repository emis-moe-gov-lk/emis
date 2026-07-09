<?php

namespace App\Auth;


use App\Models\People;
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

        $uuid = $payload->sub ?? null;

        if (! $uuid) {
            Log::warning('JWT user resolution failed: no uuid (sub) claim found');
            return null;
        }

        $uuid = trim((string) $uuid);

        $person = People::where('uuid', $uuid)->first();

        if (! $person) {
            Log::warning('JWT user resolution failed: no matching person for uuid', [
                'uuid' => $uuid,
            ]);
            return null;
        }

        $user = User::where('people_id', $person->people_id)->first();

        if (! $user) {
            Log::warning('JWT user resolution failed: no matching local user for person', [
                'uuid' => $uuid,
                'people_id' => $person->people_id,
            ]);
            return null;
        }

        // Check if user is active locally
        if (! $user->active_status) {
            Log::warning('JWT authentication blocked: user is inactive locally', [
                'uuid' => $uuid,
                'email' => $user->email,
            ]);
            return null;
        }

        // -----------------------------------------------------------------
        // EMERGENCY EMAIL FALLBACK 
        //
        // Legacy email-based resolution, kept here for reference in case the
        // uuid (sub) claim is ever missing from issued tokens  and a hotfix
        // is needed before a proper fix can
        // be deployed. Re-enabling this re-introduces email-based identity
        // resolution, which this change was specifically meant to remove.
        // -----------------------------------------------------------------


        // if (! $person) {
        //     $email = $payload->email
        //         ?? $payload->preferred_username
        //         ?? $payload->upn
        //         ?? $payload->username
        //         ?? null;
        //
        //     if ($email) {
        //         $email = strtolower(trim((string) $email));
        //         $user = User::query()->whereRaw('LOWER(email) = ?', [$email])->first();
        //         $this->request->attributes->set('jwt_email', $email);
        //     }
        // }

        $this->request->attributes->set('jwt_uuid', $uuid);
        $this->request->attributes->set('jwt_people_id', $user->people_id);

        return $this->user = $user;
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
