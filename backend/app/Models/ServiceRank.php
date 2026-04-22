<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ServiceRank extends Model
{
    use HasFactory;

    protected $table = 'service_ranks';
    protected $primaryKey = 'id';

    protected $fillable = [
        'rank_id',
        'service_id',
        'rank_name',
        'description',
        'active_status',
    ];

    // If you want to filter active institutions by default
    public function scopeActive($query)
    {
        return $query->where('active_status', 1);
    }
    /**
     * A Service Rank belongs to a Service.
     */
    public function service()
    {
        return $this->belongsTo(Service::class, 'service_id', 'service_id');
    }
}
