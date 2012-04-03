<?php
/*
    CONFIG FILE
*/

// Data Source Name for database connection see: http://www.php.net/manual/en/pdo.drivers.php
// sqlite exemple:
//  sqlite:../test.db
// postgresql exemple:
//  pgsql:host=localhost;port=5432;dbname=pwdremind;user=pwdremind;password=pwdremind

define('PDO_DNS', 'sqlite:../test.db');

define("SESSION_TIMEOUT", 300);

//Log
ini_set("log_errors" , "1");
ini_set("error_log" , "Errors.log.txt");
ini_set("display_errors" , "0");
