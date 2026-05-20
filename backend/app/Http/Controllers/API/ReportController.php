<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\TeacherReportRequest;
use App\Models\Teacher;
use App\Models\TeacherTimetableConfig;
use App\Services\ReportService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class ReportController extends Controller
{
    public function __construct(private ReportService $reportService) {}

    public function __invoke(TeacherReportRequest $request): JsonResponse
    {
        $config = $this->resolveConfig();

        $report = $this->reportService->generate(
            $config,
            Carbon::parse($request->start_date),
            Carbon::parse($request->end_date),
        );

        return response()->json($report);
    }

    private function resolveConfig(): TeacherTimetableConfig
    {
        $teacher = Auth::user()->teacher;

        return $teacher?->timetableConfig
            ?? abort(response()->json(['message' => 'Timetable not configured.'], 404));
    }
}
