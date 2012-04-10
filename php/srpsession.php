<?php
require_once('session.php');
require_once('hermetic/crypto_util.php');
require_once('hermetic/srp_256.php');


class SrpSession extends Session {

    private $_Ahex, $_Bhex, $_bhex ,$_Khex, $_Shex, $_shex, $_uhex, $_vhex;
    private $_Adec, $_Bdec, $_bdec, $_Sdec, $_udec, $_vdec;
    private $_username, $_userid;
    private $_M1;
    private $_srp;

    const NOT_INITIALIZED = 0;
    const INITIALIZED = 1;
    const READY = 2; // Loaded from session ready for verifyM1computeM2

    function __construct() {
        parent::__construct();
        $this->_srp = new SRP_SHA1_256();
        if ( $this->getState() == (SrpSession::INITIALIZED or SrpSession::READY) ){
            try {
                $this->_shex = $this->getValue('SRP_shex');
                $this->_Ahex = $this->getValue('SRP_Ahex');
                $this->_Bhex = $this->getValue('SRP_Bhex');
                $this->_Khex = $this->getValue('SRP_Khex');
                $this->_username = $this->getValue('SRP_I');
                $this->_userid =  $this->getValue('userid');
                $this->setState(SrpSession::READY);
            } catch (InvalidArgumentException $e){
                $this->setState(SrpSession::NOT_INITIALIZED);
            }
        }
    }

    private function setState($state) { $this->setValue('SRP_state',$state); }
    function getState() { return $this->getValue('SRP_state'); }
    function getB() { return $this->_Bhex; }

    private function computeB() {
        $term1 = bcmul($this->_srp->kdec(), $this->_vdec);
        $term2 = bcpowmod($this->_srp->gdec(), $this->_bdec, $this->_srp->Ndec());
        $this->_Bdec = bcmod(bcadd($term1, $term2), $this->_srp->Ndec());
        $this->_Bhex = dec2hex($this->_Bdec);
    }

    private function computeK() {
        $hash_input = str_pad($this->_Ahex, strlen($this->_srp->Nhex()), "0", STR_PAD_LEFT).str_pad($this->_Bhex, strlen($this->_srp->Nhex()), "0", STR_PAD_LEFT);
        $hash_input = pack("H*",$hash_input);
        $this->_uhex = $this->_srp->hash($hash_input);
        $this->_udec = hex2dec($this->_uhex);

        $Stmp = bcpowmod($this->_vdec, $this->_udec, $this->_srp->Ndec()); // v^u (mod N)
        $Stmp = bcmod(bcmul($Stmp,$this->_Adec), $this->_srp->Ndec()); //v^u*A (mod N)
        $Stmp = bcpowmod($Stmp, $this->_bdec, $this->_srp->Ndec()); // (v^u*A)^b (mod N)

        $this->_Sdec = $Stmp;
        $thisthis->_Shex = dec2hex($this->_Sdec);

        $thisthis->_Shex = str_pad($thisthis->_Shex, strlen($this->_srp->Nhex()), "0", STR_PAD_LEFT);

        $this->_Khex = $this->_srp->keyHash(pack("H*",$thisthis->_Shex));
    }

    function initialize($username, $userid, $s, $v, $A, $b) {

        $this->_Adec = hex2dec($A);
        if ( strcmp(bcmod($this->_Adec,$this->_srp->Ndec()), '0') == 0 )
            throw new Exception('PROTOCOL_EXCEPTION');

        $this->_Ahex = $A;
        $this->_username = $username;
        $this->_userid = $userid;
        $this->_shex = $s;
        $this->_vhex = $v;
        $this->_vdec = hex2dec($v);
        $this->_bhex = $b;
        $this->_bdec = hex2dec($b);

        $this->computeB();
        $this->computeK();

        $this->setValue('SRP_shex',$this->_shex);
        $this->setValue('SRP_Ahex',$this->_Ahex);
        $this->setValue('SRP_Bhex',$this->_Bhex);
        $this->setValue('SRP_Khex',$this->_Khex);
        $this->setValue('SRP_I',$this->_username);
        $this->setValue('userid', $this->_userid);
        $this->setState(SrpSession::INITIALIZED);
    }

    function verifyM1computeM2($clientM1) {
        //M1 = H( H(N) xor H(g) , H (I) , s, A, B, K)

        $hi = byte2hex($this->_srp->NgXorHash());
        $hi .= $this->_srp->hash($this->_username);
        $hi .= $this->_shex;

        $hi .= str_pad($this->_Ahex, strlen($this->_srp->Nhex()), "0", STR_PAD_LEFT);
        $hi .= str_pad($this->_Bhex, strlen($this->_srp->Nhex()), "0", STR_PAD_LEFT);

        $hi .= $this->_Khex;

        if (strlen($hi) % 2 == 1)
            $hi= $hi.'0';

        $hi = pack("H*",$hi);
        $hash_input = $this->_srp->NgXorHash();
        $hash_input .= pack("H*", $this->_srp->hash($this->_username));
        $hash_input .= pack("H*", $this->_shex);
        $hash_input .= pack("H*", $this->_Ahex);
        $hash_input .= pack("H*", $this->_Bhex);
        $hash_input .= pack("H*", $this->_Khex);
        $M1 = $this->_srp->hash($hi);
        $this->_M1 = $M1;
        if (strcmp($M1,$clientM1) != 0)
            throw new Exception('AUTHENTICATION_FAILED');

        // Login the user
        $this->login($this->_username,$this->_userid);

        //M2 = H(A, M, K)
        $M2 = $this->_srp->hash(pack("H*", $this->_Ahex).pack("H*", $M1).pack("H*", $this->_Khex));
        return $M2;
    }

    public function getKeySize() { return $this->_srp->privateKeyBitSize(); }
    public function getKhex() { return $this->_Khex; }

}
