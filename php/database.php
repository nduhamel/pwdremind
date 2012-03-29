<?php
class Database {
	private $db;

	public function __construct($dbname) {
		try {
			$this->db = new PDO('sqlite:../test.db');
			$this->db->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );
			/*
			$this->createTables();
			*/

		} catch (PDOException $e) {
			print "Erreur !: " . $e->getMessage() . "<br/>";
			die();
		}
	}

	public function __destruct() {
		$this->db = NULL;
	}

	public function get_verifier($username){
		$req = $this->db->prepare("SELECT * FROM users WHERE username = :username");
		$req->execute(array('username'=>$username));
		return $req->fetchObject();
	}

	public function get_entries($username){
		$req = $this->db->prepare("SELECT id,data FROM password WHERE username = :username");
		$req->execute(array('username'=>$username));
		return $req->fetchall(PDO::FETCH_ASSOC);
	}

	public function store_entry($data, $username) {
		$req = $this->db->prepare("INSERT INTO password (data, username)  VALUES(:data, :username)");
		$req->execute(array('data'=> $data,'username'=>$username));
		return $this->db->lastInsertId();
	}

	public function delete_entry($id, $username) {
		$req = $this->db->prepare("DELETE FROM password WHERE id=:id AND username=:username ");
		$req->execute(array('id'=>$id, 'username'=>$username));
		return $id;
	}

	private function createTables(){
		$stm = "CREATE TABLE password (id INTEGER PRIMARY KEY, data TEXT, username TEXT)";
		$this->db->query($stm);
		$stm = "CREATE TABLE users (id INTEGER PRIMARY KEY, username VARCHAR(128) NOT NULL UNIQUE, verifier VARCHAR(256) NOT NULL, salt VARCHAR(32) NOT NULL );";
		$this->db->query($stm);

		// admin:admin
		$stm = "INSERT INTO users (username, verifier, salt) VALUES ('admin', '01073e301b235e616c19eddd48cadf1c48c0ed83c1e5a2cb0841ab892808b4468e', 'ee8528c459ba7fcfb5a6');";
		$this->db->query($stm);
	}
}
