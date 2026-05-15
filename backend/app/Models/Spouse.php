<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Spouse extends Model
{
    use HasFactory;

    protected $fillable = [
        'people_id',
        'name',
        'date_of_birth',
        'married_date',
        'married_cf_no',
        'status',
    ];

    public function person()
    {
        return $this->belongsTo(People::class, 'people_id', 'people_id');
    }
}
