<?php

/*
 * NOTE
 ***************/

// GET all lastest notes
$router->addRoute('GET', '/note', $authCheck, function() use ($db, $message, $session) {
    $entries = $db->lastestEntries(PwdremindAPI::NOTE, $session->getUserid());
    $message->setData($entries);
    $message->send();
});

// GET notes in a specific category
$router->addRoute('GET', '/note/category/:id', $authCheck, function($id) use ($db, $message, $session) {
    $entries = $db->getEntries(PwdremindAPI::NOTE, $id, $session->getUserid());
    $message->setData($entries);
    $message->send();
});

//GET note categories
$router->addRoute('GET', '/note/categories', $authCheck, function() use ($db, $message, $session) {
    $categories = $db->getCategories(PwdremindAPI::NOTE, $session->getUserid() );
    $message->setData($categories);
    $message->send();
});


/**
 * POST
 */

// ADD a new note category
$router->addRoute('POST', '/note/category', $authCheck, function() use ($db, $message, $session, $rawInput) {
    $id = $db->addCategory($rawInput['data'], PwdremindAPI::NOTE, $session->getUserid());
    $message->setData(array(
                    'id' => $id,
                    'data' => $rawInput['data'],
    ));
    $message->send();
});

// ADD a new note
$router->addRoute('POST', '/note', $authCheck, function() use ($db, $message, $session, $rawInput) {
    $id = $db->storeEntry($rawInput['data'], PwdremindAPI::NOTE, $rawInput['category_id'], $session->getUserid());
    $message->setData(array(
                    'id' => $id,
                    'data' => $rawInput['data'],
                    'category_id' => $rawInput['category_id'],
    ));
    $message->send();
});


/**
 * PUT
 */

$router->addRoute('PUT', '/note', $authCheck, function() use ($db, $message, $session, $rawInput) {
    $db->updateEntry($rawInput['id'], $rawInput['data'], PwdremindAPI::NOTE, $rawInput['category_id'], $session->getUserid());
    $message->setData(array(
                    'id' => $rawInput['id'],
                    'data' => $rawInput['data'],
                    'category_id' => $rawInput['category_id'],
    ));
    $message->send();
});
