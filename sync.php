<?php

define("SESSION_TIMEOUT", 100);

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
                    session_write_close();
                    exit;
                case 'logout':
                    $this->session->logout();
                    echo 1;
                    session_write_close();
                    exit;
                case 'keepalive':
                    if ($this->session->is_logged_in()){
                        echo 'OK';
                        session_write_close();
                        exit;
                    }else{
                        echo 'ERROR';
                        session_write_close();
                        exit;
                    }
                case 'add':
                    if ($this->session->is_logged_in()){
                        $data = stripslashes($_GET['data']);
                        $id = $this->db->store_entry($data, $this->session->get_username());
                        echo json_encode(array('id'=>$id));
                        session_write_close();
                        exit;
                    }else{
                        error_die('Not logged');
                    }
                case 'remove':
                    if ($this->session->is_logged_in()){
                        $id = $_GET['id'];
                        $id = $this->db->delete_entry($id, $this->session->get_username());
                        echo "OK";
                        session_write_close();
                        exit;
                    }else{
                        error_die('Not logged');
                    }
                case 'get':
                    if ($this->session->is_logged_in()){
                        echo json_encode($this->db->get_entries($this->session->get_username()));
                        session_write_close();
                        exit;
                    }else{
                        error_die('Not logged');
                    }
            }
        }

        if (isset($_POST['username']) && isset($_POST['password'])){
            $this->try_login();
        }
    }

    public function try_login(){
        $username = $_POST['username'];
        $password = $_POST['password'];
        unset($_POST['username']);
        unset($_POST['password']);
        $local_hash = $this->db->get_user_pwd_hash($username);
        if($local_hash == hash('sha256', $password)){
            $this->session->login($username);
            echo json_encode(array('username' => $username));
            session_write_close();
            exit;
        }else{
            error_die('Invalid login params');
        }
    }

}

function error_die($message){
    echo json_encode(array('error' => $message));
    session_write_close();
    exit;
}

class Session {

    public function __construct() {
        session_start();
    }

    public function login($userid){
        session_regenerate_id ();
        $_SESSION['valid'] = True;
        $_SESSION['username'] = $userid;
        $_SESSION['LAST_ACTIVITY'] = time();
    }

    public function is_logged_in(){
        if(isset($_SESSION['valid']) && $_SESSION['valid'] && $this->check_activity() ){
            return True;
        }else{
            return False;
        }
    }

    public function logout(){
        $_SESSION = array(); //destroy all of the session variables
        session_destroy();
    }

    public function get_username(){
        return $_SESSION['username'];
    }

    private function check_activity(){
        $time = time();
        if( $time - $_SESSION['LAST_ACTIVITY']  <= SESSION_TIMEOUT ){
            session_regenerate_id(true);
            $_SESSION['LAST_ACTIVITY'] = $time;
            return True;
        }else{
            $this->logout();
            return False;
        }

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

    public function get_entries($username){
        $username = $this->sqlite_quote_string($username);
        $result = $this->db_query("SELECT id,data FROM password WHERE username='$username'");
        return  sqlite_fetch_all($result, SQLITE_ASSOC);
    }

    public function store_entry($data, $username) {
        $data = $this->sqlite_quote_string($data);
        $username = $this->sqlite_quote_string($username);
        $result = $this->db_query("INSERT INTO password (data, username)  VALUES('$data', '$username')");
        return sqlite_last_insert_rowid($this->db);
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
            $stm = "CREATE TABLE password (id INTEGER PRIMARY KEY, data TEXT, username TEXT)";
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
