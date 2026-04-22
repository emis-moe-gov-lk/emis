<?php

namespace App\Exports;

use App\Models\Teacher;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Cell\DefaultValueBinder;
use PhpOffice\PhpSpreadsheet\Cell\Cell;
use PhpOffice\PhpSpreadsheet\Cell\DataType;

class TeacherListExport implements FromCollection, WithHeadings, ShouldAutoSize, WithStyles
{
    /**
     * @return \Illuminate\Support\Collection
     */
    public function collection()
    {
        // return Teacher::orderBy('created_at', 'desc')
        //     ->limit(1000)
        //     ->get()
        //     ->map(function ($teacher) {

        //         $appointment = $teacher->currentAppointment;
        //         $workplace = $appointment?->workplace;
        //         $institution = $workplace?->institution;
        //         $zonalOffice = $institution?->zonalEducationOffice;
        //         $employee = $teacher->employee;

        //         return [
        //             'zeo_wp_id' => $institution?->zeo_wp_id ?? '',
        //             'short_name' => $zonalOffice?->short_name ?? '',
        //             'census_no' => $institution?->census_no ?? '',
        //             'school_name' => $institution?->name ?? '',
        //             'people_id' => $employee?->people_id ?? '',
        //             'full_name' => $employee?->full_name ?? '',
        //             'nic' => $employee?->nic ?? '',
        //         ];
        //     });
        return Teacher::orderBy('created_at', 'desc')
            ->whereHas('currentAppointment', function ($query) {
                $query->where('workplace_id', 'like', 'INS%')
                    ->whereHas('institution.zonalEducationOffice', function ($query) {
                        $query->where('peo_wp_id', '!=', 'PDE0000001');
                    });
            })
            ->limit(1000)
            ->get()
            ->map(function ($teacher) {
                return [
                    'zeo_wp_id' => $teacher->currentAppointment->workplace->institution->zeo_wp_id ?? null,
                    'short_name' => $teacher->currentAppointment->workplace->institution->zonalEducationOffice->short_name ?? null,
                    'census_no' => $teacher->currentAppointment->workplace->institution->census_no ?? null,
                    'school_name' => $teacher->currentAppointment->workplace->institution->name ?? null,
                    'people_id' => $teacher->employee->people_id ?? null,
                    'full_name' => $teacher->employee->full_name ?? null,
                    'nic' => $teacher->employee->nic ?? null,
                ];
            });
    }

    public function headings(): array
    {
        return [
            'ZEO WP ID',
            'Zonal Office',
            'Census No',
            'School Name',
            'People ID',
            'Full Name',
            'NIC',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => [ // header row
                'font' => ['bold' => true],
            ],
        ];
    }

}
