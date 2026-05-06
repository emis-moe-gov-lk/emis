<?php

namespace App\Http\Requests;

use App\Models\Period;
use App\Models\Slot;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class StoreSlotRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'day' => ['required', 'in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday'],
            'periodId' => ['required', 'exists:periods,id'],
            'subject' => ['required', 'string', 'exists:subject_lists,name_en'],
            'class' => ['required', 'string', 'max:50'],
            'students' => ['required', 'integer', 'min:0'],
            'purpose' => ['nullable', 'string', 'max:255'],
            'date' => ['nullable', 'date'],
            'comments' => ['nullable', 'array'],
            'comments.*.text' => ['required_with:comments', 'string', 'max:255'],
            'comments.*.date' => ['required_with:comments', 'date'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $v) {
            $config = Auth::user()->teacher?->timetableConfig;

            if (! $config) {
                $v->errors()->add('general', 'Timetable not configured.');

                return;
            }

            // Ensure the period belongs to the authenticated teacher
            $period = Period::find($this->periodId);
            if ($period && $period->teacher_id !== $config->id) {
                $v->errors()->add('periodId', 'This period does not belong to your timetable.');

                return;
            }

            if ($this->date) {
                return; // Special slots use the DB unique constraint
            }

            $exists = Slot::where('teacher_id', $config->id)
                ->where('day', $this->day)
                ->where('period_id', $this->periodId)
                ->whereNull('date')
                ->exists();

            if ($exists) {
                $v->errors()->add('day', 'A regular class already exists for this day and period.');
            }
        });
    }
}
