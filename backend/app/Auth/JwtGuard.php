<?php

namespace App\Auth;


use App\Models\User;
use Firebase\JWT\JWK;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
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
            JWT::$leeway = 60;
            $payload = $this->decodeWithFallback($token);
        } catch (Throwable $e) {
            Log::warning('JWT decode failed', [
                'message' => $e->getMessage(),
            ]);

            return null;
        }

        $roles = (array) ($payload->roles ?? []);
        $this->request->attributes->set('jwt_roles', $roles);
        // WSO2 IS 7.x puts the subject identifier in `sub`; when the app is
        // configured to use emailaddress as subject, `sub` = user email.
        $email = $payload->email
            ?? $payload->preferred_username
            ?? $payload->upn
            ?? $payload->username
            ?? (filter_var($payload->sub ?? '', FILTER_VALIDATE_EMAIL) ? $payload->sub : null)
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

    // APIM signs its backend JWT with wso2carbon.jks, whose key is NOT in the
    // standard JWKS endpoint.  When APIM_GATEWAY_PUBKEY is set, we decode the
    // JWT header first (without verification) to check the issuer, then pick
    // the right key: APIM cert for "wso2.org/products/am", IS JWKS for others.
    private function decodeWithFallback(string $token): object
    {
        $apimPubKeyB64 = config('auth.apim_gateway_pubkey');

        if ($apimPubKeyB64) {
            $parts = explode('.', $token);
            if (count($parts) === 3) {
                $payloadRaw = $parts[1];
                $payloadRaw .= str_repeat('=', (4 - strlen($payloadRaw) % 4) % 4);
                $payload = json_decode(base64_decode(strtr($payloadRaw, '-_', '+/')));
                if (($payload->iss ?? '') === 'wso2.org/products/am') {
                    $pem = base64_decode($apimPubKeyB64);
                    return JWT::decode($token, new Key($pem, 'RS256'));
                }
            }
        }

        return JWT::decode($token, $this->getJwks());
    }

    private function getRawJwks(): array
    {
        return Cache::remember('jwks_keyset', 3600, function () {
            $client = new Client([
                'verify' => config('auth.wso2_verify_ssl'),
            ]);

            $response = $client->get(config('auth.jwks_uri'));

            return json_decode((string) $response->getBody(), true);
        });
    }

    private function getJwks(): array
    {
        return JWK::parseKeySet($this->getRawJwks());
    }

    private function bearerToken(): ?string
    {
        // APIM X-JWT-Assertion (operation policy path — future use)
        $assertion = $this->request->header('X-JWT-Assertion', '');
        if ($assertion !== '') {
            return $assertion;
        }

        $header = $this->request->header('Authorization', '');

        // APIM backend JWT is forwarded without "Bearer " prefix
        if (str_starts_with($header, 'eyJ')) {
            return $header;
        }

        // Direct IS access token from browser carries "Bearer " prefix
        if (str_starts_with($header, 'Bearer ')) {
            return substr($header, 7);
        }

        return null;
    }
}
