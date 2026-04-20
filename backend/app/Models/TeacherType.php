<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TeacherType extends Model
{
    use HasFactory;

    protected $table = 'teacher_types';

    protected $primaryKey = 'id';

    protected $fillable = [
        'teacher_types_id',
        'type_name',
        'active_status',
    ];

    // If you want to filter active institutions by default
    public function scopeActive($query)
    {
        return $query->where('active_status', 1);
    }
}
