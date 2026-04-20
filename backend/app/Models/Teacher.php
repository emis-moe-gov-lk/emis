<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Blameable;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Teacher extends  \Illuminate\Foundation\Auth\User
{
    use HasFactory, LogsActivity, Blameable;

    protected $table = 'teachers';
    protected $primaryKey = 'id';

    protected $fillable = [
        'appointment_id',
        'employee_id',
        'teacher_category',
        'teacher_type',
        'appointment_medium',
        'appointment_subject',
        'main_subject',
        'secondary_subject',
        'current_teaching_subject',
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

    // Teacher category
    public function teacherCategory()
    {
        return $this->belongsTo(TeacherCategory::class, 'teacher_category', 'categories_id');
    }

    // Teacher type
    public function teacherType()
    {
        return $this->belongsTo(TeacherType::class, 'teacher_type', 'teacher_types_id');
    }

    // Medium of instruction
    public function medium()
    {
        return $this->belongsTo(MediumOfInstruction::class, 'appointment_medium', 'medium_id');
    }

    // Appointment subject
    public function appointmentSubject()
    {
        return $this->belongsTo(ApointedSubject::class, 'appointment_subject', 'a_subject_id');
    }

    // Main subject
    public function mainSubject()
    {
        return $this->belongsTo(SubjectList::class, 'main_subject', 'subject_id');
    }

    // Secondary subject
    public function secondarySubject()
    {
        return $this->belongsTo(SubjectList::class, 'secondary_subject', 'subject_id');
    }

    // Current teaching subject
    public function currentTeachingSubject()
    {
        return $this->belongsTo(SubjectList::class, 'current_teaching_subject', 'subject_id');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->useLogName('teachers')
            ->dontSubmitEmptyLogs();
    }


    // added for the timetable feature

    public function timetableConfig(): HasOne
    {
        return $this->hasOne(TeacherTimetableConfig::class);
    }
}
