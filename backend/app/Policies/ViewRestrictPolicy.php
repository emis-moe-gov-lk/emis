<?php

namespace App\Policies;

use App\Models\User;
use App\Models\People;

class ViewRestrictPolicy
{
    public function viewRestrict(User $user, People $people): bool
    {
        // User must have a workplace
        if (!$user->workplace) {
            return false;
        }

        // Allowed workplace IDs (self + children)
        $allowedWorkplaceIds = $user->workplace->getAllChildWorkplaces();

        // Check if profile belongs to allowed workplace
        return in_array($people->currentAppointment->workplace_id, $allowedWorkplaceIds);
    }
}
