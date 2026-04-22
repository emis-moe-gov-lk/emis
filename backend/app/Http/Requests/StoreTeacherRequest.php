<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTeacherRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100', 'unique:teachers,name'],
            'dayStartTime' => ['required', 'date_format:H:i'],
            'dayEndTime' => ['required', 'date_format:H:i', 'after:dayStartTime'],
            'numPeriods' => ['required', 'integer', 'min:1', 'max:20'],
            'intervals' => ['nullable', 'array'],
            'intervals.*.startTime' => ['required_with:intervals', 'date_format:H:i'],
            'intervals.*.endTime' => ['required_with:intervals', 'date_format:H:i', 'after:intervals.*.startTime'],
            'offDays' => ['nullable', 'array'],
            'offDays.*' => ['string', 'in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday'],
        ];
    }
}
