<?php

use App\Http\Controllers\API\CurrentClassController;
use App\Http\Controllers\API\HolidayController;
use App\Http\Controllers\API\IntervalController;
use App\Http\Controllers\API\LessonRecordController;
use App\Http\Controllers\API\PeriodController;
use App\Http\Controllers\API\ReportController;
use App\Http\Controllers\API\SlotController;
use App\Http\Controllers\API\SubjectColorController;
use App\Http\Controllers\API\SubjectController;
use App\Http\Controllers\API\TimetableInitController;
use App\Http\Controllers\API\TimetableSetupController;
use App\Http\Controllers\API\TimetableWeekController;
use Illuminate\Support\Facades\Route;


Route::prefix('v1')->group(function () {

    // Subjects (global)
    Route::get('/subjects', [SubjectController::class, 'index']);

    // Teachers
//    Route::get('/teachers', [TeacherController::class, 'index']);
//    Route::post('/teachers', [TeacherController::class, 'store']);
//    Route::get('/teachers/{teacher}', [TeacherController::class, 'show']);

    // Teacher-scoped resources (auth resolved from JWT via Auth::user())
    Route::middleware('auth:jwt')->prefix('timetable')->group(function () {
        // Consolidated load endpoints
        Route::get('/init', TimetableInitController::class);
        Route::get('/week', TimetableWeekController::class);

        // Current class (dashboard widget)
        Route::get('/current-class', [CurrentClassController::class, 'show']);

        // Setup / config
        Route::get('/setup', [TimetableSetupController::class, 'show']);
        Route::post('/setup', [TimetableSetupController::class, 'store']);

        // Slots
        Route::get('/slots', [SlotController::class, 'index']);
        Route::post('/slots', [SlotController::class, 'store']);
        Route::put('/slots/{slot}', [SlotController::class, 'update']);
        Route::delete('/slots/{slot}', [SlotController::class, 'destroy']);
        Route::get('/slots/{slot}/comments', [SlotController::class, 'comments']);

        // Periods
        Route::get('/periods', [PeriodController::class, 'index']);
        Route::put('/periods/{period}', [PeriodController::class, 'update']);

        // Intervals
        Route::get('/intervals', [IntervalController::class, 'index']);
        Route::put('/intervals/{interval}', [IntervalController::class, 'update']);

        // Subject Colors
        Route::get('/subject-colors', [SubjectColorController::class, 'index']);
        Route::post('/subject-colors', [SubjectColorController::class, 'store']);
        Route::delete('/subject-colors/{subjectColor}', [SubjectColorController::class, 'destroy']);

        // Holidays
        Route::get('/holidays', [HolidayController::class, 'index']);
        Route::post('/holidays', [HolidayController::class, 'store']);
        Route::delete('/holidays/{holiday}', [HolidayController::class, 'destroy']);

        // Lesson Records
        Route::get('/lesson-records', [LessonRecordController::class, 'index']);
        Route::get('/lesson-records/dates', [LessonRecordController::class, 'recordedDates']);
        Route::get('/lesson-records/by-slot/{slot}', [LessonRecordController::class, 'bySlot']);
        Route::post('/lesson-records', [LessonRecordController::class, 'store']);
        Route::put('/lesson-records/{lessonRecord}', [LessonRecordController::class, 'update']);
        Route::delete('/lesson-records/{lessonRecord}', [LessonRecordController::class, 'destroy']);

        // Report
        Route::get('/report', [ReportController::class, 'index']);
    });
});
