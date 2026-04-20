<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use SoapClient;
use \stdClass;
use Session;

class SoapController extends Controller
{
	function getClient()
	{

		ini_set("soap.wsdl_cache_enabled", "0");
		$client = new SoapClient("https://msmsenterpriseapi.mobitel.lk/mSMSEnterpriseAPI/mSMSEnterpriseAPI.wsdl");

		return $client;
	}


	//serviceTest
	public function serviceTest($id, $username, $password, $customer)
	{

		$client = $this->getClient();

		$user = new stdClass();
		$user->id = '';
		$user->username = $username;
		$user->password = $password;
		$user->customer = '';

		$serviceTest = new stdClass();
		$serviceTest->arg0 = $user;

		return $client->serviceTest($serviceTest);
	}

	//create session
	public function createSession($id, $username, $password, $customer)
	{

		$client = $this->getClient();

		$user = new stdClass();
		$user->id = $id;
		$user->username = $username;
		$user->password = $password;
		$user->customer = $customer;

		$createSession = new stdClass();
		$createSession->user = $user;

		$createSessionResponse = new stdClass();
		$createSessionResponse = $client->createSession($createSession);

		return $createSessionResponse->return;
	}

	//check if session is valid
	public function isSession($session)
	{

		$client = $this->getClient();

		$isSession = new stdClass();
		$isSession->session = $session;

		$isSessionResponse = new stdClass();
		$isSessionResponse = $client->isSession($isSession);

		return $isSessionResponse->return;
	}

	//send SMS to recipients
	public function sendMessages($session, $alias, $message, $recipients, $messageType)
	{
		$client = $this->getClient();

		$smsMessage = new stdClass();
		$smsMessage->message = $message;
		$smsMessage->messageId = 0;
		$smsMessage->recipients = $recipients;
		$smsMessage->retries = 0;
		$smsMessage->sender = $alias;
		$smsMessage->messageType = $messageType;
		$smsMessage->sequenceNum = 0;
		$smsMessage->status = 0;
		$smsMessage->time = "";
		$smsMessage->type = "";
		$smsMessage->user = "";

		$sendMessages = new stdClass();
		$sendMessages->session = $session;
		$sendMessages->smsMessage = $smsMessage;

		$sendMessagesResponse = new stdClass();
		$sendMessagesResponse = $client->sendMessages($sendMessages);

		return $sendMessagesResponse->return;
	}

	//send Unicoded SMS to recipients
	public function sendMessagesMultiLang($session, $alias, $message, $recipients, $messageType)
	{
		$client = $this->getClient();

		$smsMessageMultiLang = new stdClass();
		$smsMessageMultiLang->message = $message;
		$smsMessageMultiLang->messageId = 0;
		$smsMessageMultiLang->recipients = $recipients;
		$smsMessageMultiLang->retries = 0;
		$smsMessageMultiLang->sender = $alias;
		$smsMessageMultiLang->messageType = $messageType;
		$smsMessageMultiLang->sequenceNum = 0;
		$smsMessageMultiLang->status = 0;
		$smsMessageMultiLang->time = "";
		$smsMessageMultiLang->type = "";
		$smsMessageMultiLang->user = "";

		$sendMessagesMultiLang = new stdClass();
		$sendMessagesMultiLang->session = $session;
		$sendMessagesMultiLang->smsMessageMultiLang = $smsMessageMultiLang;

		$sendMessagesMultiLangResponse = new stdClass();
		$sendMessagesMultiLangResponse = $client->sendMessagesMultiLang($sendMessagesMultiLang);

		return $sendMessagesMultiLangResponse->return;
	}

	//send Campaign SMS to recipients
	public function sendCampaignMessages($session, $alias, $message, $recipients, $datetime, $multilanguage, $messageType)
	{
		$client = $this->getClient();

		$smsCampaignMessage = new stdClass();
		$smsCampaignMessage->message = $message;
		$smsCampaignMessage->messageId = 0;
		$smsCampaignMessage->recipients = $recipients;
		$smsCampaignMessage->retries = 0;
		$smsCampaignMessage->sender = $alias;
		$smsCampaignMessage->messageType = $messageType;
		$smsCampaignMessage->sequenceNum = 0;
		$smsCampaignMessage->status = 0;
		$smsCampaignMessage->time = $datetime;
		$smsCampaignMessage->type = "";
		$smsCampaignMessage->user = "";
		$smsCampaignMessage->esmClass = $multilanguage;

		$sendCampaignMessages = new stdClass();
		$sendCampaignMessages->session = $session;
		$sendCampaignMessages->smsCampaignMessage = $smsCampaignMessage;


		$sendCampaignMessagesResponse = new stdClass();
		$sendCampaignMessagesResponse = $client->sendCampaignMessages($sendCampaignMessages);

		return $sendCampaignMessagesResponse->return;
	}

