<?php 

require_once('../../../php/utils/db_sql.php');
require_once('../../../config.php');

if (PDO_DRIVER == 'sqlite') {
	// Correct db path
	$DSN = str_replace("sqlite:../","sqlite:../../" , PDO_DSN );
    $db = new PDO($DSN);
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