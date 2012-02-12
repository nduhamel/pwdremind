<?php

$app = new PwdRemind();
$app->route();


class PwdRemind{

    private $db;
    private $session;

    public function __construct(){
        $this->db = new Database('test.db');
        $this->session = new Session();
    }

    public function route(){
        if (isset($_GET['action'])){
            $action = $_GET['action'];
            switch( $action ) {
                case 'isloggedin':
                    echo $this->session->is_logged_in();
                    exit;
                case 'logout':
                    $this->session->logout();
                    echo 1;
                    exit;
            }
        }

        if (isset($_POST['username']) && isset($_POST['password'])){
            $this->try_login();
        }

        if (isset($_POST['index'])){
            if($this->session->is_logged_in()){
                echo sync($this->db, $this->session->get_username() );
            }else{
                error_die('Not logged');
            }
        }
    }

    public function try_login(){
        $username = $_POST['username'];
        $password = $_POST['password'];
        unset($_POST['username']);
        unset($_POST['password']);
        $local_hash = $this->db->get_user_pwd_hash($username);
        if($local_hash == hash('sha256', $password)){
	    $key = hash('md5', $password);
            $this->session->login($username,$key);
            echo json_encode(array('username' => $username));
            exit;
        }else{
            error_die('Invalid login params');
        }
    }

}

function error_die($message){
    echo json_encode(array('error' => $message));
    exit;
}

function sync($db, $username){
    // Parse incoming data
    $remote_index = (array)json_decode(stripslashes($_POST['index']), true);
    unset($_POST['index']);
    $remote_entries = $_POST;

    // Get local index
    $local_index = $db->get_local_index($username);
    $diff_index = array_diff_key($local_index, $remote_index);

    foreach ($remote_index as $id => $item) {
        if (array_key_exists($id, $local_index)) {
            if ($item == 0) {
                // Remote entry has been deleted, remove the local too
                $local_index[$id] = $item;
                $db->delete_entry($id,$username);
                unset($remote_index[$id]);
                unset($remote_entries[$id]);
            } elseif ($local_index[$id] == 0) {
                // Local entry has been deleted, remove local entry too
                $remote_index[$id] = $local_index[$id];
                $db->delete_entry($id, $username);
                unset($remote_index[$id]);
                unset($remote_entries[$id]);
            } elseif ($item['timestamp'] == $local_index[$id]['timestamp']) {
                // Local entry is already the latest, don't send it back
                unset($remote_entries[$id]);
            }
        } else {
            $local_index[$id] = $remote_index[$id];
            $db->store_entry($id, stripslashes($_POST[$id]),$username);
            unset($remote_entries[$id]);
        }
    }

    foreach ($diff_index as $id => $data) {
        if ($local_index[$id] !== 0) {
            $remote_entries[$id] = $db->get_entry($id,$username);
            $remote_index[$id] = $local_index[$id];
        } else {
            unset($remote_entries[$id]);
            unset($remote_index[$id]);
        }
    }

    $return = array('index' => $remote_index, 'entries' => $remote_entries);
    return json_encode($return);
}

class Session {

    public function __construct() {
        session_start();
    }

    public function login($userid,$key){
        session_regenerate_id ();
        $_SESSION['valid'] = True;
        $_SESSION['username'] = $userid;
	$_SESSION['key'] = $key;
    }

    public function is_logged_in(){
        if(isset($_SESSION['valid']) && $_SESSION['valid'])
            return true;
        return false;
    }

    public function logout(){
        $_SESSION = array(); //destroy all of the session variables
        session_destroy();
    }

    public function get_username(){
        return $_SESSION['username'];
    }
}


class Database {
    private $db;

    public function __construct($dbname) {
        $this->db = sqlite_open($dbname, 0666, $error);
        if (!$this->db) die ($error);
        $this->check_table();
    }

    public function __destruct() {
        sqlite_close($this->db);
    }

    public function sqlite_quote_string($str) {
        if (get_magic_quotes_gpc()) {
            $str = stripslashes($str);
        }
        return sqlite_escape_string($str);
    }

    public function db_query($stm){
        $result = sqlite_query($this->db, $stm, $error);
        if (!$result) die("Cannot execute query. $error");
        return $result;
    }

    public function get_user_pwd_hash($username){
        $username = $this->sqlite_quote_string($username);
        $result = $this->db_query("SELECT password FROM users WHERE username = '$username'");
        if(sqlite_num_rows($result)>0){
              return sqlite_fetch_single($result);
        }
        return False;
    }

    public function get_local_index($username){
        $username = $this->sqlite_quote_string($username);
        $result = $this->db_query("SELECT id FROM password WHERE username='$username'");
        $local_index = array();
        if(sqlite_num_rows($result)>0){
            while(sqlite_has_more($result)){
              $row=sqlite_fetch_single($result);
              $local_index[$row] = $row;
            }
        }
        return $local_index;
    }

    public function get_entry($id, $username) {
        $id = $this->sqlite_quote_string($id);
        $username = $this->sqlite_quote_string($username);
        $result = $this->db_query("SELECT data FROM password WHERE id='$id' AND username='$username'");
        if (sqlite_num_rows($result)>0) {
            $entry =  json_decode(sqlite_fetch_single($result), true);
            if($entry){ return $entry; }
        }
        return array();
    }

    public function store_entry($id, $data, $username) {
        $id = $this->sqlite_quote_string($id);
        $data = $this->sqlite_quote_string($data);
        $username = $this->sqlite_quote_string($username);
        $result = $this->db_query("INSERT INTO password VALUES( '$id' , '$data', '$username')");
    }

    public function delete_entry($id, $username) {
        $id = $this->sqlite_quote_string($id);
        $username = $this->sqlite_quote_string($username);
        $result = $this->db_query("DELETE FROM password WHERE id='$id' AND username='$username'");
    }

    private function check_table(){
        $stm = "SELECT * FROM password";
        $q = sqlite_exec($this->db, $stm, $error);
        if (!$q) {
            $stm = "CREATE TABLE password (id TEXT, data TEXT, username TEXT)";
            $ok = sqlite_exec($this->db, $stm, $error);
            if (!$ok)
                die("Cannot execute query. $error");
        }
        $stm = "SELECT * FROM users";
        $q = sqlite_exec($this->db, $stm, $error);
        if (!$q) {
            $stm = "CREATE TABLE users (id INTEGER PRIMARY KEY, username VARCHAR(30) NOT NULL UNIQUE, password VARCHAR(64) NOT NULL);";
            $ok = sqlite_exec($this->db, $stm, $error);
            if (!$ok)
                die("Cannot execute query. $error");
            $hash = hash('sha256', 'toto');
            $stm = "INSERT INTO users ( username, password ) VALUES ( 'nicolas' , '$hash')";
            $ok = sqlite_exec($this->db, $stm, $error);
            if (!$ok)
                die("Cannot execute query. $error");
        }
    }
}
