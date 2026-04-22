<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Blameable;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class FamilyMember extends Model
{
    use HasFactory, LogsActivity, Blameable;

    /**
     * The table associated with the model.
     */
    protected $table = 'family_members';

    /**
     * The primary key associated with the table.
     */
    protected $primaryKey = 'id';

    /**
     * Indicates if the IDs are auto-incrementing.
     */
    public $incrementing = true;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'family_id',
        'child_name',
        'date_of_birth',
        'gender_id',
        'birth_fc_no',
        'health_condition',
        'active_status',
        'created_by',
        'updated_by',
    ];

    /**
     * Scope for active institution types
     */
    public function scopeActive($query)
    {
        return $query->where('active_status', '1');
    }

    public function gender()
    {
        return $this->belongsTo(GenderList::class, 'gender_id', 'gender_id');
    }

    /**
     * Relationship: A FamilyMember belongs to a Family.
     */
    public function family()
    {
        return $this->belongsTo(Family::class, 'family_id', 'family_id');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->useLogName('family_members')
            ->dontSubmitEmptyLogs();
    }
}
