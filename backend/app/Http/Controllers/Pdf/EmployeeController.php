<?php

namespace App\Http\Controllers\Pdf;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use misterspelik\LaravelPdf\Facades\Pdf as PDF;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use App\Models\People;

class EmployeeController extends Controller
{
    public function generateSimplePdf($id)
    {
        $people = People::find($id);

        // Generate QR code as Base64 PNG (PDF safe)
        $svg = QrCode::format('svg')
            ->size(120)
            ->margin(1)
            ->generate($people->people_id);

        $qrCode = 'data:image/svg+xml;base64,' . base64_encode($svg);

        $pdf = PDF::loadView('pdf.employee-profile', [
            'people' => $people,
            'qrCode'   => $qrCode,
        ]
        , [], [
            'format'        => 'A4',
            'margin_left'   => 15,
            'margin_right'  => 15,
            'margin_top'    => 20,
            'margin_bottom' => 20,
        ]);
        $pdf->SetProtection(['copy', 'print'], '', 'pass');
        return $pdf->stream('employee-profile-' . $people->people_id . '.pdf');
    }
}
