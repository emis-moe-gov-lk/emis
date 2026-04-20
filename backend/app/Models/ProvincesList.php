<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProvincesList extends Model
{
    use HasFactory;

    protected $table = 'provinces_lists';

    protected $primaryKey = 'id';

    protected $fillable = [
        'province_id',
        'province_code',
        'province_name',
        'active_status',
    ];

    // If you want to filter active institutions by default
    public function scopeActive($query)
    {
        return $query->where('active_status', 1);
    }

    public function districts()
    {
        return $this->hasMany(DistrictsList::class, 'province_id', 'province_id');
    }
}
