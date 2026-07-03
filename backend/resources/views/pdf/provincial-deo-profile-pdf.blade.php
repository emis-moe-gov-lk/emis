<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Provincial DEO Profile</title>
    <style>
        @page {
            margin: 18px 22px;
        }

        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 11px;
            color: #1f2937;
            line-height: 1.45;
        }

        .header {
            border: 1px solid #dbe3ef;
            border-radius: 10px;
            padding: 16px;
            margin-bottom: 14px;
            background: #f8fbff;
        }

        .header-table,
        .section-table {
            width: 100%;
            border-collapse: collapse;
        }

        .header-table td {
            vertical-align: top;
        }

        .title {
            font-size: 18px;
            font-weight: 700;
            margin: 0 0 4px 0;
            color: #0f172a;
        }

        .subtitle {
            margin: 0;
            color: #4b5563;
            font-size: 10px;
        }

        .badge {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 999px;
            background: #0d9488; /* Teal color for office admin */
            color: #fff;
            font-size: 10px;
            font-weight: 700;
        }

        .qr {
            width: 92px;
            height: 92px;
            object-fit: contain;
            border: 1px solid #e5e7eb;
            background: #fff;
            padding: 4px;
        }

        .section {
            border: 1px solid #e5e7eb;
            border-radius: 10px;
            margin-bottom: 12px;
            overflow: hidden;
        }

        .section h2 {
            margin: 0;
            padding: 8px 12px;
            font-size: 12px;
            color: #0f172a;
            background: #f0fdfa; /* Teal tint */
            border-bottom: 1px solid #e5e7eb;
        }

        .section-table td {
            padding: 7px 10px;
            border-bottom: 1px solid #f1f5f9;
            border-right: 1px solid #f1f5f9;
            vertical-align: top;
        }

        .section-table tr:last-child td {
            border-bottom: none;
        }

        .label {
            color: #64748b;
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            display: block;
            margin-bottom: 2px;
        }

        .value {
            font-weight: 700;
            color: #111827;
        }

        .muted {
            color: #6b7280;
            font-weight: 400;
        }
    </style>
</head>
<body>
@php
    $fullName = trim(($people->title?->title_name ?? '') . ' ' . ($people->name_with_initials ?? ''));
    $currentAppointment = $people->currentAppointment ?? $people->appointment;
    $workplace = $currentAppointment?->workplace;
    $qualifications = collect($people->educationQualifications ?? []);
    $familyMembers = collect($people->familiesAsHusband ?? [])
        ->merge($people->familiesAsWife ?? []);
@endphp

<div class="header">
    <table class="header-table" width="100%">
        <tr>
            <td width="70%">
                <div class="badge">Provincial Education DEO Profile Document</div>
                <h1 class="title">{{ $fullName ?: $people->full_name ?: 'Provincial DEO Profile' }}</h1>
                <p class="subtitle">Employee ID: {{ $people->people_id }} | NIC: {{ $people->nic ?? '—' }}</p>
            </td>
            <td width="15%" align="right">
                @if(!empty($qrCode))
                    <img class="qr" src="{{ $qrCode }}" alt="QR Code">
                @endif
            </td>
        </tr>
    </table>
</div>

<div class="section">
    <h2>Personal Information</h2>
    <table class="section-table" width="100%">
        <tr>
            <td width="25%"><span class="label">Full Name</span><span class="value">{{ $fullName ?: '—' }}</span></td>
            <td width="25%"><span class="label">Initials</span><span class="value">{{ $people->name_with_initials ?? '—' }}</span></td>
            <td width="25%"><span class="label">Title</span><span class="value">{{ $people->title?->title_name ?? '—' }}</span></td>
            <td width="25%"><span class="label">Gender</span><span class="value">{{ $people->gender?->gender_name ?? '—' }}</span></td>
        </tr>
        <tr>
            <td><span class="label">Date of Birth</span><span class="value">{{ data_get($people, 'date_of_birth', '—') }}</span></td>
            <td><span class="label">Civil Status</span><span class="value">{{ $people->civilStatus?->civil_status_name ?? '—' }}</span></td>
            <td><span class="label">Religion</span><span class="value">{{ $people->religion?->religion_name ?? '—' }}</span></td>
            <td><span class="label">Ethnicity</span><span class="value">{{ $people->ethnicity?->ethnicity_name ?? '—' }}</span></td>
        </tr>
        <tr>
            <td><span class="label">NIC</span><span class="value">{{ $people->nic ?? '—' }}</span></td>
            <td><span class="label">Mobile</span><span class="value">{{ $people->mobile ?? $people->phone ?? '—' }}</span></td>
            <td><span class="label">Email</span><span class="value">{{ $people->email ?? '—' }}</span></td>
            <td><span class="label">Blood Group</span><span class="value">{{ $people->bloodGroup?->blood_group_name ?? '—' }}</span></td>
        </tr>
        <tr>
            <td colspan="2"><span class="label">Permanent Address</span><span class="value">{{ data_get($people, 'permanent_address', '—') }}</span></td>
            <td colspan="2"><span class="label">Current Address</span><span class="value">{{ data_get($people, 'current_address', '—') }}</span></td>
        </tr>
        <tr>
            <td><span class="label">District</span><span class="value">{{ $people->district?->district_name ?? '—' }}</span></td>
            <td><span class="label">GN Division</span><span class="value">{{ $people->gnDivision?->gn_division_name ?? '—' }}</span></td>
            <td><span class="label">Employee ID</span><span class="value">{{ $people->people_id }}</span></td>
            <td><span class="label">Profile Status</span><span class="value">{{ data_get($people, 'appointment.profile_status', data_get($people, 'profile_status', '—')) }}</span></td>
        </tr>
    </table>
