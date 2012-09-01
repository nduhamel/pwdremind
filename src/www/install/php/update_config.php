<?php

$data = json_decode(file_get_contents('php://input'),true);

//If config file doesn't exist
if (!file_exists('../../../config.php')) {
	copy('../../../config.php-dist', '../../../config.php');
}

// Replace " with ' in config file
$file_content = file_get_contents('../../../config.php');
$file_content = str_replace("\"","'" , $file_content );

// Parsing config
$file_content = explode("\n", $file_content);

//Update values
$i = 0;
foreach ($file_content as $line) {
	// Line ex | define('PDO_DSN', 'sqlite:../test.db');
	$line = explode("'", $line);
	
	// $line[1] = PDO_DSN
	// $line[3] = sqlite:../test.db
	foreach ($data as $key => $value) {
		if ( $key == $line[1] ) {
			$line[3] = $value;
			$line = implode("'", $line);
			$file_content[$i] = $line;
		}
	}

	$i++;
}

// Write config file
$file_content = implode("\n", $file_content);
file_put_contents('../../../config.php', $file_content);

print("Success!");