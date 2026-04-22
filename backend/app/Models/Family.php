<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Traits\Blameable;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Family extends Model
{
    use HasFactory, LogsActivity, Blameable;

    /**
     * The table associated with the model.
     */
    protected $table = 'families';

    /**
     * The primary key associated with the table.
     */
    protected $primaryKey = 'id';

    /**
     * Indicates if the IDs are auto-incrementing.
     */
    public $incrementing = true;

    /**
     * The data type of the primary key.
     */
    protected $keyType = 'int';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'family_id',
        'member_a_id',
        'member_b_id',
        'married_date',
        'married_cf_no',
        'married_cf',
        'divorce_date',
        'family_name',
        'active_status',
        'created_by',
        'updated_by',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->family_id)) {
                $model->family_id = self::generateFamilyId();
            }
        });
    }

    // If you want to filter active institutions by default
    public function scopeActive($query)
    {
        return $query->where('active_status', 1);
    }

    public function getMarriedDateAttribute($value)
    {
        return Carbon::parse($value)->format('Y-m-d');
    }

    /**
     * Generate 12-character incremental People ID
     * Format: PE + Year (2) + Sequence (8)
     */
    public static function generateFamilyId(): string
    {
        $year = now()->format('y'); // last two digits of current year, e.g., 25

        // Find the latest record for the current year
        $last = self::where('family_id', 'like', "FA{$year}%")
            ->orderBy('family_id', 'desc')
            ->first();

        if ($last) {
            // Extract numeric part (last 8 digits)
            $lastNumber = (int) substr($last->family_id, -8);
            $nextNumber = str_pad($lastNumber + 1, 8, '0', STR_PAD_LEFT);
        } else {
            $nextNumber = '00000001';
        }

        return "FA{$year}{$nextNumber}"; // Example: PE2500000123
    }

    /**
     * Relationships
     */

    // Husband (Male Member)
    public function memberA()
    {
        return $this->belongsTo(People::class, 'member_a_id', 'people_id');
    }

    // Wife (Female Member)
    public function memberB()
    {
        return $this->belongsTo(People::class, 'member_b_id', 'people_id');
    }

    // Children (if you later add a family_members table)
    public function children()
    {
        return $this->hasMany(FamilyMember::class, 'family_id', 'family_id');
    }

    public function getSpousInfo($teacherId)
    {
        if ($this->memberA->people_id == $teacherId) {
            return $this->memberB;
        }

        return $this->memberA;
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->useLogName('families')
            ->dontSubmitEmptyLogs();
    }
}
