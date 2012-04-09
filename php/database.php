<?php
require_once('../config.php');

class Database {
    private $_db;
    private $_driver;

    public function __construct() {
        try {
            $this->_db = new PDO(PDO_DNS);
            $this->_db->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );
            $this->_driver = $this->_db->getAttribute(PDO::ATTR_DRIVER_NAME);
        } catch (PDOException $e) {
            print "Erreur !: " . $e->getMessage() . "<br/>";
            die();
        }
    }

    public function __destruct() {
        $this->_db = NULL;
    }

    public function get_verifier($username){
        $req = $this->_db->prepare("SELECT * FROM users WHERE username = :username");
        $req->execute(array('username'=>$username));
        return $req->fetchObject();
    }

    public function get_entries($username){
        $req = $this->_db->prepare("SELECT id,data FROM password WHERE username = :username");
        $req->execute(array('username'=>$username));
        return $req->fetchall(PDO::FETCH_ASSOC);
    }

    public function store_entry($data, $username) {
        if ($this->_driver == 'pgsql'){
            $req = $this->_db->prepare("INSERT INTO password (data, username)  VALUES(:data, :username)  RETURNING id");
            $req->execute(array('data'=> $data,'username'=>$username));
            return $req->fetchColumn();
        }else{
            $req = $this->_db->prepare("INSERT INTO password (data, username)  VALUES(:data, :username)");
            $req->execute(array('data'=> $data,'username'=>$username));
            return $this->_db->lastInsertId();
        }
    }

    public function update_entry($id,$data, $username) {
        $req = $this->_db->prepare("UPDATE password SET data=:data WHERE id=:id AND username=:username ");
        $req->execute(array('data'=>$data,'id'=>$id, 'username'=>$username));
        return $id;
    }

    public function delete_entry($id, $username) {
        $req = $this->_db->prepare("DELETE FROM password WHERE id=:id AND username=:username ");
        $req->execute(array('id'=>$id, 'username'=>$username));
        return $id;
    }

    public function check_entry($id, $username) {
        $req = $this->_db->prepare("SELECT id FROM password WHERE id=:id AND username=:username ");
        $req->execute(array('id'=>$id, 'username'=>$username));
        $req = $req->fetchall(PDO::FETCH_ASSOC);
        if (count($req) == 1)
            return true;
        else
            return false;
    }

    private function createTables(){
        $stm = "CREATE TABLE password (id INTEGER PRIMARY KEY, data TEXT, username TEXT)";
        $this->_db->query($stm);
        $stm = "CREATE TABLE users (id INTEGER PRIMARY KEY,
                username VARCHAR(128) NOT NULL UNIQUE, verifier
                VARCHAR(256) NOT NULL, salt VARCHAR(32) NOT NULL );";
        $this->_db->query($stm);

        // admin:admin
        $stm = "INSERT INTO users (username, verifier, salt)
        VALUES ('admin', '01073e301b235e616c19eddd48cadf1c48c0ed83c1e5a2cb0841ab892808b4468e',
        'ee8528c459ba7fcfb5a6');";
        $this->_db->query($stm);
    }
}
