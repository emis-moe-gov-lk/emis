<?php

namespace App\Http\Controllers\API;

use Carbon\Carbon;
use App\Models\User;
use App\Models\Title;
use App\Models\People;
use App\Models\Service;

use App\Models\Teacher;
use App\Models\Position;
use App\Models\Religion;
use App\Models\Ethnicity;
use App\Helpers\NicHelper;

use App\Models\BloodGroup;
use App\Models\GenderList;
use App\Models\GnDivision;
use App\Models\CivilStatus;
use App\Models\Institution;
use App\Models\ServiceRank;
use App\Models\SubjectList;
use App\Models\TeacherType;
use Illuminate\Http\Request;
use App\Models\DistrictsList;
use App\Models\ApointedSubject;
use App\Models\TeacherCategory;
use Illuminate\Support\Facades\DB;
use App\Models\EmployerAppointment;
use App\Models\EmployerAppointmentRejectComment;
use App\Models\InstitutionCategory;
use App\Models\MediumOfInstruction;

use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rules\In;
use App\Http\Controllers\Controller;
use App\Models\DivisionalEducationOffice;
use App\Models\ZonalEducationOffice;
use Illuminate\Support\Facades\Hash;
use App\Models\EmployerCurrentAppointment;
use App\Models\DivisionalSecretariatOffice;
use App\Services\TeacherToPrincipalPromotionService;


class EmployerAppointmentConfirmationController extends Controller
{
    private function resolveUserZonalWorkplaceId(Request $request): ?string
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

    private function teacherBelongsToUserZonalArea(Request $request, EmployerCurrentAppointment $currentAppointment): bool
    {
        $zonalWorkplaceId = $this->resolveUserZonalWorkplaceId($request);

        if (! $zonalWorkplaceId) {
            return false;
        }

        $teacherZonalWorkplaceId = Institution::where('workplace_id', $currentAppointment->workplace_id)
            ->value('zeo_wp_id');

        return $teacherZonalWorkplaceId === $zonalWorkplaceId;
    }

    private function appendEditedRejectComment(string $existingComment, string $newComment, ?string $editedAt = null): string
    {
        $existingComment = trim($existingComment);
        $newComment = trim($newComment);

        if ($newComment === '') {
            return $existingComment;
        }

        if ($existingComment === '') {
            return $newComment;
        }

        return $existingComment . "\n\n" . $newComment;
    }

    private function formatRejectComments($rejectComments): array
    {
        return collect($rejectComments ?? [])
            ->unique(function ($comment) {
                return $comment->id
                    ?? implode('|', [
                        $comment->employer_appointment_id ?? '',
                        $comment->people_id ?? '',
                        $comment->reject_comment ?? '',
                        optional($comment->reject_date)->format('Y-m-d H:i:s') ?? (string) ($comment->reject_date ?? ''),
                    ]);
            })
            ->map(function ($comment) {
            $commentData = method_exists($comment, 'toArray')
                ? $comment->toArray()
                : (array) $comment;

            $displayName = $comment->rejectedBy?->name_with_initials
                ?? $comment->rejectedBy?->full_name
                ?? User::where('people_id', $comment->people_id)->value('name')
                ?? $comment->rejectedBy?->email;

            $commentData['commented_by_name'] = $displayName;
            $commentData['rejected_by_display_name'] = $displayName;

            return $commentData;
        })->values()->all();
    }