</div>

<div class="section">
    <h2>Employment &amp; Appointment Details</h2>
    <table class="section-table" width="100%">
        <tr>
            <td width="25%"><span class="label">Service</span><span class="value">{{ $currentAppointment?->service?->service_name ?? '—' }}</span></td>
            <td width="25%"><span class="label">W&amp;OP No</span><span class="value">{{ $currentAppointment?->w_op_no ?? $currentAppointment?->wop_no ?? '—' }}</span></td>
            <td width="25%"><span class="label">Pay Sheet No</span><span class="value">{{ $currentAppointment?->pay_sheet_no ?? '—' }}</span></td>
            <td width="25%"><span class="label">Appointment Status</span><span class="value">{{ $currentAppointment?->is_confirmed === 1 ? 'Confirmed' : ($currentAppointment?->is_verified === 1 ? 'Verified' : 'Pending') }}</span></td>
        </tr>
        <tr>
            <td colspan="2"><span class="label">Workplace / Office</span><span class="value">{{ $workplace?->institution?->name ?? $workplace?->ministry?->name ?? $workplace?->provincial?->name ?? $workplace?->zonal?->name ?? '—' }}</span></td>
            <td><span class="label">Position</span><span class="value">{{ $currentAppointment?->position?->position_name ?? '—' }}</span></td>
            <td><span class="label">Rank / Class</span><span class="value">{{ $currentAppointment?->rank?->rank_name ?? '—' }}</span></td>
        </tr>
        <tr>
            <td><span class="label">Ministry</span><span class="value">{{ $workplace?->ministry?->name ?? '—' }}</span></td>
            <td><span class="label">Provincial Office</span><span class="value">{{ $workplace?->provincial?->name ?? '—' }}</span></td>
            <td><span class="label">Zonal Office</span><span class="value">{{ $workplace?->zonal?->name ?? '—' }}</span></td>
            <td><span class="label">Divisional Office</span><span class="value">{{ $workplace?->divisional?->name ?? '—' }}</span></td>
        </tr>
    </table>
</div>

<div class="section">
    <h2>Education Qualifications</h2>
    <table class="section-table" width="100%">
        <tr>
            <td width="35%"><span class="label">Qualification</span></td>
            <td width="20%"><span class="label">Grade</span></td>
            <td width="20%"><span class="label">Year</span></td>
            <td width="25%"><span class="label">Institute</span></td>
        </tr>
        @forelse($qualifications as $qualification)
            <tr>
                <td><span class="value">{{ data_get($qualification, 'qualification.qualification_name', data_get($qualification, 'qualification_name', '—')) }}</span></td>
                <td><span class="value">{{ data_get($qualification, 'qualificationGrade.grade_name', data_get($qualification, 'grade', '—')) }}</span></td>
                <td><span class="value">{{ data_get($qualification, 'year', data_get($qualification, 'passed_year', '—')) }}</span></td>
                <td><span class="value">{{ data_get($qualification, 'institute', '—') }}</span></td>
            </tr>
        @empty
            <tr>
                <td colspan="4" class="muted">No education records available.</td>
            </tr>
        @endforelse
    </table>
</div>

<div class="section">
    <h2>Family Information</h2>
    <table class="section-table" width="100%">
        <tr>
            <td width="40%"><span class="label">Family Record Count</span><span class="value">{{ $familyMembers->count() ?: '0' }}</span></td>
            <td width="60%"><span class="label">Relations</span><span class="value">{{ $familyMembers->isNotEmpty() ? 'Included in profile data' : '—' }}</span></td>
        </tr>
        @forelse($familyMembers as $family)
            <tr>
                <td><span class="label">Member</span><span class="value">{{ data_get($family, 'memberA.name_with_initials', data_get($family, 'memberB.name_with_initials', data_get($family, 'member_name', '—'))) }}</span></td>
                <td><span class="label">Relationship</span><span class="value">{{ data_get($family, 'relationship', data_get($family, 'relation', '—')) }}</span></td>
            </tr>
        @empty
            <tr>
                <td colspan="2" class="muted">No family records available.</td>
            </tr>
        @endforelse
    </table>
</div>

<div class="section">
    <h2>Appointment &amp; Service History</h2>
    <table class="section-table" width="100%">
        <tr>
            <td width="20%"><span class="label">Records</span><span class="value">{{ collect($people->appointmentHistory ?? [])->count() }}</span></td>
            <td width="80%"><span class="label">Status</span><span class="value">{{ collect($people->appointmentHistory ?? [])->isNotEmpty() ? 'Available in profile history' : 'No service history records found.' }}</span></td>
        </tr>
    </table>
</div>

</body>
</html>
