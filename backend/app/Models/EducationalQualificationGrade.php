<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class EducationalQualificationGrade extends Model
{
    use HasFactory;

    protected $table = 'educational_qualification_grades';

    protected $fillable = [
        'grade_id',
        'grade',
        'active_status',
    ];

    protected $casts = [
        'active_status' => 'boolean',
    ];

    /**
     * Automatically generate a unique grade_id when creating a record
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (!$model->grade_id) {
                $model->grade_id = self::generateGradeId();
            }
        });
    }

    /**
     * Generate unique grade_id pattern: GRD0001, GRD0002...
     */
    public static function generateGradeId(): string
    {
        $prefix = 'GRD';

        $latest = self::orderBy('id', 'desc')->first();

        $number = $latest ? ($latest->id + 1) : 1;

        return $prefix . str_pad($number, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Scope for active institution types
     */
    public function scopeActive($query)
    {
        return $query->where('active_status', '1');
    }
}
