<?php
require_once('../php/hermetic/crypto_util.php');
require_once('../php/srp.php');
require_once('../php/database.php');

ini_set("log_errors" , "1");
ini_set("error_log" , "Errors.log.txt");
ini_set("display_errors" , "0");

$db = new Database('../test.db');

$result = NULL;

$username = '';
$A = '';
$M1 = '';
$validRequest = false;

if ( isset($_POST['username']) && isset($_POST['A']) ) {
    $username = $_POST['username'];
    $A = $_POST['A'];
    if ( strlen($A)==strlen($srpOptions->Nhex()) && isHex($A)) {
        $validRequest = true;
        if ( isset($_POST['M1'])) {
            $M1 = $_POST['M1'];
            if (strlen($M1)==40 && isHex($M1)) { // 40hex digits = 160bits
                $validRequest = true;
            }else{
                $validRequest = false;
            }
        }

    }
}

if ( $validRequest ) {
    if (empty($M1)) { // public key exchange
        $user_data = $db->get_verifier($username);
        if ($user_data!=NULL && $user_data->verifier!=NULL) {
            $result = publicKeyExchange($username,$user_data->salt, $user_data->verifier, $A );
        } else {
            $result->status = "ERROR";
            $result->reason = "USER_DOES_NOT_EXIST";
        }
    } else { // shared key verification
        $result = sharedKeyVerification($username, $A, $M1);
    }
} else {
    $result->status = "ERROR";
    $result->reason = "INVALID_REQUEST";
}
echo json_encode($result);
