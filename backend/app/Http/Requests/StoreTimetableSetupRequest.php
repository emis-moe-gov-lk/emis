<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTimetableSetupRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'dayStartTime'          => ['required', 'date_format:H:i'],
            'dayEndTime'            => ['required', 'date_format:H:i', 'after:dayStartTime'],
            'numPeriods'            => ['required', 'integer', 'min:1', 'max:20'],
            'offDays'               => ['sometimes', 'array'],
            'offDays.*'             => ['string', 'in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday'],
            'intervals'             => ['sometimes', 'array'],
            'intervals.*.startTime' => ['required', 'date_format:H:i'],
            'intervals.*.endTime'   => ['required', 'date_format:H:i', 'after:intervals.*.startTime'],
        ];
    }
}
