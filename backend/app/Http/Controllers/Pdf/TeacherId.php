<?php

namespace App\Http\Controllers\Pdf;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class TeacherId extends Controller
{
    public function generatePDF(Request $request, $id)
    {
        // Create PDF card (86x54 mm - standard ID card size)
        $pdf = new \TCPDF('L', 'mm', [86, 54], true, 'UTF-8', false);
        $pdf->SetMargins(0, 0, 0);
        $pdf->SetAutoPageBreak(false, 0);
        $pdf->setPrintHeader(false);
        $pdf->setPrintFooter(false);

        // Get teacher data
        $teacher = $this->getTeacherData($id);

        // FRONT SIDE - Clean Modern Design
        $pdf->AddPage();
        $this->createCleanFrontSide($pdf, $teacher);

        // BACK SIDE - QR Left, Terms Right
        $pdf->AddPage();
        $this->createCleanBackSide($pdf, $teacher);

        return $pdf->Output('teacher-id-' . $teacher['employee_id'] . '.pdf', 'I');
    }

    private function getTeacherData($id)
    {
        return [
            'employee_id' => 'EMP' . str_pad($id, 4, '0', STR_PAD_LEFT),
            'name' => 'Mr. Sarah Johnson',
            'job' => 'Mathematics Teacher',
            'department' => 'Science Department',
            'phone' => '+94 71 234 5678',
            'email' => 's.johnson@school.lk',
            'website' => 'www.school.lk',
            'photo' => public_path('images/teachers/teacher-' . $id . '.jpg'),
            'join_date' => '2020-01-15',
            'expiry_date' => '2025-12-31',
            'school_name' => 'Ministry of Education',
            'school_short' => 'MoE',
            'school_logo' => public_path('images/default_logo.png'),
            'school_phone' => '+94 11 234 5678',
            'qr_data' => 'SCHOOL:MoE|ID:EMP' . str_pad($id, 4, '0', STR_PAD_LEFT)
        ];
    }

    private function createCleanFrontSide($pdf, $teacher)
    {
        // Clean white background
        $pdf->SetFillColor(255, 255, 255);
        $pdf->Rect(0, 0, 86, 54, 'F');

        // Top Blue Bar
        $pdf->SetFillColor(25, 85, 155);
        $pdf->Rect(0, 0, 86, 12, 'F');

        // Header with Logo and School Name (Left Aligned)
        $this->createHeaderWithLogo($pdf, $teacher);

        // Photo Area - Left Side
        $this->createPhotoSection($pdf, $teacher);

        // Info Area - Right Side
        $this->createInfoSection($pdf, $teacher);

        // Bottom Bar with Employee ID and Emergency Contact
        $pdf->SetFillColor(240, 240, 240);
        $pdf->Rect(0, 46, 86, 8, 'F');

        // Employee ID on Left
        $pdf->SetTextColor(25, 85, 155);
        $pdf->SetFont('helvetica', 'B', 9);
        $pdf->SetXY(5, 47.5);
        $pdf->Cell(30, 4, $teacher['employee_id'], 0, 1, 'L');

        // Emergency Contact on Right
        $pdf->SetTextColor(100, 100, 100);
        $pdf->SetFont('helvetica', 'B', 6);
        $pdf->SetXY(35, 47.5);
        $pdf->Cell(46, 4, 'Emergency: ' . $teacher['school_phone'], 0, 1, 'C');
    }

