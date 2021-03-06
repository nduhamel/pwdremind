<?php

require_once(dirname(dirname(__FILE__)).'/config.php');
require_once(__ROOT__.'php/srpsession.php');

class Srp
{
    private $_srpSession;
    private $_B;
    private $_salt;
    private $_M2;
    private $_status;
    private $_msg;
    private $_json;

    const PULIC_KEY = 0;
    const SHARED_KEY = 1;
    const ERROR = 2;
    const SRP_ERROR = 3;

    public function __construct($status = NULL,$msg = NULL)
    {
        $this->_srpSession = new SrpSession();
        $this->_status = $status;
        $this->_msg = $msg;
        $this->_json = NULL;
    }

    public function getNhex() { return $this->_srpSession->getNhex(); }

    //If the user does not exist
    public function noKeyExchange()
    {
        $this->_status = 'ERROR';
        $this->_msg = 'NO USER FOUND';
        return $this->_toJson(Srp::ERROR);
    }

    public function publicKeyExchange($username, $userid, $salt, $verifier, $A)
    {
        try {
            $b = secure_random($this->_srpSession->getKeySize());
            $this->_srpSession->initialize($username, $userid, $salt, $verifier, $A, $b);
            $this->_B = $this->_srpSession->getB();
            $this->_status = 'OK';
            $this->_salt = $salt;
        } catch (Exception $e) {
            $this->_msg = $e->getMessage();
        }
        return $this->_toJson(Srp::PULIC_KEY);
    }

    public function sharedKeyVerification($M1)
    {
        if ($this->_srpSession->getState() == SrpSession::READY) {
            try {
                $this->_M2 = $this->_srpSession->verifyM1computeM2($M1);
                $this->_status = 'OK';
            } catch (Exception $e) {
                $this->_msg = $e->getMessage();
            }
        } else {
            $this->_msg = 'SRP_NOT_READY';
        }
        return $this->_toJson(Srp::SHARED_KEY);
    }

    private function _toJson($case)
    {
        $result = array(
            'status' => $this->_status,
            'msg' => $this->_msg
            );

        switch ($case) {
            case Srp::PULIC_KEY:
                $result['salt'] = $this->_salt;
                $result['B'] = $this->_B;
                break;

            case Srp::SHARED_KEY:
                $result['M2'] = $this->_M2;
                break;

            case Srp::ERROR;
                break;
            
            default:
                $result['status'] = 'ERROR';
                $result['msg'] = 'SRP ERROR';
                break;
        }

        $this->_json = json_encode($result);
    }

    public function __toString()
    {
        if (is_null($this->_json)) {
            if (isset($this->_status))
                $this->_toJson(Srp::ERROR);
            else
                $this->_toJson(Srp::SRP_ERROR);
        }
        return $this->_json;
    }
}