    public function rejectComments(Request $request)
    {
        try {
            $query = EmployerAppointmentRejectComment::query()
                ->when($request->filled('employer_appointment_id'), function ($query) use ($request) {
                    $query->where('employer_appointment_id', $request->input('employer_appointment_id'));
                })
                ->orderByDesc('reject_date')
                ->orderByDesc('id');

            if ($request->filled('employer_appointment_id')) {
                $comment = $query->first();

                return response()->json([
                    'status' => 'success',
                    'data' => $comment,
                ]);
            }

            $comments = $query->get();

            return response()->json([
                'status' => 'success',
                'data' => $comments,
            ]);
        } catch (\Throwable $e) {
            Log::error('Reject Comments Fetch Error', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch reject comments',
            ], 500);
        }
    }

    public function rejectCommentsByProfile(string $people_id)
    {
        try {
            $comments = EmployerAppointmentRejectComment::query()
                ->with(['appointment', 'rejectedBy', 'rejectedProfile'])
                ->where('rejected_people_id', $people_id)
                ->orderByDesc('reject_date')
                ->orderByDesc('id')
                ->get();

            return response()->json([
                'status' => 'success',
                'data' => $comments,
            ]);
        } catch (\Throwable $e) {
            Log::error('Reject Comments By Profile Fetch Error', [
                'people_id' => $people_id,
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch reject comments for this profile',
            ], 500);
        }
    }

    public function updateRejectComment(Request $request, int $id)
    {
        try {
            $validated = $request->validate([
                'update_comments' => 'nullable|string',
                'status' => 'nullable|string|in:pending',
            ]);

            $rawUpdatedComment = $request->input('update_comments')
                ?? $request->input('reject_comment')
                ?? $request->input('comment')
                ?? $request->input('details')
                ?? $request->input('reason');

            $updatedComment = trim((string) $rawUpdatedComment);

            if (
                $updatedComment === '' &&
                ! array_key_exists('status', $validated)
            ) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Nothing to update',
                ], 422);
            }

            $comment = EmployerAppointmentRejectComment::query()
                ->with('appointment')
                ->find($id);

            if (! $comment) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Reject comment not found',
                ], 404);
            }

            if ($updatedComment !== '') {
                $comment->reject_comment = $this->appendEditedRejectComment(
                    (string) ($comment->reject_comment ?? ''),
                    $updatedComment,
                    $request->input('update_comments_date')
                );
            }

            if (($validated['status'] ?? null) === 'pending') {
                $appointment = $comment->appointment;

                if (! $appointment) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Related appointment not found',
                    ], 404);
                }

                if ((int) $appointment->is_verified !== 2) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Only rejected appointments can be moved to pending',
                    ], 409);
                }

                $appointment->is_verified = 0;
                $appointment->is_confirmed = 0;
                $appointment->save();
            }

            $comment->save();
            $comment->refresh();

            return response()->json([
                'status' => 'success',
                'message' => ($validated['status'] ?? null) === 'pending'
                    ? 'Reject comment updated and appointment moved to pending successfully'
                    : 'Reject comment updated successfully',
                'data' => [
                    'comment' => $comment,
                    'appointment_status' => [
                        'appointment_id' => $comment->appointment?->appointment_id,
                        'is_verified' => (int) ($comment->appointment?->is_verified ?? 0),
                        'is_confirmed' => (int) ($comment->appointment?->is_confirmed ?? 0),
                    ],
                ],
            ], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Throwable $e) {
            Log::error('Reject Comment Update Error', [
                'id' => $id,
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update reject comment',
            ], 500);
        }
    }

     public function verify(Request $request, string $people_id)
    {
        try {
            $roles        = $this->resolvedRoles($request);
            $allowedRoles = ['development officer', 'development officer head', 'zonal deo', 'zonal deo head', 'super admin'];
            if (! $this->hasAnyRole($roles, $allowedRoles)) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Unauthorized',
                ], 403);
            }

            $currentAppointment = EmployerCurrentAppointment::where('employee_id', $people_id)->first();

            if (! $currentAppointment) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'No active appointment found for this teacher',
                ], 404);
            }

            $appointment = $currentAppointment->appointment;

            if (! $appointment) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Appointment record not found',
                ], 404);
            }

            if ((int) $appointment->is_verified === 1) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Appointment is already verified',
                ], 409);
            }

            // ── Zone check (DEO officers only; super admin can verify anyone) ──
            if (! $this->hasRole($roles, 'super admin')) {
                if (! $this->teacherBelongsToUserZonalArea($request, $currentAppointment)) {
                    return response()->json([
                        'status'  => 'error',
                        'message' => 'Development officers can only verify teacher profiles within their relevant zonal area',
                    ], 403);
                }
            }
            // ─────────────────────────────────────────────────────────────────

            $appointment->is_verified = 1;
            $appointment->is_confirmed = 0;
            $appointment->save();

            return response()->json([
                'status'  => 'success',
                'message' => 'Teacher appointment verified successfully',
                'data'    => [
                    'appointment_id' => $appointment->appointment_id,
                    'is_verified'    => (int) $appointment->is_verified,
                    'verified_by'    => $appointment->verified_by,
                    'verified_date'  => $appointment->verified_date,
                ],
            ]);      
        } catch (\Throwable $e) {
            Log::error('Teacher Verify Error', [
                'people_id' => $people_id,
                'message'   => $e->getMessage(),
            ]);

            return response()->json([
                'status'  => 'error',
                'message' => 'Failed to verify teacher appointment',
            ], 500);
        }
    }
