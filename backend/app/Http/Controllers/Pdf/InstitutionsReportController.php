<?php

namespace App\Http\Controllers\Pdf;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use misterspelik\LaravelPdf\Facades\Pdf as mPDF;
use App\Models\Institution;
use Illuminate\Support\Facades\Auth;

class InstitutionsReportController extends Controller
{
    public function teacherList($id)
    {
        $institution = Institution::find($id);

        if (!$institution) {
            abort(404, 'Institution not found');
        }

        $userNic = Auth::user()?->nic_hash ?? 'N/A';

        $staffList = $institution->staffList()
            ->with(['employee', 'position', 'service'])
            ->orderBy('appoint_date', 'asc')
            ->get();

        $staffChunks = $staffList->chunk(300);

        $pdf = mPDF::loadView(
            'pdf.institutions-teacher-list',
            [
                'institution' => $institution,
                'staffChunks' => $staffChunks,
                'userNic'     => $userNic,
            ],
            [],
            [
                'format'        => 'A4-L',
                'margin_left'   => 10,
                'margin_right'  => 10,
                'margin_top'    => 20,
                'margin_bottom' => 25,
            ]
        );

        return $pdf->stream('institution-teacher-list.pdf');
    }
}
