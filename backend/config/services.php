<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'oidc' => [
        'client_id' => env('OIDC_CLIENT_ID'),
        'client_secret' => env('OIDC_CLIENT_SECRET'),
        'redirect' => env('OIDC_REDIRECT_URI'),

        // These are the key differences from a standard Socialite provider.
        // We manually specify the OIDC endpoints.
        'authorize_url' => env('OIDC_AUTHORIZE_URL'),
        'token_url' => env('OIDC_TOKEN_URL'),
        'userinfo_url' => env('OIDC_USERINFO_URL'),
        'end_session_url' => env('OIDC_ENDSESSION_URL'),
        'post_logout_redirect_uri' => env('OIDC_POST_LOGOUT_REDIRECT_URI'),
    ],

    'asgardeo' => [
        'enabled' => env('WSO2_ENABLED', true),
        'client_id' => env('ASGARDEO_MGMT_CLIENT_ID'),
        'client_secret' => env('ASGARDEO_MGMT_CLIENT_SECRET'),
        'token_url' => env('ASGARDEO_MGMT_TOKEN_URL'),
        'scim_base_url' => env('ASGARDEO_SCIM_BASE_URL'),
        'scopes' => env('ASGARDEO_MGMT_SCOPES', 'internal_user_mgt_create internal_user_mgt_update internal_user_mgt_view'),
        'myaccount_url' => env('ASGARDEO_MYACCOUNT_URL', 'https://myaccount.asgardeo.io'),
    ],

];
