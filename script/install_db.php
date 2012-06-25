<?php
    require_once('../config.php');

    $db = new PDO(PDO_DSN, PDO_USER, PDO_PASSWORD);
    $driver = $db->getAttribute(PDO::ATTR_DRIVER_NAME);
    fwrite(STDOUT,"Database driver : ". $driver ." \n");


    if ($driver == 'pgsql') {

        $req = "CREATE TABLE data (
                id SERIAL PRIMARY KEY AUTO_INCREMENT, 
                data TEXT,
                category VARCHAR(36),
                user_id INT NOT NULL)";
        $db->query($req);
        fwrite(STDOUT,"Data table created!\n");

        $req = "CREATE TABLE user (
                id SERIAL PRIMARY KEY AUTO_INCREMENT, 
                username VARCHAR(256) NOT NULL UNIQUE,
                verifier VARCHAR(256) NOT NULL,
                salt VARCHAR(32) NOT NULL,
                category TEXT NOT NULL,
                config TEXT NOT NULL);";
                $db->query($req);
        fwrite(STDOUT,"User table created!\n");
    }
    else {

        $req = "CREATE TABLE data (
                id INTEGER PRIMARY KEY AUTO_INCREMENT, 
                data TEXT,
                category VARCHAR(36),
                user_id INT NOT NULL)";
        $db->query($req);
        fwrite(STDOUT,"Data table created!\n");

        $req = "CREATE TABLE user (
                id INTEGER PRIMARY KEY AUTO_INCREMENT,
                username VARCHAR(256) NOT NULL UNIQUE,
                verifier VARCHAR(256) NOT NULL,
                salt VARCHAR(32) NOT NULL,
                category TEXT NOT NULL,
                config TEXT NOT NULL);";
        $db->query($req);
        fwrite(STDOUT,"User table created!\n");

    }

    fwrite(STDOUT,"Done!\n");
