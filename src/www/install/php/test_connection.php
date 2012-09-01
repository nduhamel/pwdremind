<?php
	
	//Log
	ini_set('log_errors' , '1');
	ini_set('error_log' , 'errors.log');
	ini_set('display_errors' , '0');

	$data = json_decode(file_get_contents('php://input'),true);

	$PDO_DRIVER = $data['PDO_DRIVER'];
	$PDO_DSN = str_replace("sqlite:../","sqlite:../../" , $data['PDO_DSN'] );;
	$PDO_USER = $data['PDO_USER'];
	$PDO_PASSWORD = $data['PDO_PASSWORD'];

	try {
		if ($PDO_DRIVER == 'sqlite')
		    $db = new PDO($PDO_DSN);
		else 
		    $db = new PDO($PDO_DSN, $PDO_USER, $PDO_PASSWORD);
		print("Success!");
	} catch (PDOException $e) {
		print("Connection failed : ". $e->getMessage() );
	}
