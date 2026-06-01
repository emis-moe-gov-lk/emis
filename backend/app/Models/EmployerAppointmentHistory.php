<?php

namespace App\Models;

use Carbon\Carbon;

use App\Traits\Blameable;
use Spatie\Activitylog\LogOptions;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class EmployerAppointmentHistory extends Model
{
    use HasFactory, LogsActivity, Blameable;

    protected $table = 'employer_appointment_histories';

    protected $primaryKey = 'id';

    protected $fillable = [
        'appointment_id',
        'employee_id',
        'appoint_date',
        'end_date',
        'service_id',
        'rank_id',
        'position_id',
        'office_level_id',
        'workplace_id',
        'updated_type',
        'appointment_letter_no',
        'remarks',
        'created_by',
        'updated_by',
    ];

    // Relationships

    public function employee()
    {
        return $this->belongsTo(People::class, 'employee_id', 'people_id');
    }

    public function service()
    {
        return $this->belongsTo(Service::class, 'service_id', 'service_id');
    }

    public function rank()
    {
        return $this->belongsTo(ServiceRank::class, 'rank_id', 'rank_id');
    }

    public function officeLevel()
    {
        return $this->belongsTo(OfficeLevel::class, 'office_level_id', 'office_level_id');
    }

    public function position()
    {
        return $this->belongsTo(Position::class, 'position_id', 'position_id');
    }

    public function workplace()
    {
        return $this->belongsTo(Workplaces::class, 'workplace_id', 'workplace_id');
    }

    public function getServicePeriodAttribute()
    {
        if (!$this->appoint_date || !$this->end_date) {
            return null;
        }

        $start = Carbon::parse($this->appoint_date);
        $end   = Carbon::parse($this->end_date);

        // If dates are same
        if ($start->isSameDay($end)) {
            return "0 days";
        }

        // This will give you a human-readable difference
        // Example: "1 year 2 months 3 days"
        $diff = $start->diff($end);

        $period = [];

        if ($diff->y > 0) $period[] = $diff->y . ' year' . ($diff->y > 1 ? 's' : '');
        if ($diff->m > 0) $period[] = $diff->m . ' month' . ($diff->m > 1 ? 's' : '');
        if ($diff->d > 0) $period[] = $diff->d . ' day' . ($diff->d > 1 ? 's' : '');

        if (empty($period)) {
            return "0 days";
        }

        return implode(' ', $period);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->useLogName('employer_appointment_histories')
            ->dontSubmitEmptyLogs();
    }
}
