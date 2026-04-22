<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class PeopleProfileEditRequest extends Model
{
    use HasFactory;

    protected $table = 'people_profile_edit_requests';

    protected $primaryKey = 'id';

    protected $fillable = [
        'complaint_request_ref',
        'people_id',
        'requested_changes',
        'status',
        'reviewed_by',
        'review_comments'
    ];

    protected static function boot()
    {
        parent::boot();

        static::updating(function ($model) {
            if ($model->isDirty('status') && Auth::check()) {
                $model->reviewed_by = Auth::user()->people_id;
            }
        });
    }

    protected $casts = [
        'requested_changes' => 'array', // decode JSON automatically
    ];



    /**
     * The person who requested the change
     */
    public function person()
    {
        return $this->belongsTo(People::class, 'people_id', 'people_id');
    }

    /**
     * The reviewer (admin/officer)
     */
    public function reviewer()
    {
        return $this->belongsTo(People::class, 'reviewed_by', 'people_id');
    }

    /**
     * Status Text Helper
     */
    public function getStatusTextAttribute()
    {
        return [
            '1' => 'Pending',
            '2' => 'Approved',
            '3' => 'Rejected',
        ][$this->status];
    }

    public function getCreatedAgoAttribute()
    {
        return $this->created_at ? $this->created_at->diffForHumans() : null;
    }

    public function getUpdatedAgoAttribute()
    {
        return $this->updated_at ? $this->updated_at->diffForHumans() : null;
    }
}
