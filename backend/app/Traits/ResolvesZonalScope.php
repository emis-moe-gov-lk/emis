<?php

namespace App\Traits;

use App\Models\Institution;
use App\Models\DivisionalEducationOffice;
use App\Models\ZonalEducationOffice;
use Illuminate\Http\Request;

trait ResolvesZonalScope
{
    protected function resolvedRoles(Request $request): array
    {
        $jwtRoles = (array) $request->attributes->get('jwt_roles', []);
        $dbRoles = $request->user()?->getRoleNames()?->all() ?? [];

        return collect(array_merge($jwtRoles, $dbRoles))
            ->filter(fn ($role) => is_string($role) && trim($role) !== '')
            ->map(fn (string $role) => strtolower(trim(preg_replace('/\s+/', ' ', $role) ?? $role)))
            ->unique()
            ->values()
            ->all();
    }

    protected function hasAnyRole(array $roles, array $allowedRoles): bool
    {
        $allowed = collect($allowedRoles)
            ->map(fn (string $role) => strtolower(trim($role)))
            ->all();

        return ! empty(array_intersect($roles, $allowed));
    }

    protected function isSuperAdmin(array $roles): bool
    {
        return in_array('super admin', $roles, true);
    }

    protected function resolveUserZonalWorkplaceId(Request $request): ?string
    {
        $appointment = $request->user()?->currentAppointment;

        if (! $appointment?->workplace_id) {
            return null;
        }

        $workplaceId = $appointment->workplace_id;

        if (ZonalEducationOffice::where('workplace_id', $workplaceId)->exists()) {
            return $workplaceId;
        }

        $deoZonalWorkplaceId = DivisionalEducationOffice::where('workplace_id', $workplaceId)
            ->value('zeo_wp_id');

        if ($deoZonalWorkplaceId) {
            return $deoZonalWorkplaceId;
        }

        return Institution::where('workplace_id', $workplaceId)
            ->value('zeo_wp_id');
    }

    protected function applyTeacherZonalScope($query, string $zonalWorkplaceId)
    {
        return $query->whereHas('currentAppointment.workplace.institution', function ($q) use ($zonalWorkplaceId) {
            $q->where('zeo_wp_id', $zonalWorkplaceId);
        });
    }
}
