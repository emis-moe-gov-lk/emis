<?php

namespace App\Models;

use Carbon\Carbon;
use App\Traits\Blameable;
use Spatie\Activitylog\LogOptions;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\DB;

class EmployerCurrentAppointment extends Model
{
    use HasFactory, LogsActivity, Blameable;

    protected $table = 'employer_current_appointments';
    protected $primaryKey = 'id';

    protected $fillable = [
        'appointment_id',
        'employee_id',
        'appoint_date',
        'appointment_letter_no',
        'service_id',
        'rank_id',
        'office_level_id',
        'position_id',
        'workplace_id',
        'created_by',
        'updated_by',
    ];

    /**
     * Casts (dates / native types)
     */
    protected $casts = [
        'appoint_date' => 'date',
    ];

    /**
     * Relationships
     */
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

    // Employer appointment
    public function appointment()
    {
        return $this->belongsTo(EmployerAppointment::class, 'appointment_id', 'appointment_id');
    }

    // Appointment history
    public function appointmentHistory()
    {
        return $this->belongsTo(EmployerAppointmentHistory::class, 'appointment_id', 'appointment_id');
    }

    // Attachment appointment
    public function attachmentAppointment()
    {
        return $this->belongsTo(EmployerAttachmentAppointment::class, 'appointment_id', 'appointment_id');
    }

    public function workplace()
    {
        return $this->belongsTo(Workplaces::class, 'workplace_id', 'workplace_id');
    }

    public function getServiceYearsAttribute()
    {
        if (!$this->appoint_date) {
            return null;
        }

        $endDate = $this->end_date ? Carbon::parse($this->end_date) : Carbon::now();
        $startDate = Carbon::parse($this->appoint_date);

        // Get the exact difference
        $diff = $startDate->diff($endDate);

        // If less than 1 year, show in months/days
        if ($diff->y == 0) {
            if ($diff->m == 0) {
                return $diff->d . ' day' . ($diff->d != 1 ? 's' : '');
            } else {
                // Show months and days if months > 0
                $result = $diff->m . ' month' . ($diff->m != 1 ? 's' : '');
                if ($diff->d > 0) {
                    $result .= ' ' . $diff->d . ' day' . ($diff->d != 1 ? 's' : '');
                }
                return $result;
            }
        }

        // If 1 year or more
        $result = $diff->y . ' year' . ($diff->y != 1 ? 's' : '');

        // Optionally add months if you want
        if ($diff->m > 0) {
            $result .= ' ' . $diff->m . ' month' . ($diff->m != 1 ? 's' : '');
        }

        return $result;
    }

    // Institution
    public function institution()
    {
        return $this->belongsTo(
            Institution::class,
            'workplace_id',   // FK on appointments
            'workplace_id'    // PK on institutions
        );
    }

    public static function serviceByGenderWithTotalCounts()
    {
        return self::query()
            ->join(
                'people',
                'people.people_id',
                '=',
                'employer_current_appointments.employee_id'
            )
            ->select(
                'employer_current_appointments.service_id',

                DB::raw('COUNT(*) as total'),

                DB::raw("SUM(CASE 
                WHEN people.gender_id = 'G01' THEN 1 
                ELSE 0 END) as male"),

                DB::raw("SUM(CASE 
                WHEN people.gender_id = 'G02' THEN 1 
                ELSE 0 END) as female"),

                DB::raw("SUM(CASE 
                WHEN people.gender_id IS NULL 
                     OR people.gender_id NOT IN ('G01','G02') 
                THEN 1 
                ELSE 0 END) as other")
            )
            ->groupBy('employer_current_appointments.service_id')
            ->get();
    }


    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->useLogName('employer_current_appointments')
            ->dontSubmitEmptyLogs();
    }
}
