<?php

require_once('../php/database.php');
require_once('../php/srpsession.php');
require_once('../php/response.php');
require_once('../config.php');

//Todo
if (isset($_GET['action']))
    $action = $_GET['action'];
else
    $action = NULL;

if (isset($_GET['id']))
    $id = $_GET['id'];
else
    $id = NULL;
    
if (isset($_GET['data']))
    $data = stripslashes($_GET['data']);
else
    $data = NULL;
//----

$sync = new Sync($action,$id,$data);
$sync->run();

class Sync 
{
    private $_db;
    private $_session;
    private $_response;
    private $_action;
    private $_id;
    private $_data;
    private $_isloggedin;

    public function __construct($action,$id,$data)
    {
        $this->_action = $action;
        $this->_id = $id;
        $this->_data = $data;
        $this->_db = new Database();
        $this->_session = new SrpSession();
        $this->_response = new Response();
        $this->_isloggedin = $this->_session->is_logged_in();
    }

    private function _checkErrors()
    {
        $error = false;

        if(isset($this->_action)) {
            if ($this->_isloggedin) {
                if (($this->_action == 'remove') || ($this->_action == 'update')) {
                    if ( empty($this->_id) ){
                        $this->_response->error("ITEM_ID_NOT_DEFINED");
                        $error = true;
                    } elseif (!$this->_db->check_entry($this->_id, $this->_session->get_userid())) {
                        $this->_response->error("ID_NOT_FOUND");
                        $error = true;
                    }
                }
                
                if (($this->_action == 'add') || ($this->_action == 'update') || ($this->_action == 'updatecat')) {
                    if ( empty($this->_data) ){
                        $this->_response->error("NO_DATA");
                        $error = true;
                    }
                }
            } else {
                if ($this->_action == 'isloggedin') {
                    $this->_response->message("NOT_AUTHENTICATED");
                    $error = true;
                } else {
                    $this->_response->error("NOT_AUTHENTICATED");
                    $error = true;
                }
            }
        } else {
            $this->_response->error("ACTION_NOT_DEFINED");
            $error = true;
        }
        return $error;
    }

    public function run()
    {
        if (!$this->_checkErrors()) {
            $this->_response->setKey($this->_session->getKhex());
            switch( $this->_action ) {

            case 'isloggedin':
                $this->_response->message("AUTHENTICATED");
                break;

            case 'logout':
                $this->_session->logout();
                $this->_response->message("LOGOUT");
                break;

            case 'ping':
                $this->_response->message("OK");
                break;

            case 'getinfo':
                $info = $this->_db->get_info($this->_session->get_userid());
                $this->_response->data($info);
                break;

            case 'updatecat':
                $rep = $this->_db->update_categories($this->_data, $this->_session->get_userid());
                $this->_response->data($rep);
                break;

            case 'add':
                $id = $this->_db->store_entry($this->_data, $this->_session->get_userid());
                $this->_response->data($id);
                break;

            case 'update':
                $id = $this->_db->update_entry($this->_id, $this->_data, $this->_session->get_userid());
                $this->_response->data($id);
                break;

            case 'remove':
                $this->_id = $this->_db->delete_entry($this->_id, $this->_session->get_userid());
                $this->_response->data($this->_id);
                break;

            case 'get':
                $entries = $this->_db->get_entries($this->_session->get_userid());
                $this->_response->data($entries);
                break;

            }
        }
        session_write_close();
        $this->_response->send();
    }
}
