<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\People;
use App\Models\PeopleProfileEditRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PeopleProfileEditRequestController extends Controller
{
    private const ALLOWED_AUTO_APPLY_FIELDS = [
        'phone', 'email',
        'address_line1', 'address_line2', 'address_line3', 'postal_code',
        't_address_line1', 't_address_line2', 't_address_line3', 't_postal_code',
    ];

    public function store(Request $request)
    {
        try {
            $peopleId = $request->attributes->get('jwt_people_id') ?? auth()->user()?->people_id;

            if (! $peopleId) {
                return response()->json(['status' => 'error', 'message' => 'Unauthenticated'], 401);
            }

            $validated = $request->validate([
                'subject'   => 'required|string|max:255',
                'complaint' => 'required|string',
            ]);

            $ref = $this->generateRef();

            $editRequest = PeopleProfileEditRequest::create([
                'complaint_request_ref' => $ref,
                'people_id'             => $peopleId,
                'requested_changes'     => [
                    'subject'   => $validated['subject'],
                    'complaint' => $validated['complaint'],
                ],
                'status' => '1',
            ]);

            return response()->json([
                'status'  => 'success',
                'message' => 'Edit request submitted successfully.',
                'data'    => $editRequest,
            ], 201);
        } catch (\Throwable $e) {
            Log::error('Edit Request Store Error', ['message' => $e->getMessage()]);

            return response()->json(['status' => 'error', 'message' => 'Failed to submit request.'], 500);
        }
    }

    public function indexByPerson(Request $request, string $people_id)
    {
        try {
            $authPeopleId = $request->attributes->get('jwt_people_id') ?? auth()->user()?->people_id;

            if (! $authPeopleId) {
                return response()->json(['status' => 'error', 'message' => 'Unauthenticated'], 401);
            }

            if ($authPeopleId !== $people_id) {
                $tokenUser  = User::where('people_id', $authPeopleId)->first();
                $targetUser = User::where('people_id', $people_id)->first();

                $tokenLevel  = $tokenUser?->roles()->first()?->level;
                $targetLevel = $targetUser?->roles()->first()?->level;

                if ($tokenLevel === null || $targetLevel === null || $tokenLevel >= $targetLevel) {
                    return response()->json(['status' => 'error', 'message' => 'Forbidden'], 403);
                }
            }

            $requests = PeopleProfileEditRequest::with(['reviewer', 'reviewer.title'])
                ->where('people_id', $people_id)
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($item) {
                    return array_merge($item->toArray(), [
                        'status_text' => $item->status_text,
                        'created_ago' => $item->created_ago,
                        'updated_ago' => $item->updated_ago,
                    ]);
                });

            return response()->json(['status' => 'success', 'data' => $requests]);
        } catch (\Throwable $e) {
            Log::error('Edit Request Index Error', ['message' => $e->getMessage()]);

            return response()->json(['status' => 'error', 'message' => 'Failed to fetch requests.'], 500);
        }
    }

    public function review(Request $request, int $id)
    {
        try {
            $authPeopleId = $request->attributes->get('jwt_people_id') ?? auth()->user()?->people_id;

            if (! $authPeopleId) {
                return response()->json(['status' => 'error', 'message' => 'Unauthenticated'], 401);
            }

            $editRequest = PeopleProfileEditRequest::findOrFail($id);

            $validated = $request->validate([
                'status'          => 'required|in:2,3',
                'review_comments' => 'required|string',
            ]);

            if ($validated['status'] === '2') {
                $fields = $editRequest->requested_changes['fields'] ?? [];
                $toApply = array_intersect_key($fields, array_flip(self::ALLOWED_AUTO_APPLY_FIELDS));

                if (! empty($toApply)) {
                    People::where('people_id', $editRequest->people_id)->update($toApply);
                }
            }

            $editRequest->update([
                'status'          => $validated['status'],
                'review_comments' => $validated['review_comments'],
            ]);

            return response()->json([
                'status'  => 'success',
                'message' => 'Review submitted successfully.',
            ]);
        } catch (\Throwable $e) {
            Log::error('Edit Request Review Error', ['message' => $e->getMessage()]);

            return response()->json(['status' => 'error', 'message' => 'Failed to submit review.'], 500);
        }
    }

    private function generateRef(): string
    {
        $today = now()->format('Ymd');
        $last  = PeopleProfileEditRequest::where('complaint_request_ref', 'like', "ECR-{$today}-%")
            ->orderBy('id', 'desc')
            ->value('complaint_request_ref');

        $seq = $last ? (intval(substr($last, -4)) + 1) : 1;

        return 'ECR-' . $today . '-' . str_pad($seq, 4, '0', STR_PAD_LEFT);
    }
}
