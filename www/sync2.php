<?php
require_once('../php/database.php');
require_once('../php/srpsession.php');
require_once('../php/message.php');
require_once('../php/authentication.php');
require_once('../config.php');

//Input datas
$PATH = '/pwdremind/www/';
$URI = str_replace($PATH, '', $_SERVER['REQUEST_URI']);

$raw_input = @file_get_contents('php://input');
if ( !$raw_input )
    $raw_input = NULL;

if (isset($_POST['username']))
    $username = $_POST['username'];
else
    $username = NULL;

if (isset($_POST['A']))
    $A = $_POST['A'];
else
    $A = NULL;

if (isset($_POST['M1']))
    $M1 = $_POST['M1'];
else
    $M1 = NULL;
//----

class Sync
{
    private $_session;
    private $_message;
    private $_db;

    //Input datas
    private $_URI;
    private $_username, $_A, $_M1, $_raw_input;

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
        $this->_raw_input = $raw_input;
    }

    private function _is_logged() {
        if ( !$this->_session->is_logged() ) {
            header('HTTP/1.1 403 Forbidden');
            print 'Not logged';
            return false;
        } else {
            return true;
        }
    }

    public function run(){

        //Get all the datas from the URI
        //EX /passwords/category/1
        // 0 => passwords
        // 1 => category
        // 2 => 1
        $URI = explode('/', $this->_URI);

        switch ($URI[0]) {

            /*
                Authentication process 
                /authentication
            */    
            case 'authentication':
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
            case 'passwords':

                if( isset($URI[1]) && isset($URI[2]) ) {
                    //  /passwords/category/:id
                    $id = $URI[2];
                    $entries = $this->_db->get_entries($id, $this->_session->get_userid());
                    $this->_message->setData($entries);
                    $this->_message->send();
                } else {
                    //  /passwords
                    $entries = $this->_db->lastest_entries($this->_session->get_userid());
                    $this->_message->setData($entries);
                    $this->_message->send();
                }
                break;
             
            /*
                GET all categories
                /categories
            */
            case 'categories':
                $categories = $this->_db->get_categories( $this->_session->get_userid() );
                $this->_message->setData($categories);
                $this->_message->send();
                break;   

            // ADD a new password
            case 'password':
                print_r($this->_raw_input);
                $json_a = json_decode($this->_raw_input, true);
                $id = $this->_db->store_entry($json_a['data'], $json_a['category_id'], $this->_session->get_userid());
                $this->_message->setData(array(
                                'id' => $id,
                                'data' => $json_a['data'],
                                'category_id' => $json_a['category_id'],
                ));
                break;

            // ADD a new category
            case 'category':
                $json_a = json_decode($this->_raw_input, true);
                $id = $this->_db->add_category($json_a['data'], $this->_session->get_userid());
                $this->_message->setData(array(
                                'id' => $id,
                                'data' => $json_a['data'],
                ));
                $this->_message->send();
                break;


            // Logout
            case 'logout':
                $this->_session->logout();
                header('Location: index.html');
                break;

            // Redirect to main path
            default:
                header('Location: index.html');
                break;
        }


    }


}

$sync = new Sync($URI, $username, $A, $M1, $raw_input);
$sync->run();



