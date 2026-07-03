<?php

namespace App\Http\Controllers\Pdf;

use App\Http\Controllers\Controller;
use App\Models\People;
use misterspelik\LaravelPdf\Facades\Pdf;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class ZonalAdminPdf extends Controller
{
    public function generatePdf(string $peopleId)
    {
        $people = People::query()->with([
            'title',
            'gender',
            'civilStatus',
            'religion',
            'ethnicity',
            'district',
            'gnDivision',
            'bloodGroup',
            'currentAppointment.service',
            'currentAppointment.rank',
            'currentAppointment.position',
            'currentAppointment.workplace.ministry',
            'currentAppointment.workplace.provincial',
            'currentAppointment.workplace.zonal',
            'currentAppointment.workplace.divisional',
            'currentAppointment.workplace.institution',
            'educationQualifications',
            'educationQualifications.qualification',
            'educationQualifications.qualificationGrade',
            'familiesAsHusband',
            'familiesAsHusband.memberB',
            'familiesAsHusband.children',
            'familiesAsWife',
            'familiesAsWife.memberA',
            'familiesAsWife.children',
        ])
            ->where('people_id', $peopleId)
            ->firstOrFail();

        // Generate QR
        $svg = QrCode::format('svg')
            ->size(120)
            ->margin(1)
            ->generate($people->people_id);

        $qrCode = 'data:image/svg+xml;base64,' . base64_encode($svg);

        // Load PDF using the Zonal admin template
        $pdf = Pdf::loadView('pdf.zonal-admin-profile-pdf', [
            'people' => $people,
            'qrCode' => $qrCode,
        ]);

        $pdf->SetProtection(['copy', 'print'], '', 'pass');

        $fileName = 'zonal-admin-profile-' . ($people->nic ?: $people->people_id) . '.pdf';
        $origin = request()->headers->get('Origin', '*');

        return response($pdf->output(), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="' . $fileName . '"',
            'Access-Control-Allow-Origin' => $origin,
            'Access-Control-Expose-Headers' => 'Content-Disposition, Content-Length, Content-Type',
            'Vary' => 'Origin',
        ]);
    }
}
