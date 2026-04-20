<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Workplaces extends Model
{
    use HasFactory;

    protected $table = 'workplaces';

    protected $fillable = ['workplace_id', 'office_level_id', 'parent_workplace_id'];

    // Relationships to each possible office table
    public function ministry()
    {
        return $this->hasOne(MinistryOfEducationOffice::class, 'workplace_id', 'workplace_id');
    }

    public function provincialMinistry()
    {
        return $this->hasOne(ProvincialMinistryOfEducationOffice::class, 'workplace_id', 'workplace_id');
    }

    public function provincial()
    {
        return $this->hasOne(ProvincialEducationOffice::class, 'workplace_id', 'workplace_id');
    }

    public function zonal()
    {
        return $this->hasOne(ZonalEducationOffice::class, 'workplace_id', 'workplace_id');
    }

    public function divisional()
    {
        return $this->hasOne(DivisionalEducationOffice::class, 'workplace_id', 'workplace_id');
    }

    public function institution()
    {
        return $this->hasOne(Institution::class, 'workplace_id', 'workplace_id');
    }

    /**
     * Dynamic accessor to return the actual office model
     */
    public function office()
    {
        return match ($this->office_level_id) {
            'OLID001' => $this->ministry,
            'OLID002' => $this->provincialMinistry,
            'OLID003' => $this->provincial,
            'OLID004' => $this->zonal,
            'OLID005' => $this->divisional,
            'OLID006' => $this->institution,
            default   => null,
        };
    }

    public function officeLevel()
    {
        return $this->belongsTo(OfficeLevel::class, 'office_level_id');
    }

    /**
     * Get the actual name of the workplace based on its office level.
     */
    public function getOfficeNameAttribute()
    {
        $office = $this->office();

        if (!$office) {
            return 'Unknown Office';
        }

        // Return the name field that exists in your related office models
        return $office->name
            ?? $office->short_name
            ?? 'Unnamed Office';
    }

    /**
     * Get the address of the workplace based on its office level.
     */
    public function getAddressAttribute()
    {
        $office = $this->office();

        if (!$office) {
            return null;
        }

        return $office->address ?? null;
    }

    public function getAllChildWorkplaces()
    {
        $ids = collect([$this->workplace_id]);
        $queue = collect([$this->workplace_id]);

        while ($queue->isNotEmpty()) {
            $children = Workplaces::whereIn('parent_workplace_id', $queue)
                ->pluck('workplace_id');

            $new = $children->diff($ids);

            if ($new->isEmpty()) {
                break;
            }

            $ids = $ids->merge($new);
            $queue = $new;
        }

        return $ids->values()->all();
    }


    /**
     * Get all parent workplaces recursively
     */
    public function getAllParentWorkplaces()
    {
        $ids = collect([$this->workplace_id]);

        $current = $this->parent_workplace_id;

        while ($current) {
            $parent = Workplaces::where('workplace_id', $current)->first();

            if (!$parent) {
                break;
            }

            $ids->push($parent->workplace_id);
            $current = $parent->parent_workplace_id;
        }

        return $ids->values()->all();
    }


    /**
     * Get workplace hierarchy (both parents and children)
     */
    public function getWorkplaceHierarchy()
    {
        $parents = $this->getAllParentWorkplaces();
        $children = $this->getAllChildWorkplaces();

        return collect($parents)->merge($children)->unique()->values()->all();
    }  
}
