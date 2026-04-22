<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CadreCirculars extends Model
{
    use HasFactory;

    protected $table = 'cadre_circulars';

    protected $primaryKey = 'id';

    protected $fillable = [
        'circular_id',
        'circular_no',
        'title',
        'description',
        'issued_date',
        'effective_from',
        'effective_to',
        'active_status',
        'document_path',
        'supersedes_id',
        'created_by',
        'updated_by',
    ];

    /**
     * Scope for active institution types
     */
    public function scopeActive($query)
    {
        return $query->where('active_status', '1');
    }

    
    /**
     * A circular can supersede another circular (self reference)
     */
    public function supersededCircular()
    {
        return $this->belongsTo(self::class, 'supersedes_id', 'circular_id');
    }

    /**
     * A circular can be superseded by many other circulars
     */
    public function supersedingCirculars()
    {
        return $this->hasMany(self::class, 'supersedes_id', 'circular_id');
    }
}