public function confirm(Request $request, string $people_id)
{
    try {
        $roles        = $this->resolvedRoles($request);
        $allowedRoles = ['development officer', 'development officer head', 'zonal deo', 'zonal deo head', 'zonal director', 'super admin'];

        if (! $this->hasAnyRole($roles, $allowedRoles)) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Unauthorized',
            ], 403);
        }

        $currentAppointment = EmployerCurrentAppointment::where('employee_id', $people_id)->first();

        if (! $currentAppointment) {
            return response()->json([
                'status'  => 'error',
                'message' => 'No active appointment found for this teacher',
            ], 404);
        }

        $appointment = $currentAppointment->appointment;

        if (! $appointment) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Appointment record not found',
            ], 404);
        }

        if ($appointment->is_confirmed) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Appointment is already confirmed',
            ], 409);
        }

        if (! $this->hasRole($roles, 'super admin')) {
            if (! $this->teacherBelongsToUserZonalArea($request, $currentAppointment)) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Authorized officers can only confirm teacher profiles within their relevant zonal area',
                ], 403);
            }
        }

        $appointment->is_confirmed = 1;
        $appointment->save();
        $appointment->refresh();

        return response()->json([
            'status'  => 'success',
            'message' => 'Teacher appointment confirmed successfully',
            'data'    => [
                'appointment_id' => $appointment->appointment_id,
                'employee_id'    => $appointment->employee_id,
                'is_confirmed'   => (int) $appointment->is_confirmed,
                'confirmed_by'   => $appointment->confirmed_by,
                'confirmed_date' => $appointment->confirmed_date,
            ],
        ], 200);
    } catch (\Throwable $e) {
        Log::error('Teacher Confirm Error', [
            'people_id' => $people_id,
            'message'   => $e->getMessage(),
            'file'      => $e->getFile(),
            'line'      => $e->getLine(),
        ]);

        return response()->json([
            'status'  => 'error',
            'message' => 'Failed to confirm teacher appointment',
        ], 500);
    }
}

