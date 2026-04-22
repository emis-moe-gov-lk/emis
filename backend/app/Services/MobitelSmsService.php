<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class MobitelSmsService
{
    protected string $url;
    protected string $user;
    protected string $password;
    protected string $alias;

    public function __construct()
    {
        $this->url      = config('services.mobitel.url');
        $this->user     = config('services.mobitel.user');
        $this->password = config('services.mobitel.password');
        $this->alias    = config('services.mobitel.alias');
    }

    /**
     * Send SMS (Unicode supported)
     */
    public function send(string $mobile, string $message): array
    {
        // Normalize Sri Lankan mobile number
        if (preg_match('/^0\d{9}$/', $mobile)) {
            $mobile = '94' . substr($mobile, 1);
        }

        $payload = [
            'u' => $this->user,        // username
            'p' => $this->password,    // password
            'a' => trim($this->alias), // sender alias
            'r' => $mobile,            // recipient
            'm' => $message,           // message
            't' => 0,                  // 0 = Non-Promotional / Unicode
        ];

        $response = Http::asForm()
            ->timeout(30)
            ->post($this->url, $payload);

        return [
            'success' => $response->status() === 200,
            'status'  => $response->status(),
            'body'    => trim($response->body()),
            'payload' => $payload,
        ];
    }
}
