<?php

namespace App\Models;

use App\Traits\Blameable;
use App\Models\CadreDMSApproved;
use Spatie\Activitylog\LogOptions;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
use Spatie\Activitylog\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Institution extends Model
{
    use HasFactory, LogsActivity, Blameable;

    protected $table = 'institutions';

    protected $primaryKey = 'id';

    protected $fillable = [
        'workplace_id',
        'census_no',
        'institution_category_id',
        'authority_id',
        'language_id',
        'ethnicity_id',
        'gender_id',
        'facilities_id',
        'institution_types_id',
        'grade_span_id',
        'sport_s',
        'district_id',
        'zeo_wp_id',
        'deo_wp_id',
        'police_station_id',
        'moh_area_id',
        'name',
        'other_name',
        'established_year',
        'email',
        'phone',
        'address',
        'postal_code',
        'latitude',
        'longitude',
        'mission',
        'vision',
        'logo',
        'active_status',
        'created_by',
        'updated_by',
    ];

    // If you want to filter active institutions by default
    public function scopeActive($query)
    {
        return $query->where('active_status', 1);
    }

    public function setMissionAttribute($value)
    {
        $this->attributes['mission'] = $value ? strtolower($value) : null;
    }

    public function setVisionAttribute($value)
    {
        $this->attributes['vision'] = $value ? strtolower($value) : null;
    }



    /* ============================
       Relationships
       ============================ */

    public function zonalEducationOffice()
    {
        return $this->belongsTo(ZonalEducationOffice::class, 'zeo_wp_id', 'workplace_id');
    }

    public function divisionalEducationOffice()
    {
        return $this->belongsTo(DivisionalEducationOffice::class, 'deo_wp_id', 'workplace_id');
    }

    public function district()
    {
        return $this->belongsTo(DistrictsList::class, 'district_id', 'district_id');
    }

    public function institutionCategory()
    {
        return $this->belongsTo(InstitutionCategory::class, 'institution_category_id', 'institution_category_id');
    }

    public function authority()
    {
        return $this->belongsTo(InstitutionAuthority::class, 'authority_id', 'authority_id');
    }

    public function institutionLanguages()
    {
        return $this->belongsTo(InstitutionLanguages::class, 'language_id', 'language_id');
    }

    public function typeByGender()
    {
        return $this->belongsTo(InstitutionGender::class, 'gender_id', 'gender_id');
    }

    public function facilities()
    {
        return $this->belongsTo(InstitutionalFacility::class, 'facilities_id', 'facilities_id');
    }

    public function institutionType()
    {
        return $this->belongsTo(InstitutionType::class, 'institution_types_id', 'institution_types_id');
    }

    public function gradeSpan()
    {
        return $this->belongsTo(GradeSpan::class, 'grade_span_id', 'grade_span_id');
    }

    public function policeStation()
    {
        return $this->belongsTo(PoliceStation::class, 'police_station_id', 'police_station_id');
    }

    public function mohArea()
    {
        return $this->belongsTo(MohArea::class, 'moh_area_id', 'moh_area_id');
    }

    public function staffList()
    {
        return $this->hasMany(EmployerCurrentAppointment::class, 'workplace_id', 'workplace_id');
    }

    public function teachers()
    {
        return $this->hasMany(EmployerCurrentAppointment::class, 'workplace_id', 'workplace_id')
            ->where('office_level_id', 'OLID006');
    }

    public function getLogoUrlAttribute()
    {
        $path = 'public/images/institution/' . $this->logo;

        return ($this->logo && Storage::exists($path))
            ? asset('storage/images/institution/' . $this->logo)
            : asset('images/default_logo.png');
    }


    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->useLogName('institutions')
            ->dontSubmitEmptyLogs();
    }

    public function cadreApproved()
    {
        // workplace_id in institutions matches workplace_id in cadre_d_m_s_approveds
        return $this->hasMany(CadreDMSApproved::class, 'workplace_id', 'workplace_id');
    }
}
