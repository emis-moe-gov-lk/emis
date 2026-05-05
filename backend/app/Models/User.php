<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;
use Spatie\Permission\Traits\HasRoles;
use App\Traits\Blameable;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

use App\Helpers\NicHelper;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasRoles, LogsActivity, Blameable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'nic',
        'nic_hash',
        'people_id',
        'name',
        'email',
        'contact',
        'password',
        'must_change_password',
        'password_initialized_at',
        'password_changed_at',
        'identity_provider',
        'identity_provider_user_id',
        'default_password_version',
        'account_provisioned_at',
        'profile_picture',
        'remember_token',
        'active_status',
        'created_by',
        'updated_by',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'nic' => 'encrypted', // Auto-encrypt/decrypt
            'name' => 'encrypted',
            //'email' => 'encrypted',
            //'contact' => 'encrypted',
            'email_verified_at' => 'datetime',
            'contact_verified_at' => 'datetime',
            'password' => 'hashed',
            'must_change_password' => 'boolean',
            'password_initialized_at' => 'datetime',
            'password_changed_at' => 'datetime',
            'account_provisioned_at' => 'datetime',
        ];
    }

    protected static function boot()
    {
        parent::boot();

        static::saving(function ($user) {
            // Normalize NIC
            if ($user->isDirty('nic')) {
                $cleanNic = NicHelper::normalize($user->nic);
                $user->nic = $cleanNic;
                $user->nic_hash = NicHelper::hash($cleanNic);
            }
        });

        static::saved(function ($user) {

            // Sync People only if these fields changed
            if (! $user->wasChanged(['nic', 'nic_hash', 'contact', 'email', 'name'])) {
                return;
            }

            $person = \App\Models\People::where('people_id', $user->people_id)->first();

            if ($person) {

                // Fill new data
                $person->fill([
                    'nic'       => $user->nic,
                    'nic_hash'  => $user->nic_hash,
                    'name_with_initials' => $user->name ?? $person->name_with_initials,
                    'phone'     => $user->contact ?? $person->phone,
                    'email'     => $user->email ?? $person->email,
                ]);

                // Only save if actual changes
                if ($person->isDirty()) {
                    $person->saveQuietly();  // ← prevents recursive loop
                }
            }
        });
    }



    /**
     * Get the user's initials
     */
    public function initials(): string
    {
        return Str::of($this->name)
            ->explode(' ')
            ->take(2)
            ->map(fn($word) => Str::substr($word, 0, 1))
            ->implode('');
    }

    /**
     * Relationship: A user belongs to a person
     */
    public function people()
    {
        return $this->belongsTo(People::class, 'people_id', 'people_id');
    }

    public function teacher()
    {
        return $this->hasOne(Teacher::class, 'employee_id', 'people_id');
    }

    /**
     * Relationship: A user has one current appointment (through their person)
     */
    public function currentAppointment()
    {
        return $this->hasOne(EmployerCurrentAppointment::class, 'employee_id', 'people_id');
    }

    /**
     * Relationship: A user’s workplace (through their current appointment)
     */
    public function workplace()
    {
        return $this->hasOneThrough(
            Workplaces::class,
            EmployerCurrentAppointment::class,
            'employee_id',   // FK on EmployerCurrentAppointment table
            'workplace_id',  // FK on Workplaces table
            'people_id',     // local key on Users table
            'workplace_id'   // local key on EmployerCurrentAppointment table
        );
    }

    public function officeLevel()
    {
        return $this->hasOneThrough(
            OfficeLevel::class,
            Workplaces::class,
            'workplace_id',      // Foreign key on workplaces
            'office_level_id',   // Foreign key on office_levels
            'office_id',         // Local key on users
            'office_level_id'    // Local key on workplaces
        );
    }

    /**
     * Quick accessor to get full workplace details dynamically
     */
    public function getFullWorkplaceAttribute()
    {
        return $this->workplace?->office();
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->useLogName('users')
            ->dontSubmitEmptyLogs();
    }
}
