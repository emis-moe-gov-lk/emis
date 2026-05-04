<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Teacher Profile</title>
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
            background: #2563eb;
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
            background: #eef4ff;
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
<?php
    $fullName = trim(($people->title?->title_name ?? '') . ' ' . ($people->name_with_initials ?? ''));
    $currentAppointment = $people->currentAppointment ?? $people->appointment;
    $workplace = $currentAppointment?->workplace;
    $subjects = collect([
        data_get($people, 'teacher.appointmentSubject.name_si', data_get($people, 'teacher.appointmentSubject.name_en')),
        data_get($people, 'teacher.mainSubject.name_si', data_get($people, 'teacher.mainSubject.name_en')),
        data_get($people, 'teacher.secondarySubject.name_si', data_get($people, 'teacher.secondarySubject.name_en')),
        data_get($people, 'teacher.currentTeachingSubject.name_si', data_get($people, 'teacher.currentTeachingSubject.name_en')),
    ])->filter()->unique()->values();
    $qualifications = collect($people->educationQualifications ?? []);
    $familyMembers = collect($people->familiesAsHusband ?? [])
        ->merge($people->familiesAsWife ?? []);
?>

<div class="header">
    <table class="header-table" width="100%">
        <tr>
            <td width="70%">
                <div class="badge">Teacher Profile Document</div>
                <h1 class="title"><?php echo e($fullName ?: $people->full_name ?: 'Teacher Profile'); ?></h1>
                <p class="subtitle">Employee ID: <?php echo e($people->people_id); ?> | NIC: <?php echo e($people->nic ?? '—'); ?></p>
            </td>
            <td width="15%" align="right">
                <?php if(!empty($qrCode)): ?>
                    <img class="qr" src="<?php echo e($qrCode); ?>" alt="QR Code">
                <?php endif; ?>
            </td>
        </tr>
    </table>
</div>

<div class="section">
    <h2>Personal Information</h2>
    <table class="section-table" width="100%">
        <tr>
            <td width="25%"><span class="label">Full Name</span><span class="value"><?php echo e($fullName ?: '—'); ?></span></td>
            <td width="25%"><span class="label">Initials</span><span class="value"><?php echo e($people->name_with_initials ?? '—'); ?></span></td>
            <td width="25%"><span class="label">Title</span><span class="value"><?php echo e($people->title?->title_name ?? '—'); ?></span></td>
            <td width="25%"><span class="label">Gender</span><span class="value"><?php echo e($people->gender?->gender_name ?? '—'); ?></span></td>
        </tr>
        <tr>
            <td><span class="label">Date of Birth</span><span class="value"><?php echo e(data_get($people, 'date_of_birth', '—')); ?></span></td>
            <td><span class="label">Civil Status</span><span class="value"><?php echo e($people->civilStatus?->civil_status_name ?? '—'); ?></span></td>
            <td><span class="label">Religion</span><span class="value"><?php echo e($people->religion?->religion_name ?? '—'); ?></span></td>
            <td><span class="label">Ethnicity</span><span class="value"><?php echo e($people->ethnicity?->ethnicity_name ?? '—'); ?></span></td>
        </tr>
        <tr>
            <td><span class="label">NIC</span><span class="value"><?php echo e($people->nic ?? '—'); ?></span></td>
            <td><span class="label">Mobile</span><span class="value"><?php echo e($people->mobile ?? $people->phone ?? '—'); ?></span></td>
            <td><span class="label">Email</span><span class="value"><?php echo e($people->email ?? '—'); ?></span></td>
            <td><span class="label">Blood Group</span><span class="value"><?php echo e($people->bloodGroup?->blood_group_name ?? '—'); ?></span></td>
        </tr>
        <tr>
            <td colspan="2"><span class="label">Permanent Address</span><span class="value"><?php echo e(data_get($people, 'permanent_address', '—')); ?></span></td>
            <td colspan="2"><span class="label">Current Address</span><span class="value"><?php echo e(data_get($people, 'current_address', '—')); ?></span></td>
        </tr>
        <tr>
            <td><span class="label">District</span><span class="value"><?php echo e($people->district?->district_name ?? '—'); ?></span></td>
            <td><span class="label">GN Division</span><span class="value"><?php echo e($people->gnDivision?->gn_division_name ?? '—'); ?></span></td>
            <td><span class="label">Employee ID</span><span class="value"><?php echo e($people->people_id); ?></span></td>
            <td><span class="label">Profile Status</span><span class="value"><?php echo e(data_get($people, 'appointment.profile_status', data_get($people, 'profile_status', '—'))); ?></span></td>
        </tr>
    </table>
</div>

<div class="section">
    <h2>Employment Details</h2>
    <table class="section-table" width="100%">
        <tr>
            <td width="25%"><span class="label">Service</span><span class="value"><?php echo e($currentAppointment?->service?->service_name ?? '—'); ?></span></td>
            <td width="25%"><span class="label">W&amp;OP No</span><span class="value"><?php echo e($currentAppointment?->w_op_no ?? $currentAppointment?->wop_no ?? '—'); ?></span></td>
            <td width="25%"><span class="label">Pay Sheet No</span><span class="value"><?php echo e($currentAppointment?->pay_sheet_no ?? '—'); ?></span></td>
            <td width="25%"><span class="label">Appointment Status</span><span class="value"><?php echo e($currentAppointment?->is_confirmed === 1 ? 'Confirmed' : ($currentAppointment?->is_verified === 1 ? 'Verified' : 'Pending')); ?></span></td>
        </tr>
        <tr>
            <td colspan="2"><span class="label">Institution</span><span class="value"><?php echo e($workplace?->institution?->name ?? '—'); ?></span></td>
            <td><span class="label">Zonal Office</span><span class="value"><?php echo e($workplace?->zonal?->name ?? '—'); ?></span></td>
            <td><span class="label">Divisional Office</span><span class="value"><?php echo e($workplace?->divisional?->name ?? '—'); ?></span></td>
        </tr>
        <tr>
            <td><span class="label">Ministry</span><span class="value"><?php echo e($workplace?->ministry?->name ?? '—'); ?></span></td>
            <td><span class="label">Provincial Office</span><span class="value"><?php echo e($workplace?->provincial?->name ?? '—'); ?></span></td>
            <td><span class="label">Current Teaching Subject</span><span class="value"><?php echo e(data_get($people, 'teacher.currentTeachingSubject.name_si', data_get($people, 'teacher.currentTeachingSubject.name_en', '—'))); ?></span></td>
            <td><span class="label">Current Appointment Type</span><span class="value"><?php echo e(data_get($people, 'currentAppointment.appointment_type', data_get($people, 'appointment.appointment_type', '—'))); ?></span></td>
        </tr>
    </table>
