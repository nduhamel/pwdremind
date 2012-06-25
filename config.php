<?php
/*
    CONFIG FILE
*/

// Data Source Name for database connection see: http://www.php.net/manual/en/pdo.drivers.php
// sqlite exemple:
//  sqlite:../test.db
// postgresql exemple:
//  pgsql:host=localhost;port=5432;dbname=pwdremind;user=pwdremind;password=pwdremind
define('PDO_DSN', 'sqlite:../test.db');

//Define your db username and password
define('PDO_USER','username');
define('PDO_PASSWORD','password');

define("SESSION_TIMEOUT", 300);

//Log
ini_set("log_errors" , "1");
ini_set("error_log" , "Errors.log.txt");
ini_set("display_errors" , "0");
