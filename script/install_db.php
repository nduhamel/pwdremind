<?php
    require_once('../config.php');
    if (PDO_DRIVER == 'sqlite') {
        $db = new PDO(PDO_DSN);
    }
    else {
        $db = new PDO(PDO_DSN, PDO_USER, PDO_PASSWORD);
    }

    fwrite(STDOUT,"Database driver : ". PDO_DRIVER ." \n");


    if (PDO_DRIVER == 'pgsql') {

        $req = "CREATE TABLE data (
                id SERIAL PRIMARY KEY AUTO_INCREMENT,
                data TEXT,
                category_id INT NOT NULL,
                user_id INT NOT NULL)";
        $db->query($req);
        fwrite(STDOUT,"Data table created!\n");

        $req = "CREATE TABLE category (
                id SERIAL PRIMARY KEY AUTO_INCREMENT,
                data TEXT NOT NULL,
                user_id INT NOT NULL)";
        $db->query($req);
        fwrite(STDOUT,"Category table created!\n");

        $req = "CREATE TABLE user (
                id SERIAL PRIMARY KEY AUTO_INCREMENT,
                username VARCHAR(256) NOT NULL UNIQUE,
                verifier VARCHAR(256) NOT NULL,
                salt VARCHAR(32) NOT NULL,
                config TEXT NOT NULL);";
                $db->query($req);
        fwrite(STDOUT,"User table created!\n");
    }
    elseif (PDO_DRIVER == 'sqlite') {
        $req = "CREATE TABLE data (
                id INTEGER PRIMARY KEY,
                data TEXT,
                category_id INT NOT NULL,
                user_id INT NOT NULL)";
        $db->query($req);
        fwrite(STDOUT,"Data table created!\n");

        $req = "CREATE TABLE category (
                id INTEGER PRIMARY KEY,
                data TEXT NOT NULL,
                user_id INT NOT NULL)";
        $db->query($req);
        fwrite(STDOUT,"Category table created!\n");

        $req = "CREATE TABLE user (
                id INTEGER PRIMARY KEY,
                username VARCHAR(256) NOT NULL UNIQUE,
                verifier VARCHAR(256) NOT NULL,
                salt VARCHAR(32) NOT NULL,
                config TEXT NOT NULL);";
        $db->query($req);
        fwrite(STDOUT,"User table created!\n");
    }
    else {

        $req = "CREATE TABLE data (
                id INTEGER PRIMARY KEY AUTO_INCREMENT,
                data TEXT,
                category_id NT NOT NULL,
                user_id INT NOT NULL)";
        $db->query($req);
        fwrite(STDOUT,"Data table created!\n");

        $req = "CREATE TABLE category (
                id INTEGER PRIMARY KEY AUTO_INCREMENT,
                data TEXT NOT NULL,
                user_id INT NOT NULL)";
        $db->query($req);
        fwrite(STDOUT,"Category table created!\n");

        $req = "CREATE TABLE user (
                id INTEGER PRIMARY KEY AUTO_INCREMENT,
                username VARCHAR(256) NOT NULL UNIQUE,
                verifier VARCHAR(256) NOT NULL,
                salt VARCHAR(32) NOT NULL,
                config TEXT NOT NULL);";
        $db->query($req);
        fwrite(STDOUT,"User table created!\n");

    }

    fwrite(STDOUT,"Done!\n");
