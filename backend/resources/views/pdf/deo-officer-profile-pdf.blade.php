<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Zonal DEO Profile</title>
    <style>
        @page { margin: 18px 22px; }
        body { font-family: DejaVu Sans, sans-serif; font-size: 11px; color: #1f2937; line-height: 1.45; }
        .header { border: 1px solid #dbe3ef; border-radius: 10px; padding: 16px; margin-bottom: 14px; background: #f8fbff; }
        .header-table, .section-table { width: 100%; border-collapse: collapse; }
        .header-table td { vertical-align: top; }
        .title { font-size: 18px; font-weight: 700; margin: 0 0 4px 0; color: #0f172a; }
        .subtitle { margin: 0; color: #4b5563; font-size: 10px; }
        .badge { display: inline-block; padding: 4px 10px; border-radius: 999px; background: #2563eb; color: #fff; font-size: 10px; font-weight: 700; }
        .qr { width: 92px; height: 92px; object-fit: contain; border: 1px solid #e5e7eb; background: #fff; padding: 4px; }
        .section { border: 1px solid #e5e7eb; border-radius: 10px; margin-bottom: 12px; overflow: hidden; }
        .section h2 { margin: 0; padding: 8px 12px; font-size: 12px; color: #0f172a; background: #eef4ff; border-bottom: 1px solid #e5e7eb; }
        .section-table td { padding: 7px 10px; border-bottom: 1px solid #f1f5f9; border-right: 1px solid #f1f5f9; vertical-align: top; }
        .section-table tr:last-child td { border-bottom: none; }
        .label { color: #64748b; font-size: 9px; text-transform: uppercase; letter-spacing: 0.06em; display: block; margin-bottom: 2px; }
        .value { font-weight: 700; color: #111827; }
        .muted { color: #6b7280; font-weight: 400; }
    </style>
</head>
<body>
@php
    $fullName = trim(($people->title?->title_name ?? '') . ' ' . ($people->name_with_initials ?? ''));
    $currentAppointment = $people->currentAppointment ?? $people->appointment;
    $workplace = $currentAppointment?->workplace;
    $status = $currentAppointment?->is_confirmed === 1
        ? 'Confirmed'
        : (($currentAppointment?->is_verified === 1) ? 'Verified' : 'Pending');
@endphp

<div class="header">
    <table class="header-table" width="100%">
        <tr>
            <td width="70%">
                <div class="badge">Zonal DEO Profile Document</div>
                <h1 class="title">{{ $fullName ?: $people->full_name ?: 'Zonal DEO Profile' }}</h1>
                <p class="subtitle">Employee ID: {{ $people->people_id }} | NIC: {{ $people->nic ?? '-' }}</p>
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
            <td width="25%"><span class="label">Full Name</span><span class="value">{{ $fullName ?: '-' }}</span></td>
            <td width="25%"><span class="label">Initials</span><span class="value">{{ $people->name_with_initials ?? '-' }}</span></td>
            <td width="25%"><span class="label">Gender</span><span class="value">{{ $people->gender?->gender_name ?? '-' }}</span></td>
            <td width="25%"><span class="label">Civil Status</span><span class="value">{{ $people->civilStatus?->civil_status_name ?? '-' }}</span></td>
        </tr>
        <tr>
            <td><span class="label">Date of Birth</span><span class="value">{{ data_get($people, 'date_of_birth', '-') }}</span></td>
            <td><span class="label">Religion</span><span class="value">{{ $people->religion?->religion_name ?? '-' }}</span></td>
            <td><span class="label">Ethnicity</span><span class="value">{{ $people->ethnicity?->ethnicity_name ?? '-' }}</span></td>
            <td><span class="label">Blood Group</span><span class="value">{{ $people->bloodGroup?->blood_group_name ?? '-' }}</span></td>
        </tr>
        <tr>
            <td><span class="label">NIC</span><span class="value">{{ $people->nic ?? '-' }}</span></td>
            <td><span class="label">Email</span><span class="value">{{ $people->email ?? '-' }}</span></td>
            <td><span class="label">Phone</span><span class="value">{{ $people->phone ?? '-' }}</span></td>
            <td><span class="label">District</span><span class="value">{{ $people->district?->district_name ?? '-' }}</span></td>
        </tr>
        <tr>
            <td colspan="2"><span class="label">GN Division</span><span class="value">{{ $people->gnDivision?->gn_division_name ?? '-' }}</span></td>
            <td colspan="2"><span class="label">Profile Status</span><span class="value">{{ $status }}</span></td>
        </tr>
    </table>
</div>

<div class="section">
    <h2>Employment Details</h2>
    <table class="section-table" width="100%">
        <tr>
            <td width="25%"><span class="label">Service</span><span class="value">{{ $currentAppointment?->service?->service_name ?? '-' }}</span></td>
            <td width="25%"><span class="label">Rank</span><span class="value">{{ $currentAppointment?->rank?->rank_name ?? '-' }}</span></td>
            <td width="25%"><span class="label">Position</span><span class="value">{{ $currentAppointment?->position?->position_name ?? '-' }}</span></td>
            <td width="25%"><span class="label">Appointment Status</span><span class="value">{{ $status }}</span></td>
        </tr>
        <tr>
            <td colspan="2"><span class="label">Workplace</span><span class="value">{{ $workplace?->name ?? '-' }}</span></td>
            <td><span class="label">Office Level</span><span class="value">{{ $currentAppointment?->officeLevel?->office_level_name ?? '-' }}</span></td>
            <td><span class="label">Appointment Date</span><span class="value">{{ data_get($currentAppointment, 'appoint_date', data_get($currentAppointment, 'first_appointment_date', '-')) }}</span></td>
        </tr>
        <tr>
            <td colspan="4"><span class="label">Office Address</span><span class="value">{{ $workplace?->address ?? '-' }}</span></td>
        </tr>
    </table>
</div>

<div class="section">
    <h2>Identity Summary</h2>
    <table class="section-table" width="100%">
        <tr>
            <td width="33%"><span class="label">Employee ID</span><span class="value">{{ $people->people_id }}</span></td>
            <td width="33%"><span class="label">Confirmed</span><span class="value">{{ $status === 'Confirmed' ? 'Yes' : 'No' }}</span></td>
            <td width="34%"><span class="label">Source</span><span class="value">Development Officer Registry</span></td>
        </tr>
    </table>
</div>

</body>
</html>
