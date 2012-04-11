<?php

require_once('hermetic/crypto_util.php');

class Response {

    private $_status;
    private $_msg;
    private $_data;
    private $_macKey;
    private $_sig;

    public function __construct($key=NULL){
        if (!is_null($key)){
            $this->setKey($key);
        }else{
            $this->_macKey = NULL;
        }
    }
    
    private function sign($data){
        if ( is_null($this->_macKey) ){
            throw new Exception("EMPTY_MACKEY");
        }
        return hmac($this->_macKey, $data);
    }

    public function setKey($key){
        $this->_macKey = substr($key,32,40);
    }

    public function error($reason){
        $this->_status = "ERROR";
        $this->_msg = $reason;
    }

    public function data($data){
        $this->_status = "OK";
        $this->_data = json_encode($data);
        try { 
            $this->_sig = $this->sign($this->_data); 
        }
        catch (Exception $e){
            echo 'ERROR : ', $e->getMessage();
        }
    }

    public function message($msg){
        $this->_status = "OK";
        $this->_msg = $msg;
    }

    public function send(){
        $this->check_error();
        echo $this;
    }

    public function check_error(){

        if ( is_null($this->_status) ){
            $this->error("INVALID_REQUEST");
        } 
        elseif ( is_null($this->_data) && is_null($this->_msg) ){
            $this->error("INTERNAL_ERROR");
        }

    }

    public function __toString(){

        $data = array(
            'status' => $this->_status,
            'data' => $this->_data,
            'msg' => $this->_msg,
            'sig' => $this->_sig
            );

        return json_encode($data);
    }
}
