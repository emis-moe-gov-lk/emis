<?php

namespace App\Http\Controllers\MessageService;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ProvincialEducationOffice;
use App\Models\ZonalEducationOffice;
use App\Models\DivisionalEducationOffice;
use App\Models\Institution;

class ScopeListController extends Controller
{
    /**
     * GET /api/message-service/scope-lists/provinces
     */
    public function provinces()
    {
        $records = ProvincialEducationOffice::orderBy('name')
            ->get(['workplace_id', 'name']);

        $data = $records->map(fn($r) => [
            'workplaceId' => $r->workplace_id,
            'name'        => $r->name,
        ])->values()->all();

        return response()->json(['success' => true, 'data' => $data]);
    }

    /**
     * GET /api/message-service/scope-lists/zones?peo_wp_id=
     */
    public function zones(Request $request)
    {
        $query = ZonalEducationOffice::orderBy('name');

        if ($request->filled('peo_wp_id')) {
            $query->where('peo_wp_id', $request->input('peo_wp_id'));
        }

        $records = $query->get(['workplace_id', 'name']);

        $data = $records->map(fn($r) => [
            'workplaceId' => $r->workplace_id,
            'name'        => $r->name,
        ])->values()->all();

        return response()->json(['success' => true, 'data' => $data]);
    }

    /**
     * GET /api/message-service/scope-lists/divisions?zeo_wp_id=
     */
    public function divisions(Request $request)
    {
        $query = DivisionalEducationOffice::orderBy('name');

        if ($request->filled('zeo_wp_id')) {
            $query->where('zeo_wp_id', $request->input('zeo_wp_id'));
        }

        $records = $query->get(['workplace_id', 'name']);

        $data = $records->map(fn($r) => [
            'workplaceId' => $r->workplace_id,
            'name'        => $r->name,
        ])->values()->all();

        return response()->json(['success' => true, 'data' => $data]);
    }

    /**
     * GET /api/message-service/scope-lists/schools?deo_wp_id=
     */
    public function schools(Request $request)
    {
        $query = Institution::orderBy('name');

        if ($request->filled('deo_wp_id')) {
            $query->where('deo_wp_id', $request->input('deo_wp_id'));
        }

        $records = $query->get(['workplace_id', 'name']);

        $data = $records->map(fn($r) => [
            'workplaceId' => $r->workplace_id,
            'name'        => $r->name,
        ])->values()->all();

        return response()->json(['success' => true, 'data' => $data]);
    }
}
