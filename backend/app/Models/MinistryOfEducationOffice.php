<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class MinistryOfEducationOffice extends Model
{
    use HasFactory;

    protected $table = 'ministry_of_education_offices'; // table name

    protected $primaryKey = 'id'; // primary key
    public $incrementing = true;  // since you used $table->id()
    protected $keyType = 'int';   // id is bigint by default

    protected $fillable = [
        'workplace_id',
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

    public function provincialOffices()
    {
        return $this->hasMany(ProvincialMinistryOfEducationOffice::class, 'moe_wp_id', 'workplace_id');
    }
}
