<?php
/*
    Message class
    Sign data with a key and send them   
*/

require_once('utils/crypto_util.php');

class Message 
{
    private $_data;
    private $_macKey;
    private $_sig;

    public function __construct($key = NULL)
    {
        if (!is_null($key)) {
            $this->setKey($key);
        } else {
            $this->_macKey = NULL;
        }
    }
    
    private function _sign($data)
    {
        if ( is_null($this->_macKey) ) {
            throw new Exception("EMPTY_MACKEY");
        }
        return hmac($this->_macKey, $data);
    }

    public function setKey($key)
    {
        $this->_macKey = substr($key,32,40);
    }

    public function _error($reason)
    {
        header('HTTP/1.1 500 Internal Server Error');
        print $reason;
    }

    public function setData($data)
    {
        $this->_data = json_encode($data);
        try { 
            $this->_sig = $this->_sign($this->_data); 
        } catch (Exception $e) {
            $this->_error( $e->getMessage() );
        }
    }

    public function send()
    {
        if ( is_null($this->_data) ) {
            $this->_error("NO_DATA");
        } else {
            echo $this;
        }
    }

    public function __toString()
    {
        $data = array(
            'data' => $this->_data,
            'sig' => $this->_sig
            );

        return json_encode($data);
    }
}
