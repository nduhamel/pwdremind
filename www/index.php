<?php
require_once('../php/sync.php');

//Empty arrays
$inputs = array();
$post = array();

//URI Data
$inputs['URI'] = @str_replace(PATH, '', $_SERVER['REQUEST_URI']);

//Method
// POST PUT GET
$inputs['method'] = @$_SERVER['REQUEST_METHOD'];

//Raw input for requests
$inputs['raw_input'] = @file_get_contents('php://input');

//POST data
@parse_str($inputs['raw_input'] , $post);

//Merge all
$inputs = array_merge($inputs,$post);


//Start sync
$sync = new Sync($inputs);
$sync->run();



