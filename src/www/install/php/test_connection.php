<?php
	
	//Log
	ini_set('log_errors' , '1');
	ini_set('error_log' , 'errors.log');
	ini_set('display_errors' , '0');

	$data = json_decode(file_get_contents('php://input'),true);

	if ($data['type'] == 'sqlite')
		$PDO_DSN = $data['type'].':../../'.$data['name'].'.db';
	else
	    $PDO_DSN = $data['type'].':host='.$data['host'].';port='.$data['port'].';dbname='.$data['name'];

	$PDO_USER = $data['username'];
	$PDO_PASSWORD = $data['password'];

	try {
		if ($data['type'] == 'sqlite')
		    $db = new PDO($PDO_DSN);
		else 
		    $db = new PDO($PDO_DSN, $PDO_USER, $PDO_PASSWORD);
		print("Success!");
	} catch (PDOException $e) {
		print("Connection failed : ". $e->getMessage() );
	}
