<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class InstitutionalFacility extends Model
{
    use HasFactory;

    protected $table = 'institutional_facilities';

    protected $fillable = [
        'facilities_id',
        'name',
        'description',
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
