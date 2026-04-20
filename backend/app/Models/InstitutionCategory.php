<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InstitutionCategory extends Model
{
    use HasFactory;

    protected $table = 'institution_categories';

    protected $primaryKey = 'id';

    protected $fillable = [
        'institution_category_id',
        'institution_category_name',
        'description',
        'active_status',
    ];

    /**
     * Scope for only active categories
     */
    public function scopeActive($query)
    {
        return $query->where('active_status', '1');
    }
}
