<?php
require_once('../config.php');

db = new PDO(PDO_DNS);

$stm = "CREATE TABLE password (id INTEGER PRIMARY KEY, data TEXT, username TEXT)";
db->query($stm);
$stm = "CREATE TABLE users (id INTEGER PRIMARY KEY, username VARCHAR(128) NOT NULL UNIQUE, verifier VARCHAR(256) NOT NULL, salt VARCHAR(32) NOT NULL );";
db->query($stm);
