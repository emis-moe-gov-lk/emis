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
        $email = $payload->email
            ?? $payload->preferred_username
            ?? $payload->upn
            ?? $payload->username
            ?? null;


        if (! $email) {
            Log::warning('JWT user resolution failed: no supported identity claim found');
            return null;
        }

        $email = strtolower(trim((string) $email));

        $user = User::query()
            ->whereRaw('LOWER(email) = ?', [$email])
            ->first();


        if (! $user) {
            Log::warning('JWT user resolution failed: no matching local user', [
                'email' => $email,
            ]);
            return null;
        }

        $this->request->attributes->set('jwt_email', $email);
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
