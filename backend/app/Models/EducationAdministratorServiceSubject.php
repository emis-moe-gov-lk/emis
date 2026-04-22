<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EducationAdministratorServiceSubject extends Model
{
    use HasFactory;

    protected $table = 'education_administrator_service_subjects';

    protected $primaryKey = 'id';

    protected $fillable = [
        'eas_subject_id',
        'subject',
        'active_status',
    ];

    protected $casts = [
        'active_status' => 'boolean',
    ];

    /**
     * Scope for active institution types
     */
    public function scopeActive($query)
    {
        return $query->where('active_status', '1');
    }
}
