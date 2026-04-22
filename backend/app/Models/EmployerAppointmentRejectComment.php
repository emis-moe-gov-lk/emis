<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmployerAppointmentRejectComment extends Model
{
    use HasFactory;

    protected $table = 'employer_appointment_reject_comments';

    protected $fillable = [
        'employer_appointment_id',
        'people_id',
        'rejected_people_id',
        'reject_comment',
        'reject_date',
    ];

    protected $casts = [
        'reject_date' => 'datetime',
    ];

    public function appointment()
    {
        return $this->belongsTo(EmployerAppointment::class, 'employer_appointment_id', 'id');
    }

    public function rejectedBy()
    {
        return $this->belongsTo(People::class, 'people_id', 'people_id');
    }

    public function rejectedProfile()
    {
        return $this->belongsTo(People::class, 'rejected_people_id', 'people_id');
    }
}
