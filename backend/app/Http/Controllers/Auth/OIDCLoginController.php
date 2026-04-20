<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;
use App\Services\OIDCProvider;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class OIDCLoginController extends Controller
{
    /**
     * Redirect the user to the OIDC provider.
     */
    public function redirectToProvider()
    {
        return Socialite::buildProvider(
            OIDCProvider::class,
            config('services.oidc')
        )
            ->scopes(['openid profile email'])
            ->redirect();
    }

    /**
     * Handle callback from OIDC provider.
     */
    public function handleProviderCallback(Request $request)
{
    try {
        // Create the OIDC provider instance
        $provider = Socialite::buildProvider(
            OIDCProvider::class,
            config('services.oidc')
        );

        // Attempt to retrieve the user via OIDC
        $oidcUser = $provider->user();

        // Retrieve ID token if available
        $idToken = $oidcUser->token ?? $oidcUser->id_token ?? null;

        // Find user by email
        $user = User::where('email', $oidcUser->getEmail())->first();

        if (!$user) {
            Log::warning('OIDC login attempt for unknown email: ' . $oidcUser->getEmail());

            return response()->json([
                'message' => 'No account found for this email. Please contact the admin.',
            ], 401);
        }

        Auth::login($user, remember: true);

        if ($idToken) {
            session()->put('oidc_id_token', $idToken);
        }

        return response()->json([
            'message' => 'Login successful',
            'user' => $user,
        ]);
    } catch (\Throwable $e) {
        Log::error('OIDC Authentication failed', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
        ]);

        return response()->json([
            'message' => 'Authentication failed: ' . $e->getMessage(),
        ], 500);
    }
}

    /**
     * Logout and redirect to OIDC endsession.
     */
    public function logout(Request $request)
    {
        // Log out from Laravel
        Auth::logout();

        // Clear all session data
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        // Get the OIDC ID token and post-logout redirect URI
        $idToken = session('oidc_id_token');
        $postLogoutRedirectUri = config('services.oidc.post_logout_redirect_uri', url('/'));

        // Build the OIDC end session URL
        $provider = new OIDCProvider(
            $request,
            config('services.oidc.client_id'),
            config('services.oidc.client_secret'),
            config('services.oidc.redirect')
        );

        $endSessionUrl = $provider->getLogoutUrl($idToken, $postLogoutRedirectUri);

        // Clear OIDC session data
        $request->session()->forget(['oidc_user', 'oidc_id_token']);

        return response()->json([
            'message' => 'Logged out successfully',
            'end_session_url' => $endSessionUrl ?: null,
        ]);
    }
}