</div>

<div class="section">
    <h2>Subjects</h2>
    <table class="section-table" width="100%">
        <tr>
            <td>
                <span class="label">Assigned Subjects</span>
                <span class="value"><?php echo e($subjects->isNotEmpty() ? $subjects->implode(', ') : '—'); ?></span>
            </td>
        </tr>
    </table>
</div>

<div class="section">
    <h2>Teacher Details</h2>
    <table class="section-table" width="100%">
        <tr>
            <td width="25%"><span class="label">Teacher Category</span><span class="value"><?php echo e(data_get($people, 'teacher.teacherCategory.name', data_get($people, 'teacher.teacher_category', '—'))); ?></span></td>
            <td width="25%"><span class="label">Trained</span><span class="value"><?php echo e(data_get($people, 'teacher.teacherCategory.name') === 'Trained' ? 'Yes' : 'No'); ?></span></td>
            <td width="25%"><span class="label">Teacher Type</span><span class="value"><?php echo e(data_get($people, 'teacher.teacherType.type_name', data_get($people, 'teacher.teacher_type', '—'))); ?></span></td>
            <td width="25%"><span class="label">Medium</span><span class="value"><?php echo e(data_get($people, 'teacher.medium.name', data_get($people, 'teacher.appointment_medium', '—'))); ?></span></td>
        </tr>
        <tr>
            <td colspan="2"><span class="label">Appointment Subject</span><span class="value"><?php echo e(data_get($people, 'teacher.appointmentSubject.name_si', data_get($people, 'teacher.appointmentSubject.name_en', '—'))); ?></span></td>
            <td><span class="label">Main Teaching Subject</span><span class="value"><?php echo e(data_get($people, 'teacher.mainSubject.name_si', data_get($people, 'teacher.mainSubject.name_en', '—'))); ?></span></td>
            <td><span class="label">Secondary Subject</span><span class="value"><?php echo e(data_get($people, 'teacher.secondarySubject.name_si', data_get($people, 'teacher.secondarySubject.name_en', '—'))); ?></span></td>
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
        <?php $__empty_1 = true; $__currentLoopData = $qualifications; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $qualification): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>
            <tr>
                <td><span class="value"><?php echo e(data_get($qualification, 'qualification.qualification_name', data_get($qualification, 'qualification_name', '—'))); ?></span></td>
                <td><span class="value"><?php echo e(data_get($qualification, 'qualificationGrade.grade_name', data_get($qualification, 'grade', '—'))); ?></span></td>
                <td><span class="value"><?php echo e(data_get($qualification, 'year', data_get($qualification, 'passed_year', '—'))); ?></span></td>
                <td><span class="value"><?php echo e(data_get($qualification, 'institute', '—')); ?></span></td>
            </tr>
        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>
            <tr>
                <td colspan="4" class="muted">No education records available.</td>
            </tr>
        <?php endif; ?>
    </table>
</div>

<div class="section">
    <h2>Family Information</h2>
    <table class="section-table" width="100%">
        <tr>
            <td width="40%"><span class="label">Family Record Count</span><span class="value"><?php echo e($familyMembers->count() ?: '0'); ?></span></td>
            <td width="60%"><span class="label">Children / Relations</span><span class="value"><?php echo e($familyMembers->isNotEmpty() ? 'Included in attached family data' : '—'); ?></span></td>
        </tr>
        <?php $__empty_1 = true; $__currentLoopData = $familyMembers; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $family): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>
            <tr>
                <td><span class="label">Member</span><span class="value"><?php echo e(data_get($family, 'memberA.name_with_initials', data_get($family, 'memberB.name_with_initials', data_get($family, 'member_name', '—')))); ?></span></td>
                <td><span class="label">Notes</span><span class="value"><?php echo e(data_get($family, 'relationship', data_get($family, 'relation', '—'))); ?></span></td>
            </tr>
        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>
            <tr>
                <td colspan="2" class="muted">No family records available.</td>
            </tr>
        <?php endif; ?>
    </table>
</div>

<div class="section">
    <h2>Appointment History</h2>
    <table class="section-table" width="100%">
        <tr>
            <td width="20%"><span class="label">Records</span><span class="value"><?php echo e(collect($people->appointmentHistory ?? [])->count()); ?></span></td>
            <td width="80%"><span class="label">Status</span><span class="value"><?php echo e(collect($people->appointmentHistory ?? [])->isNotEmpty() ? 'Available in profile data' : 'No appointment history records found.'); ?></span></td>
        </tr>
    </table>
</div>

</body>
</html>
<?php /**PATH E:\nemis airforce\monoripo\emis\backend\resources\views/pdf/teacher-profile-pdf.blade.php ENDPATH**/ ?>