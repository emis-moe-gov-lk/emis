<?php

namespace App\Observers;

use Spatie\Activitylog\Models\Activity;
use Illuminate\Support\Facades\Auth;

class ActivityObserver
{
    public function creating(Activity $activity)
    {
        $activity->causer_id = Auth::id();
        $activity->ip_address = request()->ip();
    }
}

