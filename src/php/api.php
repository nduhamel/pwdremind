<?php

require_once(dirname(dirname(__FILE__)).'/config.php');
require_once(__ROOT__.'php/database.php');
require_once(__ROOT__.'php/srpsession.php');
require_once(__ROOT__.'php/message.php');
require_once(__ROOT__.'php/authentication.php');
require_once(__ROOT__.'php/router.php');
require_once(__ROOT__.'php/utils/crypto_util.php');


class PwdremindAPI
{
    //Input datas
    private $_URI;                  //URI - /password/cat/id
    private $_method;               //GET POST DELETE
    private $_rawInput, $_sig;      //Raw input
    private $_username, $_A, $_M1;  //Login infos

    private $_session;

    // Types
    const PASSWORD = '1';
    const NOTE = '2';

    function __construct($inputs)
    {
        //HTTP inputs
        $this->_URI =       $this->_checkKey('URI', $inputs);
        $this->_rawInput =  $this->_checkKey('raw_input', $inputs);
        $this->_method =    $this->_checkKey('method', $inputs);

        //Auth inputs
        $this->_username =  $this->_checkKey('username', $inputs);
        $this->_A =         $this->_checkKey('A', $inputs);
        $this->_M1 =        $this->_checkKey('M1', $inputs);

        $this->_session = new SrpSession();

        $rawInputs = json_decode($this->_rawInput, true);
        if ( is_array($rawInputs) && array_key_exists('sig', $rawInputs) ) {
            $this->_rawInput = $this->_checkKey('data', $rawInputs);

            //Checking the signatures
            $calculatedSig = $this->_sign($this->_rawInput, $this->_session->getKhex());
            $this->_sig = $this->_checkKey('sig', $rawInputs);
            if ($calculatedSig == $this->_sig) {
                $this->_rawInput = json_decode($this->_rawInput, true);
            } else {
                header('HTTP/1.1 400 Bad Request');
                print 'Checksum error!';
                exit();
            }
        } else {
            $this->_sig = NULL;
        }
    }

    //Return NULL if the key does not exist
    private function _checkKey($key, $array){
        return array_key_exists($key, $array) ? $array[$key] : NULL;
    }

    private function _sign($data, $key) {
        $key = substr($key,32,40);
        return hmac($key, $data);
    }

    public function run() {

        //Objects
        $session = $this->_session;
        $message = new Message($session->getKhex());
        $db = new Database();
        $auth = new Authentication($db, $this->_username, $this->_A, $this->_M1);


        //Http cleaned infos
        $URI = $this->_URI;

        // Inputs
        $rawInput = $this->_rawInput;
        $sig = $this->_sig;
        $method = $this->_method;

        //Start the router
        $router = new Router();

        // Check if logged function
        $authCheck = function() use ($session){
            if ( !$session->isLogged() ) {
                header('HTTP/1.1 403 Forbidden');
                print 'Not logged';
                exit();
            }
        };

        // Autoload routes
        if ($dir = opendir(__ROOT__.'php/routes')) {
            while (false !== ($route = readdir($dir))) {
                if ($route != "." && $route != "..") {
                    include_once(__ROOT__.'php/routes/'.$route);
                }
            }
            closedir($dir);
        }

        //Run the router
        $router->run($this->_method, $this->_URI);
    }
}
