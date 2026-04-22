<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class GradeSpan extends Model
{
    use HasFactory;

    protected $table = 'grade_spans';

    protected $primaryKey = 'id';

    protected $fillable = [
        'grade_span_id',
        'grade_span_name',
        'start_grade',
        'end_grade',
        'active_status',
    ];

    /**
     * Scope for active institution types
     */
    public function scopeActive($query)
    {
        return $query->where('active_status', '1');
    }
}
