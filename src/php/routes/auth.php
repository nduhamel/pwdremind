<?php

/*
 * AUTHENTICATION
 ***************/

/**
 * Run authentication
 */
$router->addRoute('POST', '/authentication', function() use ($auth) {
    $auth->run();
});

 /**
  * ping and check auth
  */
$router->addRoute('GET', '/ping', $authCheck, function(){});

/**
 * Logout
 */
$router->addRoute('GET', '/logout', $authCheck, function() use ($db, $message, $session, $rawInput) {

});