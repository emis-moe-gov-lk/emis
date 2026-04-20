<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class OccupationsList extends Model
{
    use HasFactory;

    protected $table = 'occupations_lists';

    protected $primaryKey = 'id';

    protected $fillable = [
        'occ_id',
        'occ_name_en',
        'occ_name_si',
        'occ_name_ta',
        'active_status',
    ];

    // If you want to filter active institutions by default
    public function scopeActive($query)
    {
        return $query->where('active_status', 1);
    }
}