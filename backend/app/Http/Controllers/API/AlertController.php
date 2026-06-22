<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\People;
use App\Models\PeopleProfileEditRequest;
use App\Traits\ResolvesZonalScope;
use Illuminate\Http\Request;

class AlertController extends Controller
{
    use ResolvesZonalScope;

    private const ZONE_SCOPED_ROLES = [
        'development officer',
        'development officer head',
        'zonal deo',
        'zonal deo head',
        'zonal director',
    ];

    private function baseQuery(Request $request)
    {
        $roles = $this->resolvedRoles($request);
        $query = People::query()->whereHas('teacher');

        if (! $this->isSuperAdmin($roles)) {
            $zonalWorkplaceId = $this->resolveUserZonalWorkplaceId($request);

            if (! $zonalWorkplaceId) {
                return null;
            }

            $this->applyTeacherZonalScope($query, $zonalWorkplaceId);
        }

        return $query;
    }

    public function counts(Request $request)
    {
        $roles            = $this->resolvedRoles($request);
        $zonalWorkplaceId = $this->isSuperAdmin($roles) ? null : $this->resolveUserZonalWorkplaceId($request);
        $query            = $this->baseQuery($request);

        if ($query === null) {
            return response()->json(['status' => 'error', 'message' => 'No zonal workplace mapped for this user.'], 403);
        }

        $pendingVerification = (clone $query)
            ->whereHas('appointment', fn ($q) => $q->where('is_verified', 0)->where('is_confirmed', 0))
            ->count();

        $pendingConfirmation = (clone $query)
            ->whereHas('appointment', fn ($q) => $q->where('is_verified', 1)->where('is_confirmed', 0))
            ->count();

        $rejectedQuery = (clone $query)
            ->whereHas('appointment', fn ($q) => $q->where('is_verified', 2));

        // DEO only counts rejected teachers they personally created
        $isDeo = $this->hasAnyRole($roles, ['development officer', 'Zonal DEO']);

        if ($isDeo && ! $this->isSuperAdmin($roles)) {
            $peopleId = $request->user()?->people_id;

            if ($peopleId) {
                $rejectedQuery->whereHas('appointment', fn ($q) => $q->where('created_by', $peopleId));
            }
        }

        $rejected = $rejectedQuery->count();

        $revised = (clone $query)
            ->whereHas('appointment', fn ($q) => $q->where('is_verified', 3))
            ->count();

        $pendingEditRequests = PeopleProfileEditRequest::where('status', '1')
            ->whereHas('person', function ($q) use ($zonalWorkplaceId, $roles) {
                if (! $this->isSuperAdmin($roles)) {
                    $this->applyTeacherZonalScope($q, $zonalWorkplaceId);
                }
            })
            ->count();

        return response()->json([
            'status' => 'success',
            'data' => [
                'pending_verification'  => $pendingVerification,
                'revised'               => $revised,
                'pending_confirmation'  => $pendingConfirmation,
                'rejected'              => $rejected,
                'pending_edit_requests' => $pendingEditRequests,
            ],
        ]);
    }

    public function pendingVerification(Request $request)
    {
        $query = $this->baseQuery($request);

        if ($query === null) {
            return response()->json(['status' => 'error', 'message' => 'No zonal workplace mapped for this user.'], 403);
        }

        $teachers = $query
            ->whereHas('appointment', fn ($q) => $q->where('is_verified', 0)->where('is_confirmed', 0))
            ->with([
                'appointment:appointment_id,employee_id,is_verified,is_confirmed,first_appointment_date,appointment_letter_no',
                'currentAppointment.workplace.institution:workplace_id,census_no,name',
            ])
            ->select('people_id', 'full_name', 'name_with_initials', 'nic_hash')
            ->paginate((int) $request->get('per_page', 20))
            ->withQueryString();

        return response()->json(['status' => 'success', 'data' => $teachers]);
    }

