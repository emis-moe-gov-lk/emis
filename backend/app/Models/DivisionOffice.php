<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DivisionOffice extends Model
{
    use HasFactory;
    protected $fillable = [
        'deo_id',
        'zone_id',
        'deo_name',
        'deo_short_name',
        'active_status'
    ];

    /**
     * Scope for active institution types
     */
    public function scopeActive($query)
    {
        return $query->where('active_status', '1');
    }
}
