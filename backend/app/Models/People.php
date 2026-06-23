<?php

namespace App\Models;

use Carbon\Carbon;
use App\Traits\Blameable;
use App\Helpers\NicHelper;
use Spatie\Activitylog\LogOptions;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class People extends Model
{
    use HasFactory, LogsActivity, Blameable;

    protected $table = 'people';

    protected $fillable = [
        'people_id',
        'uuid',
        'nic',
        'nic_hash',
        'title_id',
        'full_name',
        'name_with_initials',
        'gender_id',
        'date_of_birth',
        'religion_id',
        'ethnicity_id',
        'civil_status_id',
        'health_condition',
        'health_problem',
        'blood_group_id',
        'email',
        'phone',
        'district_id',
        'ds_office_id',
        'gn_division_id',
        'address_line1',
        'address_line2',
        'address_line3',
        'postal_code',
        'latitude',
        'longitude',

        't_address_line1',
        't_address_line2',
        't_address_line3',
        't_postal_code',

        'profile_picture',
        'active_status',
        'created_by',
        'updated_by',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'nic' => 'encrypted',
            'full_name' => 'encrypted',
            'name_with_initials' => 'encrypted',
            //'email' => 'encrypted',
            //'phone' => 'encrypted',
            'date_of_birth' => 'date',
        ];
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->people_id)) {
                $model->people_id = self::generatePeopleId();
            }
        });

        static::saving(function ($model) {
            if ($model->isDirty('nic')) {
                // 1. Normalize NIC (unicode-safe, uppercase, trim)
                $cleanNic = NicHelper::normalize($model->nic);
                $model->nic = $cleanNic; // normalize NIC value

                // 2. Hash normalized NIC   
                $model->nic_hash = NicHelper::hash($cleanNic);
            }
        });

        // Sync to user table after save
        static::saved(function ($model) {

            // Prevent unnecessary sync
            if (! $model->wasChanged(['nic', 'nic_hash', 'phone', 'email', 'name_with_initials'])) {
                return;
            }

            $user = \App\Models\User::where('people_id', $model->people_id)->first();
            if (!$user) {
                return;
            }

            // Fill only changed values
            $user->fill([
                'nic' => $model->nic,
                'nic_hash' => $model->nic_hash,
                'name' => $model->name_with_initials ?? $user->name,
                'contact' => $model->phone ?? $user->contact,
                'email' => $model->email ?? $user->email,
            ]);

            // Save only if user has changed fields AND
            // prevent recursive events using saveQuietly()
            if ($user->isDirty()) {
                $user->saveQuietly();
            }
        });
    }

    public function getHealthStatusAttribute()
    {
        return $this->health_condition == 1 ? 'Good' : 'Not healthy';
    }

    // If you want to filter active institutions by default
    public function scopeActive($query)
    {
        return $query->where('active_status', 1);
    }

    public function getDateOfBirthAttribute($value)
    {
        return Carbon::parse($value)->format('Y-m-d');
    }

    /**
     * Generate 12-character incremental People ID
     * Format: PE + Year (2) + Sequence (8)
     */
    public static function generatePeopleId(): string
    {
        $year = now()->format('y'); // last two digits of current year, e.g., 25

        // Find the latest record for the current year
        $last = self::where('people_id', 'like', "PE{$year}%")
            ->orderBy('people_id', 'desc')
            ->first();

        if ($last) {
            // Extract numeric part (last 8 digits)
            $lastNumber = (int) substr($last->people_id, -8);
            $nextNumber = str_pad($lastNumber + 1, 8, '0', STR_PAD_LEFT);
        } else {
            $nextNumber = '00000001';
        }

        return "PE{$year}{$nextNumber}"; // Example: PE2500000123
    }


    /**
     * Generate initials like “A.S. Madusanka”
     */
    public static function generateInitials($fullName)
    {
        $parts = preg_split('/\s+/', trim($fullName));

        if (count($parts) > 1) {
            $lastName = ucfirst(strtolower(array_pop($parts)));
            $initials = implode('.', array_map(fn($p) => strtoupper($p[0]), $parts)) . '. ' . $lastName;
        } else {
            $initials = ucfirst(strtolower($fullName));
        }

        return $initials;
    }

    /**
     * Relationships
     */
    public function title()
    {
        return $this->belongsTo(Title::class, 'title_id', 'title_id');
    }

    public function gender()
    {
        return $this->belongsTo(GenderList::class, 'gender_id', 'gender_id');
    }

    public function religion()
    {
        return $this->belongsTo(Religion::class, 'religion_id', 'religion_id');
    }

    public function ethnicity()
    {
        return $this->belongsTo(Ethnicity::class, 'ethnicity_id', 'ethnicity_id');
    }

    public function civilStatus()
    {
        return $this->belongsTo(CivilStatus::class, 'civil_status_id', 'civil_status_id');
    }

    public function bloodGroup()
    {
        return $this->belongsTo(BloodGroup::class, 'blood_group_id', 'blood_group_id');
    }

    public function district()
    {
        return $this->belongsTo(DistrictsList::class, 'district_id', 'district_id');
    }

    public function dsOffice()
    {
        return $this->belongsTo(DivisionalSecretariatOffice::class, 'ds_office_id', 'id');
    }

    public function gnDivision()
    {
        return $this->belongsTo(GnDivision::class, 'gn_division_id', 'gn_division_id');
    }

    /**
     * Appointments
     */
    public function myAppointments()
    {
        return $this->hasMany(EmployerAppointment::class, 'employee_id', 'people_id');
    }

    public function appointment()
    {
        return $this->hasOne(EmployerAppointment::class, 'employee_id', 'people_id')
            ->where('active_status', 1);
    }

    public function currentAppointment()
    {
        return $this->hasOne(EmployerCurrentAppointment::class, 'employee_id', 'people_id');
    }

