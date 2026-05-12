<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmployeeAdministration extends Model
{
    protected $table = 'employee_administrations';

    protected $fillable = [
        'appointment_id',
        'employee_id',
        'recruitment_category_id',
        'recruitment_subject_id',
    ];

    public function appointment()
    {
        return $this->belongsTo(EmployerAppointment::class, 'appointment_id', 'appointment_id');
    }

    public function people()
    {
        return $this->belongsTo(People::class, 'employee_id', 'people_id');
    }

    public function recruitmentCategory()
    {
        return $this->belongsTo(RecruitmentCategory::class, 'recruitment_category_id', 'category_id');
    }

    public function recruitmentSubject()
    {
        return $this->belongsTo(ApointedSubject::class, 'recruitment_subject_id', 'a_subject_id');
    }
}
