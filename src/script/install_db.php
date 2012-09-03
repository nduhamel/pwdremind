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
                type_id INT NOT NULL,
                category_id INT NOT NULL,
                user_id INT NOT NULL)";
        $db->query($req);
        fwrite(STDOUT,"Data table created!\n");

        $req = "CREATE TABLE category (
                id SERIAL PRIMARY KEY AUTO_INCREMENT,
                data TEXT NOT NULL,
                type_id INT NOT NULL,
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

        $req = "CREATE TABLE history (
                id SERIAL PRIMARY KEY AUTO_INCREMENT,
                data TEXT,
                timestamp INT NOT NULL,
                user_id INT NOT NULL)";
        $db->query($req);
        fwrite(STDOUT,"history table created!\n");

    }
    elseif (PDO_DRIVER == 'sqlite') {
        $req = "CREATE TABLE data (
                id INTEGER PRIMARY KEY,
                data TEXT,
                type_id INT NOT NULL,
                category_id INT NOT NULL,
                user_id INT NOT NULL)";
        $db->query($req);
        fwrite(STDOUT,"Data table created!\n");

        $req = "CREATE TABLE category (
                id INTEGER PRIMARY KEY,
                data TEXT NOT NULL,
                type_id INT NOT NULL,
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

        $req = "CREATE TABLE history (
                id INTEGER PRIMARY KEY,
                data TEXT,
                timestamp INT NOT NULL,
                user_id INT NOT NULL)";
        $db->query($req);
        fwrite(STDOUT,"history table created!\n");
    }
    else {

        $req = "CREATE TABLE data (
                id INTEGER PRIMARY KEY AUTO_INCREMENT,
                data TEXT,
                type_id INT NOT NULL,
                category_id INT NOT NULL,
                user_id INT NOT NULL)";
        $db->query($req);
        fwrite(STDOUT,"Data table created!\n");

        $req = "CREATE TABLE category (
                id INTEGER PRIMARY KEY AUTO_INCREMENT,
                data TEXT NOT NULL,
                type_id INT NOT NULL,
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

        $req = "CREATE TABLE history (
                id INTEGER PRIMARY KEY AUTO_INCREMENT,
                data TEXT,
                timestamp INT NOT NULL,
                user_id INT NOT NULL)";
        $db->query($req);
        fwrite(STDOUT,"history table created!\n");

    }

    fwrite(STDOUT,"Done!\n");
