<?php 

//Log
ini_set("log_errors" , "1");
ini_set("error_log" , "errors.log");
ini_set("display_errors" , "0");

require_once(dirname(dirname(dirname(dirname(__FILE__)))).'/config.php');
require_once(__ROOT__.'/php/utils/db_sql.php');

try {

	if (PDO_DRIVER == 'sqlite') {
	    $db = new PDO(PDO_DSN);
	} else {
	    $db = new PDO(PDO_DSN, PDO_USER, PDO_PASSWORD);
	}

	if (PDO_DRIVER == 'pgsql') {
	    install_pgsql($db, DB_PREFIX);
	} elseif (PDO_DRIVER == 'sqlite') {
	    install_sqlite($db, DB_PREFIX);
	} else {
	    install_mysql($db, DB_PREFIX);
	}

	print("Success!");
	
} catch (Exception $e) {
	print("Connection failed : ". $e->getMessage() );
}