public function promote(Request $request, string $people_id, TeacherToPrincipalPromotionService $promotionService)
{
    try {
        $roles        = $this->resolvedRoles($request);
        $allowedRoles = ['development officer', 'development officer head', 'super admin'];

        if (! $this->hasAnyRole($roles, $allowedRoles)) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Unauthorized',
            ], 403);
        }

        $currentAppointment = EmployerCurrentAppointment::where('employee_id', $people_id)->first();

        if (! $currentAppointment) {
            return response()->json([
                'status'  => 'error',
                'message' => 'No active appointment found for this teacher',
            ], 404);
        }

        if (! $this->hasRole($roles, 'super admin')) {
            if (! $this->teacherBelongsToUserZonalArea($request, $currentAppointment)) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Development officers can only promote teacher profiles within their relevant zonal area',
                ], 403);
            }
        }

        $user = User::query()->where('people_id', $people_id)->first();
        if (! $user) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Linked system user not found for this teacher',
            ], 404);
        }

        $changedByPeopleId = $request->attributes->get('jwt_people_id') ?? $request->user()?->people_id;
        $promotionResult = $promotionService->promoteWithAppointmentTransition(
            $user,
            $changedByPeopleId,
            (string) $request->input('reason', 'Promoted from Teacher to Principal')
        );

        if (! ($promotionResult['promoted'] ?? false)) {
            $reason = $promotionResult['reason'] ?? 'promotion_not_completed';

            return response()->json([
                'status'  => 'error',
                'message' => match ($reason) {
                    'already_principal_service' => 'Teacher is already in principal service',
                    'principal_service_appointment_exists' => 'A principal service appointment already exists for this teacher',
                    default => 'Teacher promotion cannot be completed',
                },
            ], 409);
        }

        return response()->json([
            'status'  => 'success',
            'message' => 'Teacher promoted to principal successfully',
            'data'    => [
                'employee_id' => $people_id,
                'old_appointment_id' => $promotionResult['old_appointment_id'] ?? null,
                'new_appointment_id' => $promotionResult['new_appointment_id'] ?? null,
                'service_id' => 'SER004',
                'rank_id' => 'RANK010',
                'position_id' => 'POS006',
            ],
        ], 200);
    } catch (\RuntimeException $e) {
        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage(),
        ], 422);
    } catch (\Throwable $e) {
        Log::error('Teacher Promote Error', [
            'people_id' => $people_id,
            'message'   => $e->getMessage(),
            'file'      => $e->getFile(),
            'line'      => $e->getLine(),
        ]);

        return response()->json([
            'status'  => 'error',
            'message' => 'Failed to promote teacher profile',
        ], 500);
    }
}

   public function reject(Request $request, string $people_id)
{
    try {
        $roles        = $this->resolvedRoles($request);
        $allowedRoles = ['development officer', 'development officer head', 'zonal deo', 'zonal deo head', 'super admin'];

        // 🔒 Role check
        if (! $this->hasAnyRole($roles, $allowedRoles)) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Unauthorized',
            ], 403);
        }

        // 🔍 Get current appointment
        $currentAppointment = EmployerCurrentAppointment::where('employee_id', $people_id)->first();

        if (! $currentAppointment) {
            return response()->json([
                'status'  => 'error',
                'message' => 'No active appointment found for this teacher',
            ], 404);
        }

        // 🔗 Get related appointment
        $appointment = $currentAppointment->appointment;

        if (! $appointment) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Appointment record not found',
            ], 404);
        }

        // ⚠️ Already rejected
        if ((int) $appointment->is_verified === 2) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Appointment is already rejected',
            ], 409);
        }

        // 🌍 Zone check (DEO only)
        if (! $this->hasRole($roles, 'super admin')) {
            if (! $this->teacherBelongsToUserZonalArea($request, $currentAppointment)) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Development officers can only reject teacher profiles within their relevant zonal area',
                ], 403);
            }
        }

        $rawRejectComment = $request->input('reject_comment')
            ?? $request->input('comment')
            ?? $request->input('details')
            ?? $request->input('reason');

        $rejectComment = trim((string) $rawRejectComment);
        if ($rejectComment === '') {
            return response()->json([
                'status'  => 'error',
                'message' => 'Reject comment is required',
            ], 422);
        }

        $rejectDateInput = $request->input('reject_date') ?? $request->input('date');
        $rejectDate = $rejectDateInput ? Carbon::parse($rejectDateInput) : now();

        // ❌ Reject update
        $appointment->is_verified = 2;
        $appointment->is_confirmed = 0;

        $appointment->save();

        EmployerAppointmentRejectComment::create([
            'employer_appointment_id' => $appointment->id,
            'people_id' => $request->attributes->get('jwt_people_id'),
            'rejected_people_id' => $people_id,
            'reject_comment' => $rejectComment,
            'reject_date' => $rejectDate,
        ]);

        $appointment->refresh()->load('rejectComments.rejectedBy');
        $formattedComments = $this->formatRejectComments($appointment->rejectComments);

        return response()->json([
            'status'  => 'success',
            'message' => 'Teacher appointment rejected successfully',
            'data'    => [
                'appointment_id' => $appointment->appointment_id,
                'employee_id'    => $appointment->employee_id,
                'is_verified'    => (int) $appointment->is_verified,
                'reject_comments' => $formattedComments,
                'all_comments' => $formattedComments,
                'comments' => $formattedComments,
                'reject_comment' => $rejectComment,
                'reject_date'    => $rejectDate->format('Y-m-d H:i:s'),
                'current_reject_comment' => $formattedComments[0]['reject_comment'] ?? $rejectComment,
                'current_reject_comment_date' => $formattedComments[0]['reject_date'] ?? $rejectDate->format('Y-m-d H:i:s'),
                'current_reject_comment_by' => $formattedComments[0]['commented_by_name'] ?? null,
            ],
        ], 200);

    } catch (\Throwable $e) {
        Log::error('Teacher Reject Error', [
            'people_id' => $people_id,
            'message'   => $e->getMessage(),
            'file'      => $e->getFile(),
            'line'      => $e->getLine(),
        ]);

        return response()->json([
            'status'  => 'error',
            'message' => 'Failed to reject teacher appointment',
        ], 500);
    }
}

