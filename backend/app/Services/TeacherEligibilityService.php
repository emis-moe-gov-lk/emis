<?php

namespace App\Services;

use Carbon\Carbon;
use App\Models\EducationQualification;
use Illuminate\Validation\ValidationException;

class TeacherEligibilityService
{
    private const MIN_AGE = 18;
    private const MAX_AGE = 35;

    // In seeded qualifications, rank 10 is Certificate and lower numbers are higher levels.
    private const MAX_ALLOWED_RANK_FOR_MIN_QUALIFICATION = 10;

    public function assertAgeEligible(string $dateOfBirth): void
    {
        $age = Carbon::parse($dateOfBirth)->age;

        if ($age < self::MIN_AGE || $age > self::MAX_AGE) {
            throw ValidationException::withMessages([
                'dateOfBirth' => ['Teacher must be between 18 and 35 years old.'],
            ]);
        }
    }

    public function assertAcademicEligible(array $qualificationIds): void
    {
        $hasCertificateOrAbove = EducationQualification::query()
            ->whereIn('qualifications_id', $qualificationIds)
            ->where('active_status', 1)
            ->whereNotNull('rank')
            ->where('rank', '<=', self::MAX_ALLOWED_RANK_FOR_MIN_QUALIFICATION)
            ->exists();

        if (! $hasCertificateOrAbove) {
            throw ValidationException::withMessages([
                'educationQualifications' => ['At least one certificate-level (or higher) qualification is required.'],
            ]);
        }
    }
}
