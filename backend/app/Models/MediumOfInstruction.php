<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MediumOfInstruction extends Model
{
    use HasFactory;

    protected $table = 'medium_of_instructions';

    protected $primaryKey = 'id';

    protected $fillable = [
        'medium_id',
        'name',
        'active_status',
    ];

    // If you want to filter active institutions by default
    public function scopeActive($query)
    {
        return $query->where('active_status', 1);
    }
}
