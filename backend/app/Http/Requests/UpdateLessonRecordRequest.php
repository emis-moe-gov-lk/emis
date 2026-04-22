<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateLessonRecordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'topic' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'outcomes' => ['nullable', 'array'],
            'outcomes.*.description' => ['required_with:outcomes', 'string', 'max:500'],
            'outcomes.*.sortOrder' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
