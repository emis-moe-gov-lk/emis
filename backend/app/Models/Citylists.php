<?php

namespace App\Models;
use App\Models\DistrictsList;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Citylists extends Model
{
    use HasFactory;

    protected $table = 'citylists';

    protected $primaryKey = 'id';

    protected $fillable = [
        'city_id',
        'district_id',
        'city_name_en',
        'city_name_si',
        'city_name_ta',
        'postcode',
        'latitude',
        'longitude',
        'active_status'
    ];

    /**
     * Scope for active institution types
     */
    public function scopeActive($query)
    {
        return $query->where('active_status', '1');
    }

    public function district()
    {
        return $this->belongsTo(DistrictsList::class, 'district_id', 'district_id');
    }
}
