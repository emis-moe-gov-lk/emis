<?php

namespace App\Http\Controllers;

use App\Http\Controllers\SoapController;

use Illuminate\Http\Request;

class SMSController extends Controller
{
    public function mobileSMSTest()
    {
        $message = 'Hi, this is a test sms gateway message. සිංහල ✔ தமிழ் ✔';

        //sent OTP
            $mobileU = '0761094038';
            //$mobileU = $mobile;
            if (substr($mobileU, 0, 1) == '0') {
                $mobileNo = '94' . substr($mobileU, 1); // Convert 076XXXXXXX to 9476XXXXXXX
            } else {
                $mobileNo = $mobileU; // Assume it's already in correct format
            }

            $SoapController = new SoapController;
            $SoapController->multilang_msg_Send($mobileNo,$message);
        //End sent OTP

        return response()->json(['message' => 'SMS sent successfully']);
    }
}
