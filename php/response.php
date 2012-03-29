<?php
require_once('hermetic/crypto_util.php');

class Response {

	private $status;
	private $msg;
	private $data;
	private $macKey;
	private $sig;


	public function __construct($key=NULL){
		if (!is_null($key)){
			$this->macKey = substr($key,32,40);
		}else{
			$this->macKey = NULL;
		}
	}

	private function sign($data){
		if ( is_null($this->macKey) ){
			throw new Exception("INTERNAL_ERROR");
		}

		return hmac($this->macKey, $data);
	}

	public function setKey($key){
		$this->macKey = substr($key,32,40);
	}

	public function error($reason){
		$this->status = "ERROR";
		$this->msg = $reason;
	}

	public function data($data){
		$this->status = "OK";
		$this->data = $data;
		$this->sig = $this->sign($data);
	}

	public function message($msg){
		$this->status = "OK";
		$this->msg = $msg;
	}

	public function send(){
		$result = NULL;

		if ( is_null($this->status) ){
			$result->status = "ERROR";
			$result->reason = "INVALID_REQUEST";

			}elseif ($this->status == "ERROR") {
				$result->status = "ERROR";
				$result->reason = $this->msg;

			}elseif ( is_null($this->data) && is_null($this->msg) ){
				$result->status = "ERROR";
				$result->reason = "INTERNAL_ERROR";

			}else{
				$result->status = "OK";
				if ( !is_null($this->data) ){
					$result->data = json_encode($this->data);
					$result->sig = $this->sign($result->data);
				} else {
					$result->msg = $this->msg;
				}
			}

			echo json_encode($result);
		}
	}
