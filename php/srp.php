<?php
require_once('srpsession.php');
require_once('hermetic/crypto_util.php');

function publicKeyExchange ($username, $salt, $verifier, $A){
	global $srpOptions;
	try {
		$srpSession = new SrpSession($srpOptions);
		$b = secure_random($srpOptions->privateKeyBitSize());
		$srpSession->initialize($username, $salt, $verifier, $A, $b);

		$result->status = "OK";
		$result->salt = $salt;
		$result->B = $srpSession->getB();

	} catch (SrpException $e) {
		$result->status = "ERROR";
		$result->reason = "INVALID_REQUEST";
	}

	return $result;
}

function sharedKeyVerification ($username, $A, $M1){
	global $srpOptions;
	$srpSession = new SrpSession($srpOptions);
	if ($srpSession->state() == 2){
		try {
			$M2 = $srpSession->verifyM1computeM2($M1);
			$result->status = 'OK';
			$result->M2 = $M2;
		} catch (SrpException $e) {
			$result->status = "ERROR";
			$result->reason = "AUTHENTICATION_FAILED";
		}
	}else{
		$result->status = "ERROR";
		$result->reason = "INVALID_REQUEST";
	}

	return $result;
}
