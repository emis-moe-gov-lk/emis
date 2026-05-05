<?php

namespace App\Http\Controllers\Pdf;

use App\Models\People;
use App\Http\Controllers\Controller;
use misterspelik\LaravelPdf\Facades\Pdf;
use SimpleSoftwareIO\QrCode\Facades\QrCode;


class TeacherPdf extends Controller
{
    public function generateSimplePdf($peopleId)
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
            'currentAppointment.workplace.ministry',
            'currentAppointment.workplace.provincial',
            'currentAppointment.workplace.zonal',
            'currentAppointment.workplace.divisional',
            'currentAppointment.workplace.institution',

            'teacher',
            'teacher',
            'teacher.teacherCategory',
            'teacher.teacherType',
            'teacher.medium',
            'teacher.appointmentSubject',
            'teacher.mainSubject',
            'teacher.secondarySubject',
            'teacher.currentTeachingSubject',

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

        // Load PDF
        $pdf = Pdf::loadView('pdf.teacher-profile-pdf', [
            'people' => $people,
            'qrCode' => $qrCode,

        ]);

        $pdf->SetProtection(['copy', 'print'], '', 'pass');

        $fileName = 'teacher-profile-' . ($people->nic ?: $people->people_id) . '.pdf';
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
