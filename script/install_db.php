<?php
require_once('../config.php');

$db = new PDO(PDO_DNS);
$driver = $db->getAttribute(PDO::ATTR_DRIVER_NAME);

if ($driver == 'pgsql') {
	
	$req = "CREATE TABLE password (
			id SERIAL PRIMARY KEY, 
			data TEXT, 
			username VARCHAR(128) NOT NULL)";
	$db->query($req);
	
	$req = "CREATE TABLE user (
			id SERIAL PRIMARY KEY, 
			username VARCHAR(128) NOT NULL UNIQUE, 
			verifier VARCHAR(256) NOT NULL, 
			salt VARCHAR(32) NOT NULL );";
	$db->query($req);
}
else {
	
	$req = "CREATE TABLE password (
			id INTEGER PRIMARY KEY, 
			data TEXT, 
			username VARCHAR(128) NOT NULL)";
	$db->query($req);
	
	$req = "CREATE TABLE user (
			id INTEGER PRIMARY KEY, 
			username VARCHAR(128) NOT NULL UNIQUE, 
			verifier VARCHAR(256) NOT NULL, 
			salt VARCHAR(32) NOT NULL );";
	$db->query($req);

}

