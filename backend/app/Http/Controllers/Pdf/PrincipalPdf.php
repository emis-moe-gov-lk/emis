<?php

namespace App\Http\Controllers\Pdf;

use App\Models\People;
use App\Http\Controllers\Controller;
use misterspelik\LaravelPdf\Facades\Pdf;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class PrincipalPdf extends Controller
{
    public function generatePdf($peopleId)
    {
        $people = People::with([
            'title',
            'gender',
            'religion',
            'ethnicity',
            'civilStatus',
            'bloodGroup',
            'district',
            'gnDivision',

            'myAppointments',
            'appointment',
            'currentAppointment',
            'appointmentHistory',

            'currentAppointment.workplace',
            'currentAppointment.institution',
            'currentAppointment.institution.zonalEducationOffice',
            'currentAppointment.institution.zonalEducationOffice.provincialEducationOffice',
            'currentAppointment.institution.zonalEducationOffice.provincialEducationOffice.provincialMinistryOfEducationOffice',
            'currentAppointment.institution.zonalEducationOffice.provincialEducationOffice.provincialMinistryOfEducationOffice.ministryOfEducationOffice',
            'currentAppointment.institution.divisionalEducationOffice',

            'principal',
            'principal.recruitmentCategory',

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
            ->whereHas('principal')
            ->where('people_id', $peopleId)
            ->firstOrFail();

        $svg = QrCode::format('svg')
            ->size(120)
            ->margin(1)
            ->generate($people->people_id);

        $qrCode = 'data:image/svg+xml;base64,' . base64_encode($svg);

        $pdf = Pdf::loadView('pdf.principal-profile-pdf', [
            'people' => $people,
            'qrCode' => $qrCode,
        ]);

        $pdf->SetProtection(['copy', 'print'], '', 'pass');

        $fileName = 'principal-profile-' . ($people->nic ?: $people->people_id) . '.pdf';
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
