<?php

namespace App\Http\Controllers\Excel;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Exports\TeacherListExport;
use Maatwebsite\Excel\Facades\Excel;

class TeacherController extends Controller
{
    public function exportTeachers()
    {
        return Excel::download(new TeacherListExport, 'teachers.xlsx');
    }
}
