<?php

namespace App\Helpers;

use Carbon\Carbon;

class NicHelper
{
    /* =====================================================
     | NORMALIZATION
     |===================================================== */

    public static function normalize(string $nic): string
    {
        $nic = trim($nic);
        if ($nic === '') return '';

        // Unicode digits → ASCII digits
        $nic = preg_replace_callback('/\p{Nd}/u', fn($m) => (string) intval($m[0]), $nic);

        // Letters → keep only V / X
        $nic = preg_replace_callback('/\p{L}/u', function ($m) {
            $u = mb_strtoupper($m[0], 'UTF-8');
            return in_array($u, ['V', 'X']) ? $u : '';
        }, $nic);

        // Remove whitespace & zero-width chars
        $nic = preg_replace('/[\s\x{00A0}\x{200B}-\x{200F}]+/u', '', $nic);

        return strtoupper($nic);
    }

    /* =====================================================
     | TYPE & VALIDATION
     |===================================================== */

    public static function getNicType(string $nic): ?string
    {
        $n = self::normalize($nic);

        if (preg_match('/^[0-9]{9}[VX]$/', $n)) return 'old';
        if (preg_match('/^[0-9]{12}$/', $n))   return 'new';

        return null;
    }

    public static function isValid(string $nic): bool
    {
        return self::getNicType($nic) !== null;
    }

    /* =====================================================
     | FORMAT CONVERSION
     |===================================================== */

    /**
     * Convert NIC to canonical NEW format (12 digits).
     * This is the ONLY format used for hashing.
     */
    public static function toNewFormat(string $nic): string
    {
        $n = self::normalize($nic);

        // Already NEW NIC (12 digits)
        if (preg_match('/^[0-9]{12}$/', $n)) {
            return $n;
        }

        // OLD NIC: YYDDDSSSSV/X
        if (preg_match('/^[0-9]{9}[VX]$/', $n)) {

            $yy    = substr($n, 0, 2); // YY
            $ddd   = substr($n, 2, 3); // DDD
            $ssss  = substr($n, 5, 4); // SSSS

            // Pad day-of-year to 4 digits (DDD → DDD0)
            $dddd = str_pad($ddd, 4, '0', STR_PAD_RIGHT);

            // YYYY + DDDD + SSSS = 12 digits
            return '19' . $yy . $dddd . $ssss;
        }

        return '';
    }



    /* =====================================================
     | HASHING (CRITICAL)
     |===================================================== */

    /**
     * Hash NIC using canonical NEW format.
     * Guarantees OLD ↔ NEW duplicate detection.
     */
    public static function hash(string $nic): string
    {
        $canonical = self::toNewFormat($nic);
        return hash('sha256', $canonical);
    }

    /* =====================================================
     | DOB & GENDER EXTRACTION
     |===================================================== */

    public static function extractDetails(string $nic): ?array
    {
        $n = self::normalize($nic);

        try {
            if (strlen($n) === 12) {
                $year = substr($n, 0, 4);
                $day  = intval(substr($n, 4, 3));
            } elseif (strlen($n) === 10) {
                $year = '19' . substr($n, 0, 2);
                $day  = intval(substr($n, 2, 3));
            } else {
                return null;
            }

            $isFemale  = $day > 500;
            $dayOfYear = $isFemale ? $day - 500 : $day;

            if ($dayOfYear < 1 || $dayOfYear > 366) return null;

            $dob = Carbon::createFromFormat(
                'Y z',
                $year . ' ' . ($dayOfYear - 1)
            )->format('Y-m-d');

            return [
                'birthday'  => $dob,
                'gender'    => $isFemale ? 'female' : 'male',
                'gender_id' => $isFemale ? 2 : 1,
            ];
        } catch (\Throwable $e) {
            return null;
        }
    }

    public static function checkNicValid(string $nic): bool
    {
        $type = self::getNicType($nic);

        if ($type === null) {
            return false;
        }

        $details = self::extractDetails($nic);

        return $details !== null;
    }
}
