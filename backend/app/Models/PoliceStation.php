<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PoliceStation extends Model
{
    use HasFactory;

    protected $table = 'police_stations';

    protected $primaryKey = 'id';

    protected $fillable = [
        'police_station_id',
        'police_station_name',
        'address',
        'postal_code',
        'phone',
        'email',
        'active_status',
    ];

    // If you want to filter active institutions by default
    public function scopeActive($query)
    {
        return $query->where('active_status', 1);
    }
}
