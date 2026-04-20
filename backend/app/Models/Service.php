<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Service extends Model
{
    use HasFactory;

    protected $table = 'services';
    protected $primaryKey = 'id';

    protected $fillable = [
        'service_id',
        'service_name',
        'description',
        'rank',
        'is_gov_service',
        'active_status',
    ];

    // protected static function booted()
    // {
    //     static::creating(function ($model) {
    //         if (is_null($model->is_gov_service)) {
    //             $model->is_gov_service = 1;
    //         }
    //     });
    // }

    // If you want to filter active institutions by default
    public function scopeActive($query)
    {
        return $query->where('active_status', 1);
    }

    // If you want to filter active institutions by default
    public function scopeGovService($query)
    {
        return $query->where('is_gov_service', 1);
    }

    /**
     * A Service has many Positions.
     */
    public function positions()
    {
        return $this->hasMany(Position::class, 'service_id', 'service_id');
    }

    /**
     * Get ALL services with employee count (hierarchy-aware)
     */
    public static function withEmployeeCounts()
    {
        return DB::table('services as s')
            ->leftJoin('employer_appointments as ea', function ($join) {
                $join->on('s.service_id', '=', 'ea.service_id');
            })
            ->where('s.active_status', 1)
            ->select(
                's.service_id',
                's.name',
                DB::raw('COUNT(ea.employee_id) as employee_count')
            )
            ->groupBy('s.service_id', 's.name')
            ->orderByDesc('employee_count')
            ->get();
    }
}
