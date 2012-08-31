<?php

function install_pgsql($db,$prefix) {

	$req = "CREATE TABLE ". $prefix ."data (
	        id SERIAL PRIMARY KEY AUTO_INCREMENT,
	        data TEXT,
	        type_id INT NOT NULL,
	        category_id INT NOT NULL,
	        user_id INT NOT NULL)";
	$db->query($req);

	$req = "CREATE TABLE ". $prefix ."category (
	        id SERIAL PRIMARY KEY AUTO_INCREMENT,
	        data TEXT NOT NULL,
	        type_id INT NOT NULL,
	        user_id INT NOT NULL)";
	$db->query($req);

	$req = "CREATE TABLE ". $prefix ."user (
	        id SERIAL PRIMARY KEY AUTO_INCREMENT,
	        username VARCHAR(256) NOT NULL UNIQUE,
	        verifier VARCHAR(256) NOT NULL,
	        salt VARCHAR(32) NOT NULL,
	        config TEXT NOT NULL);";
	$db->query($req);

	$req = "CREATE TABLE ". $prefix ."history (
	        id SERIAL PRIMARY KEY AUTO_INCREMENT,
	        data TEXT,
	        timestamp INT NOT NULL,
	        user_id INT NOT NULL)";
	$db->query($req);

}

function install_sqlite($db,$prefix) {

	$req = "CREATE TABLE ". $prefix ."data (
	        id INTEGER PRIMARY KEY,
	        data TEXT,
	        type_id INT NOT NULL,
	        category_id INT NOT NULL,
	        user_id INT NOT NULL)";
	$db->query($req);

	$req = "CREATE TABLE ". $prefix ."category (
	        id INTEGER PRIMARY KEY,
	        data TEXT NOT NULL,
	        type_id INT NOT NULL,
	        user_id INT NOT NULL)";
	$db->query($req);

	$req = "CREATE TABLE ". $prefix ."user (
	        id INTEGER PRIMARY KEY,
	        username VARCHAR(256) NOT NULL UNIQUE,
	        verifier VARCHAR(256) NOT NULL,
	        salt VARCHAR(32) NOT NULL,
	        config TEXT NOT NULL);";
	$db->query($req);

	$req = "CREATE TABLE ". $prefix ."history (
	        id INTEGER PRIMARY KEY,
	        data TEXT,
	        timestamp INT NOT NULL,
	        user_id INT NOT NULL)";
	$db->query($req);

}

function install_mysql($db,$prefix) {

	$req = "CREATE TABLE ". $prefix ."data (
	        id INTEGER PRIMARY KEY AUTO_INCREMENT,
	        data TEXT,
	        type_id INT NOT NULL,
	        category_id INT NOT NULL,
	        user_id INT NOT NULL)";
	$db->query($req);

	$req = "CREATE TABLE ". $prefix ."category (
	        id INTEGER PRIMARY KEY AUTO_INCREMENT,
	        data TEXT NOT NULL,
	        type_id INT NOT NULL,
	        user_id INT NOT NULL)";
	$db->query($req);

	$req = "CREATE TABLE ". $prefix ."user (
	        id INTEGER PRIMARY KEY AUTO_INCREMENT,
	        username VARCHAR(256) NOT NULL UNIQUE,
	        verifier VARCHAR(256) NOT NULL,
	        salt VARCHAR(32) NOT NULL,
	        config TEXT NOT NULL);";
	$db->query($req);

	$req = "CREATE TABLE ". $prefix ."history (
	        id INTEGER PRIMARY KEY AUTO_INCREMENT,
	        data TEXT,
	        timestamp INT NOT NULL,
	        user_id INT NOT NULL)";
	$db->query($req);

}

