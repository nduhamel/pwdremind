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

    public function getVerifier($username)
    {
        $req = $this->_db->prepare("SELECT * FROM user WHERE username = :username");
        $req->execute(array('username'=>$username));
        return $req->fetchObject();
    }

    //Return true if the user exists in database
    public function checkUsername($username)
    {
        $req = $this->_db->prepare("SELECT * FROM user WHERE username = :username");
        $req->execute(array('username'=>$username));
        $req = $req->fetchall(PDO::FETCH_ASSOC);
        if (count($req) == 1)
            return true;
        else
            return false;
    }

    public function getCategories($type_id, $user_id)
    {
        $req = $this->_db->prepare("SELECT category.id, category.data, COUNT(data.category_id) as dataCount
                                    FROM category
                                    LEFT OUTER JOIN data ON category.id = data.category_id
                                    WHERE category.user_id = :user_id
                                    AND category.type_id = :type_id
                                    GROUP BY category.id");
        $req->execute(array('user_id'=>$user_id, 'type_id'=>$type_id));
        return $req->fetchall(PDO::FETCH_ASSOC);
    }

    public function addCategory($data, $type_id, $user_id)
    {
        if ($this->_driver == 'pgsql'){
            $req = $this->_db->prepare("INSERT INTO category (data, type_id, user_id)
                                        VALUES(:data, :type_id, :user_id) RETURNING id");
            $req->execute(array('data'=> $data, 'type_id'=>$type_id, 'user_id'=>$user_id));
            return $req->fetchColumn();
        } else {
            $req = $this->_db->prepare("INSERT INTO category (data, type_id, user_id)
                                        VALUES(:data, :type_id, :user_id)");
            $req->execute(array('data'=> $data, 'type_id'=>$type_id, 'user_id'=>$user_id));
            return $this->_db->lastInsertId();
        }
    }

    // TODO check empty !!!
    public function deleteCategory($cat_id, $user_id)
    {
        $req = $this->_db->prepare("DELETE FROM category
                                    WHERE id=:cat_id
                                    AND user_id=:user_id ");
        $req->execute(array('cat_id'=>$cat_id, 'user_id'=>$user_id));
    }

    public function updateCategory($cat_id, $data, $user_id)
    {
        $req = $this->_db->prepare("UPDATE category
                                    SET data=:data
                                    WHERE id=:cat_id
                                    AND user_id=:user_id");
        $req->execute(array('cat_id'=>$cat_id, 'data'=>$data, 'user_id'=>$user_id));
    }

    public function getTypes($user_id) {
        $req = $this->_db->prepare("SELECT id, data
                                    FROM type
                                    WHERE user_id = :user_id");
        $req->execute(array('user_id'=>$user_id));
        return $req->fetchall(PDO::FETCH_ASSOC);
    }

    public function addType($data, $user_id)
    {
        if ($this->_driver == 'pgsql'){
            $req = $this->_db->prepare("INSERT INTO type (data, user_id)
                                        VALUES(:data, :user_id) RETURNING id");
            $req->execute(array('data'=> $data,'user_id'=>$user_id));
            return $req->fetchColumn();
        } else {
            $req = $this->_db->prepare("INSERT INTO type (data, user_id)
                                        VALUES(:data, :user_id)");
            $req->execute(array('data'=> $data,'user_id'=>$user_id));
            return $this->_db->lastInsertId();
        }
    }

    public function getEntries($type_id, $category_id, $user_id)
    {
        $req = $this->_db->prepare("SELECT id,data, type_id, category_id
                                    FROM data
                                    WHERE user_id = :user_id
                                    AND category_id = :category_id
                                    AND type_id  = :type_id ");
        $req->execute(array('user_id'=>$user_id, 'type_id'=>$type_id, 'category_id'=>$category_id));
        return $req->fetchall(PDO::FETCH_ASSOC);
    }

    public function lastestEntries($type_id, $user_id)
    {
        $req = $this->_db->prepare("SELECT id, data, type_id, category_id
                                    FROM data
                                    WHERE user_id = :user_id
                                    AND type_id = :type_id");
        $req->execute(array('type_id'=>$type_id, 'user_id'=>$user_id));
        return $req->fetchall(PDO::FETCH_ASSOC);
    }

    public function storeEntry($data, $type_id, $category_id, $user_id)
    {
        if ($this->_driver == 'pgsql'){
            $req = $this->_db->prepare("INSERT INTO data (data, type_id, category_id, user_id)
                                        VALUES(:data, :type_id, :category_id, :user_id) RETURNING id");
            $req->execute(array('data'=> $data, 'type_id'=>'1', 'category_id'=>$category_id, 'user_id'=>$user_id));
            return $req->fetchColumn();
        } else {
            $req = $this->_db->prepare("INSERT INTO data (data, type_id, category_id, user_id)
                                        VALUES(:data, :type_id, :category_id, :user_id)");
            $req->execute(array('data'=> $data, 'type_id'=>$type_id, 'category_id'=>$category_id, 'user_id'=>$user_id));
            return $this->_db->lastInsertId();
        }
    }

    public function updateEntry($id, $data, $type_id, $category_id, $user_id)
    {
        $req = $this->_db->prepare("UPDATE data
                                    SET data=:data, type_id=:type_id, category_id=:category_id
                                    WHERE id=:id
                                    AND user_id=:user_id ");
        $req->execute(array('data'=>$data,'id'=>$id, 'type_id'=>$type_id,'category_id'=>$category_id, 'user_id'=>$user_id));
        return $id;
    }

    public function deleteEntry($entry_id, $user_id)
    {
        $req = $this->_db->prepare("DELETE FROM data
                                    WHERE id=:entry_id
                                    AND user_id=:user_id ");
        $req->execute(array('entry_id'=>$entry_id, 'user_id'=>$user_id));
    }

    //Return true if the entry exists
    public function checkEntry($id, $user_id)
    {
        $req = $this->_db->prepare("SELECT id
                                    FROM data
                                    WHERE id=:id
                                    AND user_id=:user_id ");
        $req->execute(array('id'=>$id, 'user_id'=>$user_id));
        $req = $req->fetchall(PDO::FETCH_ASSOC);
        if (count($req) == 1)
            return true;
        else
            return false;
    }



}
