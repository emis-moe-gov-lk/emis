<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Blameable;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class PeopleEducationQualification extends Model
{
    use HasFactory, LogsActivity, Blameable;

    protected $table = 'people_education_qualifications';

    protected $fillable = [
        'people_id',
        'qualifications_id',
        'institution',
        'effective_date',
        'grade',
        'description',
        'active_status',
        'created_by',
        'updated_by',
    ];

    // If you want to filter active institutions by default
    public function scopeActive($query)
    {
        return $query->where('active_status', 1);
    }
    
    /**
     * Relationships
     */

    // A qualification belongs to one person
    public function person()
    {
        return $this->belongsTo(People::class, 'people_id', 'people_id');
    }

    // A qualification references one education qualification type
    public function qualification()
    {
        return $this->belongsTo(EducationQualification::class, 'qualifications_id', 'qualifications_id');
    }

    public function qualificationGrade()
    {
        return $this->belongsTo(EducationalQualificationGrade::class, 'grade', 'grade_id');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->useLogName('people_education_qualifications')
            ->dontSubmitEmptyLogs();
    }
}
