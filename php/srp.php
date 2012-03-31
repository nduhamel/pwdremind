<?php

require_once('srpsession.php');
require_once('hermetic/crypto_util.php');

function publicKeyExchange ($username, $salt, $verifier, $A){
	try {
		$srpSession = new SrpSession();
		$b = secure_random($srpSession->getKeySize());
		$srpSession->initialize($username, $salt, $verifier, $A, $b);

		$result->status = "OK";
		$result->salt = $salt;
		$result->B = $srpSession->getB();

	} catch (Exception $e) {
		$result->status = "ERROR";
		$result->msg = "INVALID_REQUEST";
	}

	return $result;
}

function sharedKeyVerification ($username, $A, $M1){
	$srpSession = new SrpSession();
	if ($srpSession->getState() == SrpSession::READY){
		try {
			$M2 = $srpSession->verifyM1computeM2($M1);
			$result->status = 'OK';
			$result->M2 = $M2;
		} catch (Exception $e) {
			$result->status = "ERROR";
			$result->msg = "AUTHENTICATION_FAILED";
		}
	}else{
		$result->status = "ERROR";
		$result->msg = "INVALID_REQUEST";
	}

	return $result;
}
