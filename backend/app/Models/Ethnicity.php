<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ethnicity extends Model
{
     use HasFactory;

    protected $table = 'ethnicities';

    protected $primaryKey = 'id';

    protected $fillable = [
        'ethnicity_id',
        'ethnicity_name',
        'active_status',
    ];

    /**
     * Scope for active institution types
     */
    public function scopeActive($query)
    {
        return $query->where('active_status', '1');
    }
}
