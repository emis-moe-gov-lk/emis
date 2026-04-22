<?php

namespace App\Rules;

use App\Models\User;
use App\Models\People;
use Illuminate\Contracts\Validation\ValidationRule;

class UniquePhoneAcrossTables implements ValidationRule
{
    protected ?string $ignorePeopleId;

    public function __construct(?string $ignorePeopleId = null)
    {
        $this->ignorePeopleId = $ignorePeopleId;
    }

    public function validate(string $attribute, mixed $value, \Closure $fail): void
    {
        // PEOPLE table check
        $existsInPeople = People::where('phone', $value)
            ->when($this->ignorePeopleId, fn($q) =>
                $q->where('people_id', '!=', $this->ignorePeopleId)
            )
            ->exists();

        // USERS table check
        $existsInUsers = User::where('contact', $value)
            ->when($this->ignorePeopleId, fn($q) =>
                $q->where('people_id', '!=', $this->ignorePeopleId)
            )
            ->exists();

        if ($existsInPeople || $existsInUsers) {
            $fail("The {$attribute} has already been taken.");
        }
    }
}
