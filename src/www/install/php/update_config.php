<?php

//Log
ini_set("log_errors" , "1");
ini_set("error_log" , "errors.log");
ini_set("display_errors" , "0");

define('__ROOT__', dirname(dirname(dirname(dirname(__FILE__)))).'/');

$data = json_decode(file_get_contents('php://input'),true);


try {

	//If config file doesn't exist
	if (!file_exists(__ROOT__.'config.php')) {
		copy(__ROOT__.'config.php-dist', __ROOT__.'config.php');
	}

	// Replace " with ' in config file
	$file_content = file_get_contents(__ROOT__.'config.php');
	$file_content = str_replace("\"","'" , $file_content );

	// Parsing config
	$file_content = explode("\n", $file_content);

	//Update values
	if (is_array($data)) {
		$i = 0;
		foreach ($file_content as $line) {
			// Line ex | define('PDO_DSN', 'sqlite:../test.db');
			$line = explode("'", $line);
			
			// $line[1] = PDO_DSN
			// $line[3] = sqlite:__ROOT_test.db
			if (isset($line[1]) && isset($line[3]) ) {
				foreach ($data as $key => $value) {
					if ( $key == $line[1] ) {
						$line[3] = $value;
						$line = implode("'", $line);
						$file_content[$i] = $line;
					}
				}
			}
			
			$i++;
		}
	}

	// Array to string
	$file_content = implode("\n", $file_content);

	// Correcting sqlite path
	$file_content = str_replace("__SQLITEROOT__", __ROOT__ , $file_content );

	// Writting to file
	file_put_contents(__ROOT__.'config.php', $file_content);

	print("Success!");
	
} catch (Exception $e) {
	print("Connection failed : ". $e->getMessage() );
}