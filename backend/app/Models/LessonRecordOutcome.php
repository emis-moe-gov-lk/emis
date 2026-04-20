<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LessonRecordOutcome extends Model
{
    protected $fillable = [
        'lesson_record_id',
        'description',
        'sort_order',
    ];

    public function lessonRecord(): BelongsTo
    {
        return $this->belongsTo(LessonRecord::class);
    }
}
