<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DistrictsList extends Model
{
    use HasFactory;

    protected $table = 'districts_lists';

    protected $primaryKey = 'id';

    protected $fillable = [
        'district_id',
        'district_code',
        'province_id',
        'district_name',
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
     * Relationship: District belongs to a Province
     */
    public function province()
    {
        return $this->belongsTo(ProvincesList::class, 'province_id', 'province_id');
    }

    public function divisionalSecretariatOffices()
    {
        return $this->hasMany(DivisionalSecretariatOffice::class, 'district_id', 'district_id');
    }

    public function institutions()
    {
        return $this->hasMany(Institution::class, 'district_id', 'district_id');
    }

}
