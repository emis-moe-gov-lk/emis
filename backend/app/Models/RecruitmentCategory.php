<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RecruitmentCategory extends Model
{
    use HasFactory;

    protected $table = 'recruitment_categories';

    protected $primaryKey = 'id';

    protected $fillable = [
        'category_id',
        'category_name',
        'active_status',
    ];

    protected $casts = [
        'active_status' => 'boolean',
    ];

    public function scopeActive($query)
    {
        return $query->where('active_status', true);
    }
}
