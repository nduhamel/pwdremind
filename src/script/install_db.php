<?php
    require_once('../config.php');
    require_once('../php/utils/db_sql.php');

    if (PDO_DRIVER == 'sqlite') {
        $db = new PDO(PDO_DSN);
    } else {
        $db = new PDO(PDO_DSN, PDO_USER, PDO_PASSWORD);
    }

    fwrite(STDOUT,"Database driver : ". PDO_DRIVER ." \n");

    fwrite(STDOUT,"Database installation... \n");

    if (PDO_DRIVER == 'pgsql') {
        install_pgsql($db,DB_PREFIX);
    } elseif (PDO_DRIVER == 'sqlite') {
        install_sqlite($db,DB_PREFIX);
    } else {
        install_mysql($db,DB_PREFIX);
    }

    fwrite(STDOUT,"Done!\n");
