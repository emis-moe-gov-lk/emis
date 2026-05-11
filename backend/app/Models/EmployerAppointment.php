<?php

namespace App\Models;

use Carbon\Carbon;
use App\Traits\Blameable;
use Illuminate\Support\Str;
use Spatie\Activitylog\LogOptions;
use Illuminate\Support\Facades\Auth;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class EmployerAppointment extends Model
{
    use HasFactory, LogsActivity, Blameable;

    protected $table = 'employer_appointments'; // optional, Laravel can infer from class name

    protected $primaryKey = 'id'; // if you want to use appointment_id as PK
    public $incrementing = false;             // because appointment_id is a char
    protected $keyType = 'string';

    protected $fillable = [
        'appointment_id',
        'employee_id',
        'first_appointment_date',
        'retirement_date',
        'resign_date',
        'service_id',
        'rank_id',
        'position_id',
        'office_level_id',
        'workplace_id',
        'appointment_letter_no',
        'appointment_letter',
        'pay_sheet_no',
        'w_op_no',
        'is_verified',
        'verified_by',
        'verified_date',
        'is_confirmed',
        'confirmed_by',
        'confirmed_date',
        'active_status',
        'created_by',
        'updated_by',
        'recruitment_category_id',
        'recruitment_subject_id',
    ];

    protected $casts = [
        'first_appointment_date' => 'date',
        'retirement_date' => 'date',
        'resign_date' => 'date',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->appointment_id)) {
                $model->appointment_id = self::generateAppointmentId($model->first_appointment_date);
            }
        });

        static::updating(function ($model) {

            // ============================
            // Auto update verification info
            // ============================
            if ($model->isDirty('is_verified') && in_array((int) $model->is_verified, [1, 2], true) && Auth::check()) {
                $model->verified_by = Auth::user()->people_id;
                $model->verified_date = now();   // automatically set current date/time
            }

            // ============================
            // Auto update confirmation info
            // ============================
            if ($model->isDirty('is_confirmed') && $model->is_confirmed == 1 && Auth::check()) {
                $model->confirmed_by = Auth::user()->people_id;
                $model->confirmed_date = now(); // automatically set current date/time
            }
        });
    }

    /**
     * Scope for active institution types
     */
    public function scopeActive($query)
    {
        return $query->where('active_status', '1');
    }

    /**
     * Generate unique appointment ID
     * Format: AP + Year (2) + Sequence (8)
     */
    public static function generateAppointmentId(string $date): string
    {
        // Extract 2-digit year from given date (e.g., "2025-11-12" → "25")
        $year = date('y', strtotime($date));

        // Find the last inserted appointment for this year
        $last = self::where('appointment_id', 'like', "AP{$year}%")
            ->orderBy('appointment_id', 'desc')
            ->first();

        if ($last) {
            // Extract numeric sequence (last 8 digits)
            $lastNumber = (int) substr($last->appointment_id, -8);
            $nextNumber = str_pad($lastNumber + 1, 8, '0', STR_PAD_LEFT);
        } else {
            $nextNumber = '00000001';
        }

        return "AP{$year}{$nextNumber}"; // e.g., AP2500000123
    }

    // Relationships

    public function employee()
    {
        return $this->belongsTo(People::class, 'employee_id', 'people_id');
    }

    public function confirmedBy()
    {
        return $this->belongsTo(People::class, 'confirmed_by', 'people_id');
    }

    public function verifiedBy()
    {
        return $this->belongsTo(People::class, 'verified_by', 'people_id');
    }

    public function service()
    {
        return $this->belongsTo(Service::class, 'service_id', 'service_id');
    }

    public function rank()
    {
        return $this->belongsTo(ServiceRank::class, 'rank_id', 'rank_id');
    }

    public function position()
    {
        return $this->belongsTo(Position::class, 'position_id', 'position_id');
    }

    public function officeLevel()
    {
        return $this->belongsTo(OfficeLevel::class, 'office_level_id', 'office_level_id');
    }

    public function workplace()
    {
        return $this->belongsTo(Workplaces::class, 'workplace_id', 'workplace_id');
    }

    public function getServiceYearsAttribute()
    {
        if (!$this->first_appointment_date) {
            return null;
        }

        // Use resign_date if it exists and is not empty, otherwise use current date
        $endDate = $this->resign_date ? Carbon::parse($this->resign_date) : Carbon::now();
        $startDate = Carbon::parse($this->first_appointment_date);

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

    public function recruitmentCategory()
    {
        return $this->belongsTo(RecruitmentCategory::class, 'recruitment_category_id', 'category_id');
    }

    public function recruitmentSubject()
    {
        return $this->belongsTo(ApointedSubject::class, 'recruitment_subject_id', 'a_subject_id');
    }

    public function currentAppointment()
    {
        return $this->hasOne(EmployerCurrentAppointment::class, 'appointment_id', 'appointment_id');
    }

    public function appointmentHistory()
    {
        return $this->hasMany(EmployerAppointmentHistory::class, 'appointment_id', 'appointment_id');
    }

    public function rejectComments()
    {
        return $this->hasMany(EmployerAppointmentRejectComment::class, 'employer_appointment_id', 'id')
            ->latest('reject_date');
    }


    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->useLogName('employer_appointments')
            ->dontSubmitEmptyLogs();
    }
}