public function updateRejectedStatus(Request $request, string $people_id)
{
    try {
        $roles        = $this->resolvedRoles($request);
        $allowedRoles = ['development officer', 'development officer head', 'zonal deo', 'zonal deo head', 'super admin'];

        if (! $this->hasAnyRole($roles, $allowedRoles)) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Unauthorized',
            ], 403);
        }

        $currentAppointment = EmployerCurrentAppointment::where('employee_id', $people_id)->first();

        if (! $currentAppointment) {
            return response()->json([
                'status'  => 'error',
                'message' => 'No active appointment found for this teacher',
            ], 404);
        }

        $appointment = $currentAppointment->appointment;

        if (! $appointment) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Appointment record not found',
            ], 404);
        }

        if ((int) $appointment->is_verified !== 2) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Only rejected appointments can be updated',
            ], 409);
        }

        if (! $this->hasRole($roles, 'super admin')) {
            if (! $this->teacherBelongsToUserZonalArea($request, $currentAppointment)) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Development officers can only update teacher details within their relevant zonal area',
                ], 403);
            }
        }

        $appointment->is_verified = 3;
        $appointment->is_confirmed = 0;
        $appointment->save();
        $appointment->refresh();

        return response()->json([
            'status'  => 'success',
            'message' => 'Teacher profile marked as revised successfully',
            'data'    => [
                'profile_status' => 'revised',
                'appointment_id' => $appointment->appointment_id,
                'employee_id'    => $appointment->employee_id,
                'is_verified'    => (int) $appointment->is_verified,
                'is_confirmed'   => (int) $appointment->is_confirmed,
            ],
        ], 200);
    } catch (\Throwable $e) {
        Log::error('Teacher Update Status Error', [
            'people_id' => $people_id,
            'message'   => $e->getMessage(),
            'file'      => $e->getFile(),
            'line'      => $e->getLine(),
        ]);

        return response()->json([
            'status'  => 'error',
            'message' => 'Failed to update teacher status',
        ], 500);
    }
}

private function resolvedRoles(Request $request): array
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

private function hasAnyRole(array $roles, array $allowedRoles): bool
{
    $allowed = collect($allowedRoles)
        ->map(fn (string $role) => strtolower(trim($role)))
        ->all();

    return ! empty(array_intersect($roles, $allowed));
}

private function hasRole(array $roles, string $role): bool
{
    return in_array(strtolower(trim($role)), $roles, true);
}
}
