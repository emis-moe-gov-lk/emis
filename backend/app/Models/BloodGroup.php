<?php

namespace App\Models;


use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BloodGroup extends Model
{
    use HasFactory;

    protected $table = 'blood_groups';

    protected $primaryKey = 'id';

    protected $fillable = [
        'blood_group_id',
        'blood_group',
    ];
}
