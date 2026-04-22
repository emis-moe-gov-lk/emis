<?php

namespace App\Rules;

use App\Models\User;
use App\Models\People;
use Illuminate\Contracts\Validation\ValidationRule;

class UniqueEmailAcrossTables implements ValidationRule
{
    protected ?string $ignorePeopleId;

    public function __construct(?string $ignorePeopleId = null)
    {
        $this->ignorePeopleId = $ignorePeopleId;
    }

    /**
     * Run the validation rule.
     *
     * @param  \Closure(string, ?string=): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, \Closure $fail): void
    {
        // Check PEOPLE table
        $existsInPeople = People::where('email', $value)
            ->when(
                $this->ignorePeopleId,
                fn($q) =>
                $q->where('people_id', '!=', $this->ignorePeopleId)
            )
            ->exists();

        // Check USERS table
        $existsInUsers = User::where('email', $value)
            ->when(
                $this->ignorePeopleId,
                fn($q) =>
                $q->where('people_id', '!=', $this->ignorePeopleId)
            )
            ->exists();

        if ($existsInPeople || $existsInUsers) {
            $fail("The {$attribute} has already been taken.");
        }
    }
}