    public function pendingConfirmation(Request $request)
    {
        $query = $this->baseQuery($request);

        if ($query === null) {
            return response()->json(['status' => 'error', 'message' => 'No zonal workplace mapped for this user.'], 403);
        }

        $teachers = $query
            ->whereHas('appointment', fn ($q) => $q->where('is_verified', 1)->where('is_confirmed', 0))
            ->with([
                'appointment:appointment_id,employee_id,is_verified,is_confirmed,first_appointment_date,appointment_letter_no',
                'currentAppointment.workplace.institution:workplace_id,census_no,name',
            ])
            ->select('people_id', 'full_name', 'name_with_initials', 'nic_hash')
            ->paginate((int) $request->get('per_page', 20))
            ->withQueryString();

        return response()->json(['status' => 'success', 'data' => $teachers]);
    }

    public function revised(Request $request)
    {
        $query = $this->baseQuery($request);

        if ($query === null) {
            return response()->json(['status' => 'error', 'message' => 'No zonal workplace mapped for this user.'], 403);
        }

        $teachers = $query
            ->whereHas('appointment', fn ($q) => $q->where('is_verified', 3))
            ->with([
                'appointment:appointment_id,employee_id,is_verified,is_confirmed,first_appointment_date,appointment_letter_no',
                'currentAppointment.workplace.institution:workplace_id,census_no,name',
            ])
            ->select('people_id', 'full_name', 'name_with_initials', 'nic_hash')
            ->paginate((int) $request->get('per_page', 20))
            ->withQueryString();

        return response()->json(['status' => 'success', 'data' => $teachers]);
    }

    public function rejected(Request $request)
    {
        $roles = $this->resolvedRoles($request);
        $query = $this->baseQuery($request);

        if ($query === null) {
            return response()->json(['status' => 'error', 'message' => 'No zonal workplace mapped for this user.'], 403);
        }

        $query->whereHas('appointment', fn ($q) => $q->where('is_verified', 2));

        // DEO roles only see rejected teachers they personally created
        $isDeo = $this->hasAnyRole($roles, ['development officer', 'Zonal DEO']);

        if ($isDeo && ! $this->isSuperAdmin($roles)) {
            $peopleId = $request->user()?->people_id;

            if ($peopleId) {
                $query->whereHas('appointment', fn ($q) => $q->where('created_by', $peopleId));
            }
        }

        $teachers = $query
            ->with([
                'appointment:appointment_id,employee_id,is_verified,is_confirmed,first_appointment_date,appointment_letter_no,created_by',
                'currentAppointment.workplace.institution:workplace_id,census_no,name',
            ])
            ->select('people_id', 'full_name', 'name_with_initials', 'nic_hash')
            ->paginate((int) $request->get('per_page', 20))
            ->withQueryString();

        return response()->json(['status' => 'success', 'data' => $teachers]);
    }

    public function editRequests(Request $request)
    {
        $roles            = $this->resolvedRoles($request);
        $zonalWorkplaceId = $this->isSuperAdmin($roles) ? null : $this->resolveUserZonalWorkplaceId($request);

        if (! $this->isSuperAdmin($roles) && ! $zonalWorkplaceId) {
            return response()->json(['status' => 'error', 'message' => 'No zonal workplace mapped for this user.'], 403);
        }

        $query = PeopleProfileEditRequest::with([
            'person:people_id,full_name,name_with_initials',
            'person.currentAppointment.workplace.institution:workplace_id,census_no,name',
        ])->where('status', '1');

        if (! $this->isSuperAdmin($roles)) {
            $query->whereHas('person', function ($q) use ($zonalWorkplaceId) {
                $this->applyTeacherZonalScope($q, $zonalWorkplaceId);
            });
        }

        $requests = $query
            ->orderBy('created_at', 'desc')
            ->paginate((int) $request->get('per_page', 10))
            ->withQueryString();

        $requests->getCollection()->each->append(['status_text', 'created_ago']);

        return response()->json(['status' => 'success', 'data' => $requests]);
    }
}
