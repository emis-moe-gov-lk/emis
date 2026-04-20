<?php

namespace App\Http\Controllers\Pdf;

use App\Models\Family;
use App\Models\People;
use App\Models\FamilyMember;
use App\Http\Controllers\Controller;
use misterspelik\LaravelPdf\Facades\Pdf;
use SimpleSoftwareIO\QrCode\Facades\QrCode;


class TeacherPdf extends Controller
{
    public function generateSimplePdf($id)
    {
        $people = People::find($id);
        //dd($teacher->families);
        // Generate QR
        $svg = QrCode::format('svg')
            ->size(120)
            ->margin(1)
            ->generate($people->people_id);

        $qrCode = 'data:image/svg+xml;base64,' . base64_encode($svg);

        // Load PDF
        $pdf = Pdf::loadView('pdf.teacher-profile-pdf', [
            'people' => $people,
            'qrCode' => $qrCode,

        ]);

        $pdf->SetProtection(['copy', 'print'], '', 'pass');

        return $pdf->stream($people->nic . '.pdf');
    }
}
