<?php

namespace App\Http\Controllers\Pdf;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use misterspelik\LaravelPdf\Facades\Pdf as PDF;
use App\Models\ZonalEducationOffice;
use Illuminate\Support\Facades\Auth;

class ZeoPeportController extends Controller
{
    public function teacherList($id)
    {
        // Load ZEO only (NOT teachers yet)
        $zeo = ZonalEducationOffice::find($id);

        if (!$zeo) {
            abort(404, 'ZEO not found');
        }

        $userNic = Auth::user()?->nic_hash ?? 'N/A';

        // Load teachers separately with relations (IMPORTANT)
        $teachers = $zeo->teachers()
            ->with(['employee', 'position', 'service'])
            ->orderBy('appoint_date', 'asc')
            ->get();

        // Chunk teachers (CRITICAL for large data)
        $teacherChunks = $teachers->chunk(300);

        $pdf = PDF::loadView(
            'pdf.zeo-teacher-list',
            [
                'zeo'            => $zeo,
                'teacherChunks'  => $teacherChunks,
                'userNic'        => $userNic,
            ],
            [],
            [
                'format'        => 'A4-L',
                'margin_left'   => 10,
                'margin_right'  => 10,
                'margin_top'    => 20,
                'margin_bottom' => 20,
            ]
        );

        // Enable only if really required
        // $pdf->SetProtection(['copy', 'print'], '', 'secure-password');

        return $pdf->stream('zeo-teacher-list.pdf');
    }


    public function zeoInstitutionList($id)
    {
        // Load ZEO basic info only
        $zeo = ZonalEducationOffice::with([
            'provincialEducationOffice',
            'district',
        ])->find($id);

        if (!$zeo) {
            abort(404, 'ZEO not found');
        }

        $userNic = Auth::user()?->nic_hash ?? 'N/A';

        // Load institutions separately (IMPORTANT)
        $institutions = $zeo->institutions()
            ->with([
                'institutionCategory',
                'divisionalEducationOffice',
                'institutionType'
            ])
            ->orderBy('created_at')
            ->get();

        // Chunk institutions (CRITICAL)
        $institutionChunks = $institutions->chunk(300);

        $pdf = PDF::loadView(
            'pdf.zeo-institution-list',
            [
                'zeo'               => $zeo,
                'institutionChunks' => $institutionChunks,
                'userNic'           => $userNic,
            ],
            [],
            [
                'format'        => 'A4-L',
                'margin_left'   => 10,
                'margin_right'  => 10,
                'margin_top'    => 20,
                'margin_bottom' => 20,
            ]
        );

        // Enable only if absolutely required
        // $pdf->SetProtection(['copy', 'print'], '', 'secure-password');

        return $pdf->stream('zeo-institution-list.pdf');
    }


    public function zeoStaffList($id)
    {
        // Load ZEO basic info only
        $zeo = ZonalEducationOffice::with([
            'provincialEducationOffice',
            'district',
        ])->find($id);

        if (!$zeo) {
            abort(404, 'ZEO not found');
        }

        $userNic = Auth::user()?->nic_hash ?? 'N/A';

        // Load staff separately (IMPORTANT)
        $staff = $zeo->staffList()
            ->with([
                'employee.title',
                'position',
                'service',
                'rank',
            ])
            ->orderBy('id')
            ->get();

        // Chunk staff list (CRITICAL)
        $staffChunks = $staff->chunk(300);

        $pdf = PDF::loadView(
            'pdf.zeo-staff-list',
            [
                'zeo'          => $zeo,
                'staffChunks'  => $staffChunks,
                'userNic'      => $userNic,
            ],
            [],
            [
                'format'        => 'A4-L',
                'margin_left'   => 10,
                'margin_right'  => 10,
                'margin_top'    => 20,
                'margin_bottom' => 20,
            ]
        );

        // Enable only if really required
        // $pdf->SetProtection(['copy', 'print'], '', 'secure-password');

        return $pdf->stream('zeo-staff-list.pdf');
    }
}
