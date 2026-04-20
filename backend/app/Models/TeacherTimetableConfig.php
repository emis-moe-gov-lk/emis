<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TeacherTimetableConfig extends Model
{
    protected $fillable = [
        'teacher_id', 'day_start_time', 'day_end_time', 'num_periods', 'off_days',
    ];

    protected function casts(): array
    {
        return [
            'day_start_time' => 'datetime:H:i',
            'day_end_time'   => 'datetime:H:i',
            'num_periods'    => 'integer',
            'off_days'       => 'array',
        ];
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class);
    }

    public function periods(): HasMany   { return $this->hasMany(Period::class, 'teacher_id'); }
    public function intervals(): HasMany { return $this->hasMany(Interval::class, 'teacher_id'); }
    public function slots(): HasMany     { return $this->hasMany(Slot::class, 'teacher_id'); }
    public function subjectColors(): HasMany { return $this->hasMany(SubjectColor::class, 'teacher_id'); }
    public function holidays(): HasMany  { return $this->hasMany(TeacherHoliday::class, 'teacher_id'); }
    public function lessonRecords(): HasMany { return $this->hasMany(LessonRecord::class, 'teacher_id'); }
}
