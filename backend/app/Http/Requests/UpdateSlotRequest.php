<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSlotRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'subject' => ['sometimes', 'required', 'string', 'exists:subject_lists,name_en'],
            'class' => ['sometimes', 'required', 'string', 'max:50'],
            'students' => ['sometimes', 'required', 'integer', 'min:0'],
            'purpose' => ['nullable', 'string', 'max:255'],
            'comments' => ['nullable', 'array'],
            'comments.*.text' => ['required_with:comments', 'string', 'max:255'],
            'comments.*.date' => ['required_with:comments', 'date'],
        ];
    }
}
