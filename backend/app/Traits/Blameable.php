<?php

namespace App\Traits;

use Illuminate\Support\Facades\Auth;

trait Blameable
{
    public static function bootBlameable()
    {
        // When creating record
        static::creating(function ($model) {
            if (Auth::check()) {
                $peopleId = Auth::user()->people_id;

                if (empty($model->created_by)) {
                    $model->created_by = $peopleId;
                }

                $model->updated_by = $peopleId;
            }
        });

        // When updating record
        static::updating(function ($model) {
            if (Auth::check()) {
                $model->updated_by = Auth::user()->people_id;
            }
        });
    }
}
