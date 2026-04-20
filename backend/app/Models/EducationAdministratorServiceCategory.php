<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EducationAdministratorServiceCategory extends Model
{
    use HasFactory;

    protected $table = 'education_administrator_service_categories';

    protected $primaryKey = 'id';

    protected $fillable = [
        'category_id',
        'category_name',
        'active_status',
    ];

    protected $casts = [
        'active_status' => 'boolean',
    ];

    /**
     * Scope for active institution types
     */
    public function scopeActive($query)
    {
        return $query->where('active_status', '1');
    }
}
