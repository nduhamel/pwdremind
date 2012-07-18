<?php
require_once('database.php');
require_once('srpsession.php');
require_once('message.php');
require_once('authentication.php');
require_once('../config.php');


class Sync
{
    private $_session;
    private $_message;
    private $_db;

    //Input datas
    private $_URI;
    private $_username, $_A, $_M1, $_rawInput;

    function __construct($URI, $username, $A, $M1, $raw_input)
    {
        $this->_session = new SrpSession();
        $this->_message = new Message($this->_session->getKhex());
        $this->_db = new Database();

        //Input datas
        $this->_URI = $URI;
        $this->_username = $username;
        $this->_A = $A;
        $this->_M1 = $M1;
        $this->_rawInput = $raw_input;
    }

    private function _checkAuth() {
        if ( !$this->_session->isLogged() ) {
            header('HTTP/1.1 403 Forbidden');
            print 'Not logged';
            exit();
        }
    }

    public function run(){

        //Get all the datas from the URI
        //EX /passwords/category/1
        // 0 => passwords
        // 1 => category
        // 2 => 1
        $URI = explode('/', $this->_URI);
        $URI[0] = '/'.$URI[0];
        
        switch ($URI[0]) {

            /*
                Authentication process 
                /authentication
            */    
            case '/authentication':
                $auth = new Authentication($this->_db,$this->_username,$this->_A,$this->_M1);
                $auth->run();
                break;

            /*
                GET all latest passwords
                /passwords
                
                OR 

                GET all passwords in a specific category
                /passwords/category/:id
            */
            case '/passwords':
                $this->_checkAuth();
                if( isset($URI[1]) && isset($URI[2]) ) {
                    //  /passwords/category/:id
                    $id = $URI[2];
                    $entries = $this->_db->getEntries($id, $this->_session->getUserid());
                    $this->_message->setData($entries);
                    $this->_message->send();
                } else {
                    //  /passwords
                    $entries = $this->_db->lastestEntries($this->_session->getUserid());
                    $this->_message->setData($entries);
                    $this->_message->send();
                }
                break;
             
            /*
                GET all categories
                /categories
            */
            case '/categories':
                $this->_checkAuth();
                $categories = $this->_db->getCategories( $this->_session->getUserid() );
                $this->_message->setData($categories);
                $this->_message->send();
                break;   

            // ADD a new password
            case '/password':
                $this->_checkAuth();
                $json_a = json_decode($this->_rawInput, true);
                $id = $this->_db->storeEntry($json_a['data'], $json_a['category_id'], $this->_session->getUserid());
                $this->_message->setData(array(
                                'id' => $id,
                                'data' => $json_a['data'],
                                'category_id' => $json_a['category_id'],
                ));
                break;

            // ADD a new category
            case '/category':
                $this->_checkAuth();
                $json_a = json_decode($this->_rawInput, true);
                $id = $this->_db->addCategory($json_a['data'], $this->_session->getUserid());
                $this->_message->setData(array(
                                'id' => $id,
                                'data' => $json_a['data'],
                ));
                $this->_message->send();
                break;


            // Logout
            case '/logout':
                $this->_session->logout();
                break;

            // Redirect to main path
            default:
                //Nothing to do
                break;
        }

    }

}


