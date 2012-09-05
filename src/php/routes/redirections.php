<?php

/*
 * REDIRECTIONS
 ***************/

// Setting default route | 404 not found
$router->setDefaultRoute('404.html');

// GET homepage
$router->addRoute('GET', '/', function() {
    header('Location: index.html');
});

// GET installer page
$router->addRoute('GET', '/install/', function() {
    header('Location: index.html');
});

