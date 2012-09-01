<?php

    require_once('../../../config.php');
    require_once('../../../php/utils/add_user.php');

    $data = json_decode(file_get_contents('php://input'),true);

    if (PDO_DRIVER == 'sqlite') {
        // Correct db path
        $DSN = str_replace("sqlite:../","sqlite:../../" , PDO_DSN );
        $db = new PDO($DSN);
    } else {
        $db = new PDO(PDO_DSN, PDO_USER, PDO_PASSWORD);
    }

    $srp = new SRPOptions();

    $username = trim( $data['username'] );
    $password = trim( $data['password'] );

    // salt
    $salt = $srp->random_salt();

    // verifier
    $verifier = computverifier($srp, $username, $password, $salt);

    //Adding user to the database
    try {
        $req = "INSERT INTO ". DB_PREFIX ."user (username, verifier, salt, config)
                VALUES ('".$username."', '".$verifier."', '".$salt."', '{}')";
        $db->query($req);
        print("Success!");
    } catch (PDOException $e) {
        print("Error : ". $e->getMessage() );
    }


