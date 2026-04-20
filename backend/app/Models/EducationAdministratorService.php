<?php

namespace App\Models;

use App\Traits\Blameable;
use Spatie\Activitylog\LogOptions;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use App\Models\EducationAdministratorServiceSubject;
use App\Models\EducationAdministratorServiceCategory;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class EducationAdministratorService extends Model
{
    use HasFactory, LogsActivity, Blameable;

    protected $table = 'education_administrator_services';

    protected $primaryKey = 'id';

    protected $fillable = [
        'appointment_id',
        'employee_id',
        'category_id',
        'subject',
        'created_by',
        'updated_by',
    ];

    /**
     * Relationships
     */

    // Appointment
    public function appointment()
    {
        return $this->belongsTo(EmployerAppointment::class, 'appointment_id', 'appointment_id');
    }

    // Employee (People)
    public function employee()
    {
        return $this->belongsTo(People::class, 'employee_id', 'people_id');
    }

    // Recruitment Category
    public function recruitmentCategory()
    {
        return $this->belongsTo(EducationAdministratorServiceCategory::class, 'category_id', 'category_id');
    }

    // Subject
    public function serviceSubject()
    {
        return $this->belongsTo(EducationAdministratorServiceSubject::class, 'subject', 'eas_subject_id');
    }

    // Created By User
    public function creator()
    {
        return $this->belongsTo(People::class, 'created_by', 'people_id');
    }

    // Updated By User
    public function updater()
    {
        return $this->belongsTo(People::class, 'updated_by', 'people_id');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->useLogName('principals')
            ->dontSubmitEmptyLogs();
    }
}
