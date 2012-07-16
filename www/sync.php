<?php
require_once('../php/database.php');
require_once('../php/srpsession.php');
require_once('../php/message.php');
require_once('../php/authentication.php');
require_once('../config.php');
require_once('../php/Slim/Slim.php');


$session = new SrpSession();
$message = new Message($session->getKhex());
$db = new Database();

$app = new Slim(array( 'log.enable' => true, 'log.path' => './errors.log', 'log.level' => 4 ));

//Check if logged in
$authCheck = function () use ($app, $session) {
    if ( !$session->is_logged() ) {
        $app->halt(403);
    }
};

$app->get('/', function () use ($app) {
    $app->redirect('index.html');
});

$app->post('/authentication', function () use ($app, $db) {
    $username = $app->request()->post('username');
    $A = $app->request()->post('A');
    $M1 = $app->request()->post('M1');
    $auth = new Authentication($db,$username,$A,$M1);
    $auth->run();
});


// GET all lastest passwords
$app->get('/passwords', $authCheck, function () use ($db, $session, $message) {
    $entries = $db->lastest_entries($session->get_userid());
    $message->setData($entries);
    $message->send();
});


//GET all categories
$app->get('/categories', $authCheck, function () use ($db, $session, $message) {
    $categories = $db->get_categories( $session->get_userid() );
    $message->setData($categories);
    $message->send();
});

// ADD new category
$app->post('/category', $authCheck, function () use ($app, $db, $session, $message){
    $requestBody = $app->request()->getBody();
    $json_a = json_decode($requestBody, true);
    $id = $db->add_category($json_a['data'], $session->get_userid());
    $message->setData(array(
                    'id' => $id,
                    'data' => $json_a['data'],
    ));
    $message->send();
});

// GET all passwords in a specific category
$app->get('/passwords/category/:id', $authCheck, function ($id) use ($db, $session, $message) {
    $entries = $db->get_entries($id, $session->get_userid());
    $message->setData($entries);
    $message->send();
});


// ADD new password
$app->post('/password', $authCheck, function () use ($app, $db, $session, $message){
    $requestBody = $app->request()->getBody();
    $json_a = json_decode($requestBody, true);
    $id = $db->store_entry($json_a['data'], $json_a['category_id'], $session->get_userid());
    $message->setData(array(
                    'id' => $id,
                    'data' => $json_a['data'],
                    'category_id' => $json_a['category_id'],
    ));
    $message->send();
});

//Logout
$app->get('/logout', $authCheck, function () use  ($app, $session) {
    $session->logout();
    $app->redirect('index.html');
});

//Run the app :)
$app->run();

