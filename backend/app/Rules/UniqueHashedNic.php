<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use App\Models\People;
use App\Helpers\NicHelper;

class UniqueHashedNic implements ValidationRule
{
    protected $ignoreId;

    public function __construct($ignoreId = null)
    {
        $this->ignoreId = $ignoreId;
    }

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        // Normalize + validate NIC first
        if (!NicHelper::isValid($value)) {
            $fail('Invalid NIC format.');
            return;
        }

        // Hash canonical NEW NIC (old → new handled inside helper)
        $hashedNic = NicHelper::hash($value);

        $query = People::where('nic_hash', $hashedNic);

        // Ignore current record on update
        if ($this->ignoreId) {
            $query->where('people_id', '!=', $this->ignoreId);
        }

        if ($query->exists()) {
            $fail('The NIC has already been taken.');
        }
    }
}
