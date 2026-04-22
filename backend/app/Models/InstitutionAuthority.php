<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InstitutionAuthority extends Model
{
    use HasFactory;

    protected $table = 'institution_authorities';

    protected $primaryKey = 'id';

    protected $fillable = [
        'authority_id',
        'authority_name',
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
