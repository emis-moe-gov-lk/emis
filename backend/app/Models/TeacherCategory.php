<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TeacherCategory extends Model
{
    use HasFactory;

    protected $table = 'teacher_categories';

    protected $primaryKey = 'id';

    protected $fillable = [
        'categories_id',
        'name',
        'description',
        'active_status',
    ];

    // If you want to filter active institutions by default
    public function scopeActive($query)
    {
        return $query->where('active_status', 1);
    }
}
