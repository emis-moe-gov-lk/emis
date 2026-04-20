<?php

namespace App\Models;

use App\Traits\Blameable;
use Spatie\Activitylog\LogOptions;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use App\Models\PrincipalRecruitmentCategory;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Principal extends Model
{
    use HasFactory, LogsActivity, Blameable;

    protected $table = 'principals';

    protected $primaryKey = 'id';

    protected $fillable = [
        'appointment_id',
        'employee_id',
        'recruitment_category',
        'created_by',
        'updated_by',
    ];



    // Employer appointment
    public function appointment()
    {
        return $this->belongsTo(EmployerAppointment::class, 'appointment_id', 'appointment_id');
    }

    // Current appointment
    public function currentAppointment()
    {
        return $this->belongsTo(EmployerCurrentAppointment::class, 'appointment_id', 'appointment_id');
    }

    // Appointment history
    public function appointmentHistory()
    {
        return $this->belongsTo(EmployerAppointmentHistory::class, 'appointment_id', 'appointment_id');
    }

    // Attachment appointment
    public function attachmentAppointment()
    {
        return $this->belongsTo(EmployerAttachmentAppointment::class, 'appointment_id', 'appointment_id');
    }

    // Related person (employee)
    public function employee()
    {
        return $this->belongsTo(People::class, 'employee_id', 'people_id');
    }

    // Related recruitment category
    public function recruitmentCategory()
    {
        return $this->belongsTo(PrincipalRecruitmentCategory::class, 'recruitment_category', 'category_id');
    }

    // Created by
    public function creator()
    {
        return $this->belongsTo(People::class, 'created_by', 'people_id');
    }

    // Updated by
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
