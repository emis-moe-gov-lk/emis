<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EducationQualification extends Model
{
    use HasFactory;

    protected $table = 'education_qualifications';

    protected $primaryKey = 'id';

    protected $fillable = [
        'qualifications_id',
        'rank',
        'slql',
        'nvql',
        'qualification',
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
