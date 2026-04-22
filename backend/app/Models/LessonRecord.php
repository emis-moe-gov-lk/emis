<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LessonRecord extends Model
{
    protected $fillable = [
        'teacher_id',
        'slot_id',
        'date',
        'topic',
        'description',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
        ];
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class);
    }

    public function slot(): BelongsTo
    {
        return $this->belongsTo(Slot::class);
    }

    public function outcomes(): HasMany
    {
        return $this->hasMany(LessonRecordOutcome::class)->orderBy('sort_order');
    }
}