public function attachmentAppointment()
    {
        return $this->hasOne(EmployerAttachmentAppointment::class, 'employee_id', 'people_id');
    }

    public function appointmentHistory()
    {
        return $this->hasMany(EmployerAppointmentHistory::class, 'employee_id', 'people_id');
    }

    public function educationQualifications()
    {
        return $this->hasMany(PeopleEducationQualification::class, 'people_id', 'people_id');
    }

    public function familiesAsHusband()
    {
        return $this->hasMany(Family::class, 'member_a_id', 'people_id');
    }

    public function familiesAsWife()
    {
        return $this->hasMany(Family::class, 'member_b_id', 'people_id');
    }

    // Shortcut to get all families where this person is a spouse
    // public function families()
    // {
    //     return $this->familiesAsHusband->merge($this->familiesAsWife);
    // }

    protected function families(): Attribute
    {
        return Attribute::get(function () {
            return $this->familiesAsHusband
                ->merge($this->familiesAsWife);
        });
    }

    public function profileEditRequests()
    {
        return $this->hasMany(PeopleProfileEditRequest::class, 'people_id', 'people_id');
    }

    public function appointmentRejectComments()
    {
        return $this->hasMany(EmployerAppointmentRejectComment::class, 'people_id', 'people_id');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->useLogName('people')
            ->dontSubmitEmptyLogs();
    }

    public function teacher()
    {
        return $this->hasOne(Teacher::class, 'employee_id', 'people_id');
    }

    public function user()
    {
        return $this->hasOne(User::class, 'people_id', 'people_id');
    }

    public function principal()
    {
        return $this->hasOne(Principal::class, 'employee_id', 'people_id');
    }

    public function educationAdministratorService()
    {
        return $this->hasOne(EducationAdministratorService::class, 'employee_id', 'people_id');
    }

    public function cadreSubject()
    {
        return $this->hasOne(EmployerCadreSubject::class, 'employee_id', 'people_id');
    }
}
