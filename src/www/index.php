<?php
require_once('../php/app.php');

//Empty arrays
$inputs = array();
$post = array();

//URI Data
$scriptName = str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME']) ); 
$inputs['URI'] = substr_replace($_SERVER['REQUEST_URI'], '', 0, strlen($scriptName));

//Method
// POST PUT GET
$inputs['method'] = @$_SERVER['REQUEST_METHOD'];

//Raw input for requests
$inputs['raw_input'] = @file_get_contents('php://input');

//POST data
@parse_str($inputs['raw_input'] , $post);

//Merge all
$inputs = array_merge($inputs,$post);


//Start the app
$app = new App($inputs);
$app->run();