	//renew session 
	public function renewSession($session)
	{

		$client = $this->getClient();

		$renewSession = new stdClass();
		$renewSession->session = $session;

		$renewSessionResponse = new stdClass();
		$renewSessionResponse = $client->renewSession($renewSession);

		return $renewSessionResponse->return;
	}


	//close session
	public function closeSession($session)
	{

		$client = $this->getClient();

		$closeSession = new stdClass();
		$closeSession->session = $session;

		$client->closeSession($closeSession);
	}

	//retrieve messages from shortcode
	public function getMessagesFromShortCode($session, $shortCode)
	{

		$client = $this->getClient();

		$getMessagesFromShortCode = new stdClass();
		$getMessagesFromShortCode->session = $session;
		$getMessagesFromShortCode->shortcode = $shortCode;

		$getMessagesFromShortcodeResponse = new stdClass();
		$getMessagesFromShortcodeResponse->return = "";
		$getMessagesFromShortcodeResponse = $client->getMessagesFromShortcode($getMessagesFromShortCode);

		if (property_exists($getMessagesFromShortcodeResponse, 'return'))
			return $getMessagesFromShortcodeResponse->return;

		else return NULL;
	}

	//retrieve delivery report
	public function getDeliveryReports($session, $alias)
	{

		$client = $this->getClient();

		$getDeliveryReports = new stdClass();
		$getDeliveryReports->session = $session;
		$getDeliveryReports->alias = $alias;

		$getDeliveryReportsResponse = new stdClass();
		$getDeliveryReportsResponse->return = "";
		$getDeliveryReportsResponse = $client->getDeliveryReports($getDeliveryReports);

		if (property_exists($getDeliveryReportsResponse, 'return'))
			return $getDeliveryReportsResponse->return;

		else return NULL;
	}

	//retrieve messages from longnumber
	public function getMessagesFromLongNumber($session, $longNumber)
	{

		$client = $this->getClient();

		$getMessagesFromLongNumber = new stdClass();
		$getMessagesFromLongNumber->session = $session;
		$getMessagesFromLongNumber->longNumber = $longNumber;

		$getMessagesFromLongNumberResponse = new stdClass();
		$getMessagesFromLongNumberResponse->return = "";
		$getMessagesFromLongNumberResponse = $client->getMessagesFromLongNumber($getMessagesFromLongNumber);

		if (property_exists($getMessagesFromLongNumberResponse, 'return'))
			return $getMessagesFromLongNumberResponse->return;

		else return NULL;
	}
	public function Signal_msg_Send($mobile, $msgText)
	{
		$SMS = session()->get('SMS');
		if (!empty($SMS)) {
			if (!$this->isSession($SMS)) {
				$SMS = $this->renewSession($SMS);
				Session::put('SMS', $SMS);
			}
		} else {
			$SMS = $this->createSession("", env("SMS_USER"), env("SMS_PASSWORD"), "");
			Session::put('SMS', $SMS);
		}

		$msgsend = $this->sendMessages($SMS, env("SMS_ALIAS"), $msgText, array($mobile), 0);
		return $msgsend;
	}
	public function multilang_msg_Send($mobile, $msgText)
	{
		$SMS = session()->get('SMS');
		if (!empty($SMS)) {
			if (!$this->isSession($SMS)) {
				$SMS = $this->renewSession($SMS);
				Session::put('SMS', $SMS);
			}
		} else {
			$SMS = $this->createSession("", env("SMS_USER"), env("SMS_PASSWORD"), "");
			Session::put('SMS', $SMS);
		}

		$msgsend = $this->sendMessagesMultiLang($SMS, env("SMS_ALIAS"), $msgText, array($mobile), 0);
		return $msgsend;
	}
	public function msg_test()
	{


		$SMS = $this->createSession("", env("SMS_USER"), env("SMS_PASSWORD"), "");
		// dd($SMS);
		$msgsend = $this->sendMessages($SMS, env("SMS_ALIAS"), "test1", array('94715151050'), 0);
		dd($msgsend);
	}

	public function is_connected()
	{
		$connected = @fsockopen("www.google.com", 80);
		if ($connected) {
			$is_conn = true;
			fclose($connected);
		} else {
			$is_conn = false;
		}
		return $is_conn;
	}
}
