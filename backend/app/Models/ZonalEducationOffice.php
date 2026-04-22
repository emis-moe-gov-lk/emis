<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\DB;

class ZonalEducationOffice extends Model
{
    use HasFactory;

    protected $table = 'zonal_education_offices';

    protected $primaryKey = 'id';
    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = [
        'workplace_id',
        'peo_wp_id',
        'district_id',
        'name',
        'short_name',
        'email',
        'phone',
        'address',
        'postal_code',
        'latitude',
        'longitude',
        'active_status',
    ];

    // If you want to filter active institutions by default
    public function scopeActive($query)
    {
        return $query->where('active_status', 1);
    }

    /**
     * Each Zonal Education Office belongs to a Provincial Education Office
     */
    public function provincialEducationOffice()
    {
        return $this->belongsTo(
            ProvincialEducationOffice::class,
            'peo_wp_id',   // foreign key on this table
            'workplace_id' // referenced key in provincial_education_offices
        );
    }

    /**
     * Each Zonal Education Office belongs to a District
     */
    public function district()
    {
        return $this->belongsTo(
            DistrictsList::class,
            'district_id', // foreign key
            'district_id'  // primary/unique key in districts_lists
        );
    }

    /**
     * Staff directly working in ZEO
     */
    public function staffList()
    {
        return $this->hasMany(
            EmployerCurrentAppointment::class,
            'workplace_id',
            'workplace_id'
        );
    }

    /**
     * Institutions under this ZEO
     */
    public function institutions()
    {
        return $this->hasMany(
            Institution::class,
            'zeo_wp_id',
            'workplace_id'
        );
    }

    public static function employeeCountByServiceGroupedByZeoUsingWorkplaces(string $peoWpId)
    {
        $zeos = self::where('peo_wp_id', $peoWpId)
            ->where('active_status', 1)
            ->get(['id', 'name', 'workplace_id']);

        $result = collect();

        foreach ($zeos as $zeo) {

            $workplace = Workplaces::where('workplace_id', $zeo->workplace_id)->first();

            if (!$workplace) {
                continue;
            }

            // ZEO + ALL child workplaces
            $workplaceIds = collect($workplace->getAllChildWorkplaces())
                ->unique()
                ->values()
                ->all();

            // COUNT DISTINCT employees per service (with service name)
            $counts = EmployerCurrentAppointment::query()
                ->join(
                    'services',
                    'services.service_id',
                    '=',
                    'employer_current_appointments.service_id'
                )
                ->whereIn('employer_current_appointments.workplace_id', $workplaceIds)
                ->select(
                    'services.service_name',
                    DB::raw('COUNT(DISTINCT CONCAT(
                    employer_current_appointments.employee_id,
                    "-",
                    employer_current_appointments.service_id
                )) as total')
                )
                ->groupBy('services.service_name')
                ->pluck('total', 'service_name')
                ->toArray();

            $result[$zeo->name] = $counts;
        }

        return $result;
    }
}
