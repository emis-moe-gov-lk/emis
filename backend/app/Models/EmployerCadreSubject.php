<?php

namespace App\Models;

use App\Models\People;
use App\Traits\Blameable;
use App\Models\SubjectList;
use Spatie\Activitylog\LogOptions;
use App\Models\EmployerAppointment;
use App\Models\MediumOfInstruction;
use Illuminate\Database\Eloquent\Model;
use App\Models\EmployerAppointmentHistory;
use App\Models\EmployerCurrentAppointment;
use Spatie\Activitylog\Traits\LogsActivity;
use App\Models\EmployerAttachmentAppointment;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class EmployerCadreSubject extends Model
{
   use HasFactory, LogsActivity, Blameable;

    protected $table = 'employer_cadre_subjects';
    protected $primaryKey = 'id';

    protected $fillable = [
        'appointment_id',
        'employee_id',
        'appointment_medium',
        'main_subject',
        'created_by',
        'updated_by',
    ];

    /**
     * Relationships
     */

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

    // Medium of instruction
    public function medium()
    {
        return $this->belongsTo(MediumOfInstruction::class, 'appointment_medium', 'medium_id');
    }

    // Main subject
    public function mainSubject()
    {
        return $this->belongsTo(SubjectList::class, 'main_subject', 'subject_id');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->useLogName('teachers')
            ->dontSubmitEmptyLogs();
    }
}
