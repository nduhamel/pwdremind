<?php
require_once('session.php');
require_once('hermetic/crypto_util.php');
require_once('hermetic/srp_256.php');


class SrpSession extends Session {
	private $srp;
	public  $I;
	private $shex;
	public  $vhex;
	private $vdec;
	public  $Ahex;
	private $Adec;
	private $bhex;
	private $bdec;
	private $Bhex;
	private $Bdec;
	private $uhex;
	private $udec;
	private $Sdec;
	public  $Shex;
	public  $Khex;
	public  $M1;
	
	const NOT_INITIALIZED = 0;
	const INITIALIZED = 1;
	const READY = 2; // Loaded from session ready for verifyM1computeM2
	
	function __construct() {
		parent::__construct();
		$this->srp = new SRP_SHA1_256();
		if ( $this->getState() == (SrpSession::INITIALIZED or SrpSession::READY) ){
			try {
				$this->shex = $this->getValue('SRP_shex');
				$this->Ahex = $this->getValue('SRP_Ahex');
				$this->Bhex = $this->getValue('SRP_Bhex');
				$this->Khex = $this->getValue('SRP_Khex');
				$this->I = $this->getValue('SRP_I');
				$this->setState(SrpSession::READY);
			} catch (InvalidArgumentException $e){
				$this->setState(SrpSession::NOT_INITIALIZED);
			}
		}
	}

	private function setState($state){$this->setValue('SRP_state',$state);}
	function getState() {return $this->getValue('SRP_state');}
	function getB(){return $this->Bhex;	}

	private function computeB() {
		$term1 = bcmul($this->srp->kdec(), $this->vdec);
		$term2 = bcpowmod($this->srp->gdec(), $this->bdec, $this->srp->Ndec());
		$this->Bdec = bcmod(bcadd($term1, $term2), $this->srp->Ndec());
		$this->Bhex = dec2hex($this->Bdec);
	}

	private function computeK() {
		$hash_input = str_pad($this->Ahex, strlen($this->srp->Nhex()), "0", STR_PAD_LEFT).str_pad($this->Bhex, strlen($this->srp->Nhex()), "0", STR_PAD_LEFT);
		$hash_input = pack("H*",$hash_input);
		$this->uhex = $this->srp->hash($hash_input);
		$this->udec = hex2dec($this->uhex);

		$Stmp = bcpowmod($this->vdec, $this->udec, $this->srp->Ndec()); // v^u (mod N)
		$Stmp = bcmod(bcmul($Stmp,$this->Adec), $this->srp->Ndec()); //v^u*A (mod N)
		$Stmp = bcpowmod($Stmp, $this->bdec, $this->srp->Ndec()); // (v^u*A)^b (mod N)

		$this->Sdec = $Stmp;
		$this->Shex = dec2hex($this->Sdec);

		$this->Shex = str_pad($this->Shex, strlen($this->srp->Nhex()), "0", STR_PAD_LEFT);

		$this->Khex = $this->srp->keyHash(pack("H*",$this->Shex));
	}

	function initialize($I, $s, $v, $A, $b) {

		$this->Adec = hex2dec($A);
		if ( strcmp(bcmod($this->Adec,$this->srp->Ndec()), '0') == 0 ) {
			throw new Exception('Protocol exception');
		}

		$this->Ahex = $A;
		$this->I = $I;
		$this->shex = $s;
		$this->vhex = $v;
		$this->vdec = hex2dec($v);
		$this->bhex = $b;
		$this->bdec = hex2dec($b);

		$this->computeB();
		$this->computeK();

		$this->setValue('SRP_shex',$this->shex);
		$this->setValue('SRP_Ahex',$this->Ahex);
		$this->setValue('SRP_Bhex',$this->Bhex);
		$this->setValue('SRP_Khex',$this->Khex);
		$this->setValue('SRP_I',$this->I);
		$this->setState(SrpSession::INITIALIZED);
	}

	function verifyM1computeM2($clientM1) {
		//M1 = H( H(N) xor H(g) , H (I) , s, A, B, K)

		$hi = byte2hex($this->srp->NgXorHash());
		$hi .= $this->srp->hash($this->I);
		$hi .= $this->shex;

		$hi .= str_pad($this->Ahex, strlen($this->srp->Nhex()), "0", STR_PAD_LEFT);
		$hi .= str_pad($this->Bhex, strlen($this->srp->Nhex()), "0", STR_PAD_LEFT);

		$hi .= $this->Khex;
		if (strlen($hi) % 2 == 1) {
			$hi= $hi.'0';
		}

		$hi = pack("H*",$hi);
		$hash_input = $this->srp->NgXorHash();
		$hash_input .= pack("H*", $this->srp->hash($this->I));
		$hash_input .= pack("H*", $this->shex);
		$hash_input .= pack("H*", $this->Ahex);
		$hash_input .= pack("H*", $this->Bhex);
		$hash_input .= pack("H*", $this->Khex);
		$M1 = $this->srp->hash($hi);
		$this->M1 = $M1;
		if (strcmp($M1,$clientM1) != 0) {
			throw new Exception('Authentication failed');
		}

		// Login the user
		$this->login($this->I);

		//M2 = H(A, M, K)

		$M2 = $this->srp->hash(pack("H*", $this->Ahex).pack("H*", $M1).pack("H*", $this->Khex));
		return $M2;
	}
	
	public function getKeySize(){
		return $this->srp->privateKeyBitSize();
	}

}