    private function createHeaderWithLogo($pdf, $teacher)
    {
        // School Logo (Left Side)
        $logo = file_exists($teacher['school_logo']) ? $teacher['school_logo'] : null;
        if ($logo) {
            $pdf->Image($logo, 3, 1, 8, 8, '', '', '', false, 300, '', false, false, 0, false, false, false);
        } else {
            // Fallback logo circle
            $pdf->SetFillColor(255, 255, 255);
            $pdf->RoundedRect(3, 1, 8, 8, 4, '1111', 'F');
            $pdf->SetTextColor(25, 85, 155);
            $pdf->SetFont('helvetica', 'B', 6);
            $pdf->SetXY(3, 3);
            $pdf->Cell(8, 4, $teacher['school_short'], 0, 1, 'C');
        }

        // School Name (Left Aligned next to logo)
        $pdf->SetTextColor(255, 255, 255);
        $pdf->SetFont('helvetica', 'B', 9);
        $pdf->SetXY(12, 2);
        $pdf->Cell(50, 4, $teacher['school_name'], 0, 1, 'L');

        // Staff Identity Card (Left Aligned below school name)
        $pdf->SetTextColor(255, 255, 255, 200);
        $pdf->SetFont('helvetica', '', 7);
        $pdf->SetXY(12, 6);
        $pdf->Cell(50, 4, 'IDENTITY CARD', 0, 1, 'L');

        // Issue Date (Right Side)
        $pdf->SetTextColor(255, 255, 255, 180);
        $pdf->SetFont('helvetica', '', 6);
        $pdf->SetXY(65, 2);
        $pdf->Cell(18, 3, 'Issued: ' . date('M Y'), 0, 1, 'R');

        $pdf->SetXY(65, 5);
        $pdf->Cell(18, 3, 'Expires: ' . date('M Y', strtotime($teacher['expiry_date'])), 0, 1, 'R');
    }

    private function createPhotoSection($pdf, $teacher)
    {
        // Photo Container
        $pdf->SetFillColor(245, 245, 245);
        $pdf->RoundedRect(5, 15, 28, 30, 3, '1111', 'F');

        // Photo
        $photo = file_exists($teacher['photo']) ? $teacher['photo'] : public_path('images/default-avatar.png');
        $pdf->Image($photo, 6, 16, 26, 24, '', '', '', false, 300, '', false, false, 0, false, false, false);

        // Photo Border
        $pdf->SetDrawColor(200, 200, 200);
        $pdf->RoundedRect(5, 15, 28, 30, 3, '1111');
    }

    private function createInfoSection($pdf, $teacher)
    {
        $pdf->SetTextColor(50, 50, 50);

        // Name
        $pdf->SetFont('helvetica', 'B', 11);
        $pdf->SetXY(35, 15);
        $pdf->Cell(48, 6, $teacher['name'], 0, 1, 'L');

        // Job Title
        $pdf->SetTextColor(25, 85, 155);
        $pdf->SetFont('helvetica', 'B', 8);
        $pdf->SetXY(35, 21);
        $pdf->Cell(48, 4, $teacher['job'], 0, 1, 'L');

        // Department
        $pdf->SetTextColor(100, 100, 100);
        $pdf->SetFont('helvetica', '', 7);
        $pdf->SetXY(35, 25);
        $pdf->Cell(48, 4, $teacher['department'], 0, 1, 'L');

        // Separator Line
        $pdf->SetDrawColor(220, 220, 220);
        $pdf->Line(35, 29, 78, 29);

        // Contact Info
        $pdf->SetTextColor(70, 70, 70);
        $pdf->SetFont('helvetica', '', 7);

        // Phone
        $pdf->SetXY(35, 31);
        $pdf->Cell(48, 4, $teacher['phone'], 0, 1, 'L');

        // Email
        $pdf->SetXY(35, 35);
        $pdf->Cell(48, 4, $teacher['email'], 0, 1, 'L');

        // Join Date
        $pdf->SetXY(35, 39);
        $pdf->Cell(48, 4, 'Since ' . date('M Y', strtotime($teacher['join_date'])), 0, 1, 'L');
    }

    private function createCleanBackSide($pdf, $teacher)
    {
        // Clean white background
        $pdf->SetFillColor(255, 255, 255);
        $pdf->Rect(0, 0, 86, 54, 'F');

        // Top Gray Bar with Logo
        $pdf->SetFillColor(240, 240, 240);
        $pdf->Rect(0, 0, 86, 8, 'F');

        // Back Side Header with Logo
        $logo = file_exists($teacher['school_logo']) ? $teacher['school_logo'] : null;
        if ($logo) {
            $pdf->Image($logo, 3, 1, 6, 6, '', '', '', false, 300, '', false, false, 0, false, false, false);
        }

        // Back Side Title
        $pdf->SetTextColor(100, 100, 100);
        $pdf->SetFont('helvetica', 'B', 8);
        $pdf->SetXY(10, 2);
        $pdf->Cell(76, 4, 'IDENTIFICATION CARD', 0, 1, 'C');

        // Left Side - QR Code (Left Aligned)
        $this->createQRCodeSection($pdf, $teacher);

        // Right Side - Terms & Conditions
        $this->createTermsSection($pdf, $teacher);

        // Bottom Footer
        $pdf->SetFillColor(240, 240, 240);
        $pdf->Rect(0, 48, 86, 6, 'F');

        $pdf->SetTextColor(100, 100, 100);
        $pdf->SetFont('helvetica', '', 6);
        $pdf->SetXY(0, 49.5);
        $pdf->Cell(86, 3, 'Issued by Department of Education', 0, 1, 'C');
    }

