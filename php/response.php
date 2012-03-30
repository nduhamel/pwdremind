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
			$this->setKey($key);
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
		$this->data = json_encode($data);
		$this->sig = $this->sign($this->data);
	}

	public function message($msg){
		$this->status = "OK";
		$this->msg = $msg;
	}

	public function send(){
		$this->check_error();
		echo $this;
	}
	
	public function check_error(){
		
		if ( is_null($this->status) ){
			$this->error("INVALID_REQUEST");
		} 
		elseif ( is_null($this->data) && is_null($this->msg) ){
			$this->error("INTERNAL_ERROR");
		}
		
	}
	
	public function __toString(){
		
		$data = array(
			'status' => $this->status,
			'data' => $this->data,
			'msg' => $this->msg,
			'sig' => $this->sig
		);
		
		return json_encode($data);
	}
}
