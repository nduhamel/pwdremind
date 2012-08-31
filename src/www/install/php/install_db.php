<?php 

require_once('../../../php/utils/db_sql.php');
require_once('../../../config.php');

//Log
ini_set('log_errors' , '1');
ini_set('error_log' , 'errors.log');
ini_set('display_errors' , '0');

$data = json_decode(file_get_contents('php://input'),true);

if (PDO_DRIVER == 'sqlite') {
    $db = new PDO(PDO_DSN);
} else {
    $db = new PDO(PDO_DSN, PDO_USER, PDO_PASSWORD);
}

if (PDO_DRIVER == 'pgsql') {
    install_pgsql($db,$data['prefix']);
} elseif (PDO_DRIVER == 'sqlite') {
    install_sqlite($db,$data['prefix']);
} else {
    install_mysql($db,$data['prefix']);
}

print("Success!");