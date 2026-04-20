<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InstitutionEthnisity extends Model
{
    use HasFactory;

    protected $table = 'institution_ethnisities';

    protected $fillable = [
        'ethnicity_id',
        'ethnicity_name',
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
