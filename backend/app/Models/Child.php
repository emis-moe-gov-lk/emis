<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Child extends Model
{
    use HasFactory;

    protected $fillable = [
        'people_id',
        'name',
        'date_of_birth',
        'gender',
        'status',
    ];

    public function person()
    {
        return $this->belongsTo(People::class, 'people_id', 'people_id');
    }
}