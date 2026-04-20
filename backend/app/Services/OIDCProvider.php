<?php

namespace App\Services;

use Laravel\Socialite\Two\AbstractProvider;
use Laravel\Socialite\Two\ProviderInterface;
use Laravel\Socialite\Two\User;

class OIDCProvider extends AbstractProvider implements ProviderInterface
{
    /**
     * The OIDC-specific endpoints.
     */
    protected $authUrl;
    protected $tokenUrl;
    protected $userInfoUrl;
    protected $endSessionUrl;
    
    // Add property to store the full token response
    public $tokenResponse;

    public function __construct($request, $clientId, $clientSecret, $redirectUrl, $guzzle = [])
    {
        parent::__construct($request, $clientId, $clientSecret, $redirectUrl, $guzzle);

        // Set the endpoints from our config
        $this->authUrl = config('services.oidc.authorize_url');
        $this->tokenUrl = config('services.oidc.token_url');
        $this->userInfoUrl = config('services.oidc.userinfo_url');
        $this->endSessionUrl = config('services.oidc.end_session_url');
    }

    /**
     * Get the authentication URL for the provider.
     */
    protected function getAuthUrl($state)
    {
        return $this->buildAuthUrlFromBase($this->authUrl, $state);
    }

    /**
     * Get the token URL for the provider.
     */
    protected function getTokenUrl()
    {
        return $this->tokenUrl;
    }

    /**
     * Get the end session URL for the provider.
     */
    public function getEndSessionUrl()
    {
        return $this->endSessionUrl;
    }

    /**
     * Get the authentication parameters.
     */
    protected function getCodeFields($state = null)
    {
        $fields = parent::getCodeFields($state);
        $fields['scope'] = $this->formatScopes($this->getScopes(), $this->scopeSeparator);
        return $fields;
    }

    public function getAccessTokenResponse($code)
    {
        $response = $this->getHttpClient()->post($this->getTokenUrl(), [
            'headers' => ['Accept' => 'application/json'],
            'form_params' => $this->getTokenFields($code),
            'verify' => false,
        ]);

        $this->tokenResponse = json_decode($response->getBody(), true);
        return $this->tokenResponse;
    }

    /**
     * {@inheritdoc}
     */
    public function user()
    {
        if ($this->hasInvalidState()) {
            throw new \InvalidArgumentException;
        }

        // Get the access token response which includes id_token
        $response = $this->getAccessTokenResponse($this->getCode());
        
        // Get user info using the access token
        $user = $this->mapUserToObject($this->getUserByToken(
            $token = $response['access_token']
        ));

        // Return the user with token information
        return $user->setToken($token)
                    ->setRefreshToken($response['refresh_token'] ?? null)
                    ->setExpiresIn($response['expires_in'] ?? null);
    }

    /**
     * Get the raw user for the given access token.
     */
    protected function getUserByToken($token)
    {
        $response = $this->getHttpClient()->get($this->userInfoUrl, [
            'headers' => [
                'Authorization' => 'Bearer '.$token,
                'User-Agent' => 'Laravel Socialite OIDC Provider',
            ],
            'verify' => false,
        ]);

        return json_decode($response->getBody(), true);
    }

    /**
     * Map the raw user array to a Socialite User instance.
     */
    protected function mapUserToObject(array $user)
    {
        return (new User)->setRaw($user)->map([
            'id'       => $user['sub'] ?? $user['id'] ?? null,
            'name'     => $user['name'] ?? $user['preferred_username'] ?? null,
            'email'    => $user['email'] ?? null,
            'avatar'   => $user['picture'] ?? null,
        ]);
    }

    /**
     * Get the default scopes used by the provider.
     */
    protected function getDefaultScopes()
    {
        return ['openid', 'profile', 'email'];
    }

    /**
     * Build the end session URL with parameters
     */
    public function getLogoutUrl($idToken = null, $postLogoutRedirectUri = null)
    {
        $params = [];
        
        if ($idToken) {
            $params['id_token_hint'] = $idToken;
        }
        
        if ($postLogoutRedirectUri) {
            $params['post_logout_redirect_uri'] = $postLogoutRedirectUri;
        }

        return $this->endSessionUrl . (empty($params) ? '' : '?' . http_build_query($params));
    }

    /**
     * Get the ID token from the token response
     */
    public function getIdToken()
    {
        return $this->tokenResponse['id_token'] ?? null;
    }
}