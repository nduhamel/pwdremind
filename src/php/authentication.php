<?php

require_once(dirname(dirname(__FILE__)).'/config.php');
require_once(__ROOT__.'php/utils/crypto_util.php');
require_once(__ROOT__.'php/srp.php');
require_once(__ROOT__.'php/database.php');

class Authentication
{
    private $_username;
    private $_A;
    private $_M1;
    private $_db;
    private $_srp;

    public function __construct(Database $db,$username,$A,$M1)
    {
        $this->_username = $username;
        $this->_A = $A;
        $this->_M1 = $M1;
        $this->_db = $db;
        $this->_srp = new Srp();
    }

    //Check if request is valid
    private function _isValidRequest()
    {
        $isValid = false;

        if ( isset($this->_username) && isset($this->_A) ) {
            if ( strlen($this->_A)==strlen($this->_srp->getNhex()) && isHex($this->_A)) {
                $isValid = true;
                if ( isset($this->_M1)) {
                    if (strlen($this->_M1) == 40 && isHex($this->_M1)) { // 40hex digits = 160bits
                        $isValid = true;
                    } else {
                        $isValid = false;
                    }
                }
            }
        }
        return $isValid;
    }

    public function run()
    {
        if ( $this->_isValidRequest() ) {

            //Public key exchange
            if (empty($this->_M1)) {

                //If the user exists in database
                if ($this->_db->checkUsername($this->_username)) {
                    $user_data = $this->_db->getVerifier($this->_username);
                    $this->_srp->publicKeyExchange($this->_username,$user_data->id,$user_data->salt,$user_data->verifier,$this->_A );
                } else {
                    $this->_srp->noKeyExchange();
                }

            } else {
                //Shared key verification
                $this->_srp->sharedKeyVerification($this->_M1);
            }

        } else {
            $this->_srp = new Srp('ERROR','INVALID_REQUEST');
        }
        echo $this->_srp;
    }
}
