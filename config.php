<?php
/*
    CONFIG FILE
*/

// Data Source Name for database connection see: http://www.php.net/manual/en/pdo.drivers.php
// sqlite exemple:
//  sqlite:../test.db
// postgresql exemple:
//  pgsql:host=localhost;port=5432;dbname=pwdremind;user=pwdremind;password=pwdremind
define('PDO_DSN', 'mysql:host=127.0.0.1;port=8889;dbname=pwdremind');

//Define your db username and password
define('PDO_USER','root');
define('PDO_PASSWORD','root');

define("SESSION_TIMEOUT", 300);

//Log
ini_set("log_errors" , "1");
ini_set("error_log" , "Errors.log.txt");
ini_set("display_errors" , "0");
