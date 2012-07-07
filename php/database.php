<?php
require_once('../config.php');

class Database {
    private $_db;
    private $_driver;

    public function __construct()
    {
        try {
            if (PDO_DRIVER == 'sqlite') {
                $this->_db = new PDO(PDO_DSN);
            }
            else {
                $this->_db = new PDO(PDO_DSN, PDO_USER, PDO_PASSWORD);
            }
            $this->_db->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );
            $this->_driver = PDO_DRIVER;
        } catch (PDOException $e) {
            print "Erreur !: " . $e->getMessage() . "<br/>";
            die();
        }
    }

    public function __destruct()
    {
        $this->_db = NULL;
    }

    public function get_verifier($username)
    {
        $req = $this->_db->prepare("SELECT * FROM user WHERE username = :username");
        $req->execute(array('username'=>$username));
        return $req->fetchObject();
    }

    //Return true if the user exists in database
    public function check_username($username)
    {
        $req = $this->_db->prepare("SELECT * FROM user WHERE username = :username");
        $req->execute(array('username'=>$username));
        $req = $req->fetchall(PDO::FETCH_ASSOC);
        if (count($req) == 1)
            return true;
        else
            return false;
    }

/*
    public function get_info($user_id)
    {
        $req = $this->_db->prepare("SELECT category, config FROM user WHERE id = :user_id");
        $req->execute(array('user_id'=>$user_id));
        return $req->fetchObject();
    }
*/

    public function get_categories($user_id)
    {
        $req = $this->_db->prepare("SELECT id, data FROM category WHERE id = :user_id");
        $req->execute(array('user_id'=>$user_id));
        return $req->fetchall(PDO::FETCH_ASSOC);
    }

    public function add_category($data, $user_id)
    {
        if ($this->_driver == 'pgsql'){
            $req = $this->_db->prepare("INSERT INTO category (data, user_id)  VALUES(:name, :user_id) RETURNING id");
            $req->execute(array('name'=> $data,'user_id'=>$user_id));
            return $req->fetchColumn();
        } else {
            $req = $this->_db->prepare("INSERT INTO category (data, user_id)  VALUES(:name, :user_id)");
            $req->execute(array('name'=> $data,'user_id'=>$user_id));
            return $this->_db->lastInsertId();
        }
    }

/*
    public function update_categories($uuid, $user_id)
    {
        $req = $this->_db->prepare("UPDATE user SET category=:uuid WHERE id = :user_id ");
        $req->execute(array('uuid'=>$uuid, 'user_id'=>$user_id));
        return $uuid;
    }
*/

    public function get_entries($category_id, $user_id)
    {
        $req = $this->_db->prepare("SELECT id,data FROM data WHERE user_id = :user_id AND category_id = :category_id");
        $req->execute(array('user_id'=>$user_id, 'category_id'=>$category_id));
        return $req->fetchall(PDO::FETCH_ASSOC);
    }

    public function store_entry($data, $user_id)
    {
        if ($this->_driver == 'pgsql'){
            $req = $this->_db->prepare("INSERT INTO data (data, user_id)  VALUES(:data, :user_id) RETURNING id");
            $req->execute(array('data'=> $data,'user_id'=>$user_id));
            return $req->fetchColumn();
        } else {
            $req = $this->_db->prepare("INSERT INTO data (data, user_id)  VALUES(:data, :user_id)");
            $req->execute(array('data'=> $data,'user_id'=>$user_id));
            return $this->_db->lastInsertId();
        }
    }

    public function update_entry($id,$data, $user_id)
    {
        $req = $this->_db->prepare("UPDATE data SET data=:data WHERE id=:id AND user_id=:user_id ");
        $req->execute(array('data'=>$data,'id'=>$id, 'user_id'=>$user_id));
        return $id;
    }

    public function delete_entry($entry_id, $user_id)
    {
        $req = $this->_db->prepare("DELETE FROM data WHERE id=:entry_id AND user_id=:user_id ");
        $req->execute(array('entry_id'=>$entry_id, 'user_id'=>$user_id));
        return $id;
    }

    //Return true if the entry exists
    public function check_entry($id, $user_id)
    {
        $req = $this->_db->prepare("SELECT id FROM data WHERE id=:id AND user_id=:user_id ");
        $req->execute(array('id'=>$id, 'user_id'=>$user_id));
        $req = $req->fetchall(PDO::FETCH_ASSOC);
        if (count($req) == 1)
            return true;
        else
            return false;
    }

    //Return True if the UUID can be used
    public function check_uuid($uuid, $user_id)
    {
        $req = $this->_db->prepare("SELECT id FROM data WHERE category=:uuid AND user_id=:user_id ");
        $req->execute(array('uuid'=>$uuid, 'user_id'=>$user_id));
        $req = $req->fetchall(PDO::FETCH_ASSOC);
        if (count($req) == 0)
            return true;
        else
            return false;
    }

}
