<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class DivisionalEducationOffice extends Model
{
    use HasFactory;

    protected $table = 'divisional_education_offices';

    protected $primaryKey = 'id';

    protected $fillable = [
        'workplace_id',
        'zeo_wp_id',
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

    /**
     * Scope for active institution types
     */
    public function scopeActive($query)
    {
        return $query->where('active_status', '1');
    }

    /**
     * Relationship: Divisional Education Office belongs to Zonal Education Office
     */
    public function zonalEducationOffice()
    {
        return $this->belongsTo(ZonalEducationOffice::class, 'zeo_wp_id', 'workplace_id');
    }
}
