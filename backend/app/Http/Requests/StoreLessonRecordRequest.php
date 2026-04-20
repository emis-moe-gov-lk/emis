<?php

namespace App\Http\Requests;

use App\Models\LessonRecord;
use App\Models\Slot;
use App\Models\Teacher;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class StoreLessonRecordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'slotId' => ['required', 'exists:slots,id'],
            'date' => ['required', 'date_format:Y-m-d'],
            'topic' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'outcomes' => ['nullable', 'array'],
            'outcomes.*.description' => ['required_with:outcomes', 'string', 'max:500'],
            'outcomes.*.sortOrder' => ['nullable', 'integer', 'min:0'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $v) {
            $teacher = Teacher::where('employee_id', Auth::user()->people_id)->first();
            $config = $teacher?->timetableConfig;

            $slot = Slot::find($this->slotId);
            if ($slot && $config && $slot->teacher_id !== $config->id) {
                $v->errors()->add('slotId', 'This slot does not belong to this teacher.');
            }

            $exists = LessonRecord::where('slot_id', $this->slotId)
                ->where('date', $this->date)
                ->exists();

            if ($exists) {
                $v->errors()->add('date', 'A record already exists for this slot on this date.');
            }
        });
    }
}
