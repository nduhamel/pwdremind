<?php
require_once('../php/hermetic/crypto_util.php');
require_once('../php/srp.php');
require_once('../php/database.php');
require_once('../config.php');

//Todo
if (isset($_POST['username']))
    $username = $_POST['username'];
else
    $username = NULL;

if (isset($_POST['A']))
    $A = $_POST['A'];
else
    $A = NULL;

if (isset($_POST['M1']))
    $M1 = $_POST['M1'];
else
    $M1 = NULL;
//----

$auth = new Authentication(new Database(),$username,$A,$M1);
$auth->run();

class Authentication {

    private $_username;
    private $_A;
    private $_M1;
    private $_db;
    private $_srp;
    private $_srpOptions;

    public function __construct(Database $db,$username,$A,$M1){
        $this->_username = $username;
        $this->_A = $A;
        $this->_M1 = $M1;
        $this->_db = $db;
        $this->_srp = new Srp();
        $this->_srpOptions = new SRP_SHA1_256();
    }

    private function _is_validRequest(){
        $isValid = false;

        if ( isset($this->_username) && isset($this->_A) ) {
            if ( strlen($this->_A)==strlen($this->_srpOptions->Nhex()) && isHex($this->_A)) {
                $isValid = true;
                if ( isset($this->_M1)) {
                    if (strlen($this->_M1) == 40 && isHex($this->_M1)) { // 40hex digits = 160bits
                        $isValid = true;
                    }else{
                        $isValid = false;
                    }
                }
            }
        }
        return $isValid;
    }

    public function run() {

        if ( $this->_is_validRequest() ) {
            if (empty($this->_M1)) {
                $user_data = $this->_db->get_verifier($this->_username);
                if (!is_null($user_data) && !is_null($user_data->verifier)) {
                    $this->_srp->publicKeyExchange($this->_username,$user_data->salt, $user_data->verifier, $this->_A );
                }
                else {
                    $this->_srp = new Srp('ERROR','USER_DOES_NOT_EXIST');
                }
            }
            else {
                $this->_srp->sharedKeyVerification($this->_M1);
            }
        }
        else {
            $this->_srp = new Srp('ERROR','INVALID_REQUEST');
        }
        echo $this->_srp;
    }
}
