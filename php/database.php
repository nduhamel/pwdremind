<?php
require_once('../config.php');

class Database {
	private $_db;

	public function __construct() {
		try {
			$this->_db = new PDO(PDO_DNS);
			$this->_db->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );
		} catch (PDOException $e) {
			print "Erreur !: " . $e->getMessage() . "<br/>";
			die();
		}
	}

	public function __destruct() {
		$this->_db = NULL;
	}

	public function get_verifier($username){
		$req = $this->_db->prepare("SELECT * FROM user WHERE username = :username");
		$req->execute(array('username'=>$username));
		return $req->fetchObject();
	}

	public function get_entries($username){
		$req = $this->_db->prepare("SELECT id,data FROM password WHERE username = :username");
		$req->execute(array('username'=>$username));
		return $req->fetchall(PDO::FETCH_ASSOC);
	}

	public function store_entry($data, $username) {
		$req = $this->_db->prepare("INSERT INTO password (data, username)  VALUES(:data, :username)");
		$req->execute(array('data'=> $data,'username'=>$username));
		return $this->_db->lastInsertId();
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

	public function createTables() {
		
		$req = "CREATE TABLE password (
				id INTEGER PRIMARY KEY, 
				data TEXT, 
				username VARCHAR(128) NOT NULL)";
		$this->_db->query($req);
		
		$req = "CREATE TABLE user (
				id INTEGER PRIMARY KEY, 
				username VARCHAR(128) NOT NULL UNIQUE, 
				verifier VARCHAR(256) NOT NULL, 
				salt VARCHAR(32) NOT NULL );";
		$this->_db->query($req);

		// admin:admin
		$req = "INSERT INTO user (username, verifier, salt) 
				VALUES ('admin', 
						'01073e301b235e616c19eddd48cadf1c48c0ed83c1e5a2cb0841ab892808b4468e', 
						'ee8528c459ba7fcfb5a6');";
		$this->_db->query($req);
	}
}
