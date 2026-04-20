<?php

namespace App\Http\Requests;

use Carbon\Carbon;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;

class TeacherReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'start_date' => ['required', 'date', 'before_or_equal:end_date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $v) {
            if ($this->start_date && $this->end_date) {
                $diff = Carbon::parse($this->start_date)->diffInDays(Carbon::parse($this->end_date));
                if ($diff > 31) {
                    $v->errors()->add('end_date', 'Date range must not exceed 31 days.');
                }
            }
        });
    }
}
