<?php
require_once('../php/sync.php');


//--- Input datas --- //

//URI Data
$URI = str_replace(PATH, '', $_SERVER['REQUEST_URI']);

//Raw input for post requests
$raw_input = @file_get_contents('php://input');
if ( !$raw_input )
    $raw_input = NULL;

//Auth datas
if (isset($_POST['username']))
    $username = $_POST['username'];
else
    $username = NULL;

if (isset($_POST['A']))
    $A = $_POST['A'];
else
    $A = NULL;

if (isset($_POST['M1']))
    $M1 = $_POST['M1'];
else
    $M1 = NULL;

//---- /Input Data ---- //


//Start sync
$sync = new Sync($URI, $username, $A, $M1, $raw_input);
$sync->run();



