<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DivisionalSecretariatOffice extends Model
{
    use HasFactory;

    protected $table = 'divisional_secretariat_offices';

    protected $primaryKey = 'id';

    protected $fillable = [
        'dso_id',
        'district_id',
        'dso_name',
        'active_status',
    ];

    /**
     * Scope for active institution types
     */
    public function scopeActive($query)
    {
        return $query->where('active_status', '1');
    }

    /**
     * Relationship: DSO belongs to a District
     */
    public function district()
    {
        return $this->belongsTo(DistrictsList::class, 'district_id', 'district_id');
    }

    public function gnDivisions()
    {
        return $this->hasMany(GnDivision::class, 'dso_id', 'dso_id');
    }
}
