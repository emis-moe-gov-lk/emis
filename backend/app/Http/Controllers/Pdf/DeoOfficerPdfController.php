<?php

namespace App\Http\Controllers\Pdf;

use App\Http\Controllers\Controller;
use App\Models\People;
use misterspelik\LaravelPdf\Facades\Pdf;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class DeoOfficerPdfController extends Controller
{
    public function generateSimplePdf(string $peopleId)
    {
        $people = People::with([
            'title',
            'gender',
            'religion',
            'ethnicity',
            'civilStatus',
            'bloodGroup',
            'district',
            'dsOffice',
            'gnDivision',
            'gnDivision.divisionalSecretariatOffice',
            'myAppointments',
            'appointment',
            'currentAppointment',
            'currentAppointment.service',
            'currentAppointment.rank',
            'currentAppointment.position',
            'currentAppointment.officeLevel',
            'currentAppointment.workplace',
            'currentAppointment.workplace.ministry',
            'currentAppointment.workplace.provincial',
            'currentAppointment.workplace.zonal',
            'currentAppointment.workplace.divisional',
            'currentAppointment.workplace.institution',
        ])->where('people_id', $peopleId)->firstOrFail();

        $svg = QrCode::format('svg')
            ->size(120)
            ->margin(1)
            ->generate($people->people_id);

        $qrCode = 'data:image/svg+xml;base64,' . base64_encode($svg);

        $pdf = Pdf::loadView('pdf.deo-officer-profile-pdf', [
            'people' => $people,
            'qrCode' => $qrCode,
        ]);

        $pdf->SetProtection(['copy', 'print'], '', 'pass');

        $fileName = 'zonal-deo-profile-' . ($people->nic ?: $people->people_id) . '.pdf';
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
