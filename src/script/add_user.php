<?php

    require_once(dirname(dirname(__FILE__)).'/config.php');
    require_once(dirname(dirname(__FILE__)).'/php/utils/add_user.php');

    if (PDO_DRIVER == 'sqlite') {
        $db = new PDO(PDO_DSN);
    } else {
        $db = new PDO(PDO_DSN, PDO_USER, PDO_PASSWORD);
    }

    $srp = new SRPOptions();

    // Get information FROM ". DB_PREFIX ."userc
    fwrite(STDOUT, "Please enter username: ");
    $name = trim(fgets(STDIN));
    fwrite(STDOUT, "Please enter password: ");
    $password = trim(fgets(STDIN));

    // salt
    $salt = $srp->random_salt();

    // verifier
    $verifier = computverifier($srp, $name, $password, $salt);

    // Show results:
    fwrite(STDOUT,"Results:\n");
    fwrite(STDOUT,"Username: $name\n");
    fwrite(STDOUT,"Salt: $salt\n");
    fwrite(STDOUT,"Verifier: $verifier\n");
    fwrite(STDOUT,"Adding user: \n");

    //Adding user to the database
    try {
        $req = "INSERT INTO ".DB_PREFIX."user (username, verifier, salt, config)
                VALUES ('".$name."', '".$verifier."', '".$salt."', '{}')";
        $db->query($req);
        fwrite(STDOUT,"User added!\n");
    } catch (PDOException $e) {
        fwrite(STDOUT,"Error : ". $e->getMessage() ."\n");
    }


