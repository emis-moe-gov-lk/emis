<?php

namespace App\Rules;

use App\Models\User;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use App\Helpers\NicHelper;

class UniqueHashedNicUser implements ValidationRule
{
    protected $ignoreId;

    /**
     * Optionally ignore a specific user_id (useful for updates)
     */
    public function __construct($ignoreId = null)
    {
        $this->ignoreId = $ignoreId;
    }

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        // 1. Validate NIC format
        if (!NicHelper::isValid($value)) {
            $fail('Invalid NIC format.');
            return;
        }

        // 2. Hash canonical NEW NIC (old → new handled inside helper)
        $hashedNic = NicHelper::hash($value);

        // 3. Check duplicates in users table
        $query = User::where('nic_hash', $hashedNic);

        // 4. Ignore current record on update
        if ($this->ignoreId) {
            $query->where('people_id', '!=', $this->ignoreId); // correct column
        }

        if ($query->exists()) {
            $fail('The NIC has already been taken.');
        }
    }
}