    private function createQRCodeSection($pdf, $teacher)
    {
        // QR Code Container - Left Aligned
        $pdf->SetFillColor(245, 245, 245);
        $pdf->RoundedRect(5, 12, 22, 22, 3, '1111', 'F');

        // QR Code
        $style = array(
            'border' => 0,
            'vpadding' => 1,
            'hpadding' => 1,
            'fgcolor' => array(0, 0, 0),
            'bgcolor' => array(245, 245, 245),
            'module_width' => 1,
            'module_height' => 1
        );

        try {
            // QR code left aligned
            $pdf->write2DBarcode($teacher['qr_data'], 'QRCODE,L', 7, 14, 18, 18, $style, 'N');
        } catch (\Exception $e) {
            $this->createSimpleQRFallback($pdf, $teacher);
        }

        // QR Border
        $pdf->SetDrawColor(200, 200, 200);
        $pdf->RoundedRect(5, 12, 22, 22, 3, '1111');

        // Scan Text below QR
        $pdf->SetTextColor(80, 80, 80);
        $pdf->SetFont('helvetica', 'B', 6);
        $pdf->SetXY(5, 34);
        $pdf->Cell(22, 3, 'SCAN TO VERIFY', 0, 1, 'C');
    }

    private function createTermsSection($pdf, $teacher)
    {
        // Terms Container - Right Side (wider due to left aligned QR)
        $pdf->SetFillColor(250, 250, 250);
        $pdf->RoundedRect(29, 12, 52, 30, 3, '1111', 'F');

        $pdf->SetTextColor(60, 60, 60);

        // Section Title
        $pdf->SetFont('helvetica', 'B', 8);
        $pdf->SetXY(29, 14);
        $pdf->Cell(52, 4, 'TERMS & CONDITIONS', 0, 1, 'C');

        // Terms Content - More space for text
        $terms = [
            '• Property of ' . $teacher['school_name'],
            '• Must be carried on school premises',
            '• Non-transferable - Official use only',
            '• Present upon request by staff',
            '• Report lost cards immediately',
            '• Valid until ' . date('M Y', strtotime($teacher['expiry_date'])),
            '• Unauthorized use prohibited'
        ];

        $pdf->SetFont('helvetica', '', 6);
        $yPosition = 18;
        
        foreach ($terms as $term) {
            $pdf->SetXY(31, $yPosition);
            $pdf->MultiCell(48, 3, $term, 0, 'L');
            $yPosition += 3.2;
        }

        // Terms Border
        $pdf->SetDrawColor(200, 200, 200);
        $pdf->RoundedRect(29, 12, 52, 30, 3, '1111');
    }

    private function createSimpleQRFallback($pdf, $teacher)
    {
        $pdf->SetFillColor(230, 230, 230);
        $pdf->RoundedRect(7, 14, 18, 18, 2, '1111', 'F');
        
        $pdf->SetTextColor(150, 150, 150);
        $pdf->SetFont('helvetica', 'B', 5);
        $pdf->SetXY(7, 18);
        $pdf->Cell(18, 4, 'VERIFY', 0, 1, 'C');
        
        $pdf->SetFont('helvetica', 'B', 7);
        $pdf->SetXY(7, 21);
        $pdf->Cell(18, 4, $teacher['employee_id'], 0, 1, 'C');
        
        $pdf->SetFont('helvetica', '', 4);
        $pdf->SetXY(7, 24);
        $pdf->Cell(18, 3, 'Scan QR', 0, 1, 'C');
    }
}