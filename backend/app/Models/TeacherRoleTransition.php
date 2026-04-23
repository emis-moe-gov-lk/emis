<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TeacherRoleTransition extends Model
{
    use HasFactory;

    protected $table = 'teacher_role_transitions';

    protected $fillable = [
        'employee_id',
        'user_id',
        'appointment_id',
        'from_role',
        'to_role',
        'changed_by',
        'changed_at',
        'reason',
        'metadata',
    ];

    protected $casts = [
        'changed_at' => 'datetime',
        'metadata' => 'array',
    ];

    public function employee()
    {
        return $this->belongsTo(People::class, 'employee_id', 'people_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }
}
