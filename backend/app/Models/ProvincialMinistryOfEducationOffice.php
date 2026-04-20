<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProvincialMinistryOfEducationOffice extends Model
{
    use HasFactory;

    protected $table = 'provincial_ministry_of_education_offices';

    protected $primaryKey = 'id';
    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = [
        'workplace_id',
        'moe_wp_id',
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
     * Each Provincial Ministry Office belongs to a Ministry of Education Office
     */
    public function ministryOfEducationOffice()
    {
        return $this->belongsTo(MinistryOfEducationOffice::class, 'moe_wp_id', 'workplace_id');
    }

}
