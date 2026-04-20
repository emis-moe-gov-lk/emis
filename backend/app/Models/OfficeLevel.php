<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;

use Illuminate\Database\Eloquent\Model;

class OfficeLevel extends Model
{

    use HasFactory;

    protected $table = 'office_levels';

    protected $primaryKey = 'id';

    protected $fillable = [
        'office_level_id',
        'office_level_rank',
        'office_level_name',
        'active_status',
    ];

    protected $casts = [
        'active_status' => 'boolean',
        'office_level_rank' => 'integer',
    ];


    // If you want to filter active institutions by default
    public function scopeActive($query)
    {
        return $query->where('active_status', 1);
    }

    public function workplaces()
    {
        return $this->hasMany(Workplaces::class, 'office_level_id', 'office_level_id');
    }

    public function lowerLevels()
    {
        return OfficeLevel::active()
            ->where('office_level_rank', '>', $this->office_level_rank)
            ->orderBy('office_level_rank')
            ->get();
    }

    public function nextLevel()
    {
        return OfficeLevel::active()
            ->where('office_level_rank', $this->office_level_rank + 1)
            ->first();
    }
}
