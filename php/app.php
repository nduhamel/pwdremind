<?php
require_once('database.php');
require_once('srpsession.php');
require_once('message.php');
require_once('authentication.php');
require_once('router.php');
require_once('hermetic/crypto_util.php');
require_once('../config.php');

class App
{
    //Input datas
    private $_URI;                  //URI - /password/cat/id
    private $_method;               //GET POST DELETE
    private $_rawInput, $_sig;      //Raw input 
    private $_username, $_A, $_M1;  //Login infos

    private $_session;

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

        //Check if logged
        $authCheck = function() use ($session){
            if ( !$session->isLogged() ) {
                header('HTTP/1.1 403 Forbidden');
                print 'Not logged';
                exit();
            }
        };

        // Setting default route | 404 not found
        $router->setDefaultRoute('404.html');

        // GET homepage
        $router->addRoute('GET', '/', function() {
            header('Location: index.html');
        });

        // Run authentication
        $router->addRoute('POST', '/authentication', function() use ($auth) {
            $auth->run();
        });

        // GET all lastest passwords
        $router->addRoute('GET', '/passwords', $authCheck, function() use ($db, $message, $session) {
            $entries = $db->lastestEntries($session->getUserid());
            $message->setData($entries);
            $message->send();
        });        

        // GET passwords in a specific category
        $router->addRoute('GET', '/passwords/category/:id', $authCheck, function($id) use ($db, $message, $session) {
            $entries = $db->getEntries($id, $session->getUserid());
            $message->setData($entries);
            $message->send();
        }); 

        //GET all categories
        $router->addRoute('GET', '/categories', $authCheck, function() use ($db, $message, $session) {
            $categories = $db->getCategories( $session->getUserid() );
            $message->setData($categories);
            $message->send();
        });

        // ADD a new password
        $router->addRoute('POST', '/password', $authCheck, function() use ($db, $message, $session, $rawInput) {
            $id = $db->storeEntry($rawInput['data'], $rawInput['category_id'], $session->getUserid());
            $message->setData(array(
                            'id' => $id,
                            'data' => $rawInput['data'],
                            'category_id' => $rawInput['category_id'],
            ));
            $message->send();
        });
  
        // UPDATE a password
        $router->addRoute('PUT', '/password', $authCheck, function() use ($db, $message, $session, $rawInput) {
            $db->updateEntry($rawInput['id'], $rawInput['data'], $rawInput['category_id'], $session->getUserid());
            $message->setData(array(
                            'id' => $rawInput['id'],
                            'data' => $rawInput['data'],
                            'category_id' => $rawInput['category_id'],
            ));
            $message->send();
        });

        // DELETE a password
        $router->addRoute('DELETE', '/password', $authCheck, function() use ($db, $message, $session, $rawInput) {
            $db->deleteEntry($rawInput['id'], $session->getUserid());
            $message->setData(array(
                            'id' => $rawInput['id'],
            ));
            $message->send();
        });

        // ADD a new category
        $router->addRoute('POST', '/category', $authCheck, function() use ($db, $message, $session, $rawInput) {
            $id = $db->addCategory($rawInput['data'], $session->getUserid());
            $message->setData(array(
                            'id' => $id,
                            'data' => $rawInput['data'],
            ));
            $message->send();
        });

        // Logout
        $router->addRoute('GET', '/logout', $authCheck, function() use ($session) {
            $session->logout();
        });

        //Run the router
        $router->run($this->_method, $this->_URI);

    }
}