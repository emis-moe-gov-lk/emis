<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Crypt;
use Illuminate\Contracts\Encryption\DecryptException;

class RouteHelper
{
    /**
     * Encrypt route parameter
     */
    public static function enc(mixed $value): string
    {
        return Crypt::encryptString((string) $value);
    }

    /**
     * Decrypt route parameter safely
     */
    public static function dec(string $value): ?string
    {
        try {
            return Crypt::decryptString($value);
        } catch (DecryptException $e) {
            return null; // invalid / tampered value
        }
    }
}
