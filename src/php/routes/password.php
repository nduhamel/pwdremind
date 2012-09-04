<?php

/*
 * PASSWORD
 ***************/


/**
 * GET
 */

// GET all lastest passwords
$router->addRoute('GET', '/password', $authCheck, function() use ($db, $message, $session) {
    $entries = $db->lastestEntries(PwdremindAPI::PASSWORD, $session->getUserid());
    $message->setData($entries);
    $message->send();
});

// GET passwords in a specific category
$router->addRoute('GET', '/password/category/:id', $authCheck, function($id) use ($db, $message, $session) {
    $entries = $db->getEntries(PwdremindAPI::PASSWORD, $id, $session->getUserid());
    $message->setData($entries);
    $message->send();
});

//GET password categories
$router->addRoute('GET', '/password/categories', $authCheck, function() use ($db, $message, $session) {
    $categories = $db->getCategories(PwdremindAPI::PASSWORD, $session->getUserid() );
    $message->setData($categories);
    $message->send();
});


/**
 * POST
 */

// ADD a new password
$router->addRoute('POST', '/password', $authCheck, function() use ($db, $message, $session, $rawInput) {
    $id = $db->storeEntry($rawInput['data'], PwdremindAPI::PASSWORD, $rawInput['category_id'], $session->getUserid());
    $message->setData(array(
                    'id' => $id,
                    'data' => $rawInput['data'],
                    'category_id' => $rawInput['category_id'],
    ));
    $message->send();
});

// ADD a new password category
$router->addRoute('POST', '/password/category', $authCheck, function() use ($db, $message, $session, $rawInput) {
    $id = $db->addCategory($rawInput['data'], PwdremindAPI::PASSWORD, $session->getUserid());
    $message->setData(array(
                    'id' => $id,
                    'data' => $rawInput['data'],
    ));
    $message->send();
});


/**
 * PUT
 */

// UPDATE a password
$router->addRoute('PUT', '/password', $authCheck, function() use ($db, $message, $session, $rawInput) {
    $db->updateEntry($rawInput['id'], $rawInput['data'], PwdremindAPI::PASSWORD, $rawInput['category_id'], $session->getUserid());
    $message->setData(array(
                    'id' => $rawInput['id'],
                    'data' => $rawInput['data'],
                    'category_id' => $rawInput['category_id'],
    ));
    $message->send();
});

// UPDATE a password category
$router->addRoute('PUT', '/password/category', $authCheck, function() use ($db, $message, $session, $rawInput) {
    $db->updateCategory($rawInput['id'], $rawInput['data'], $session->getUserid());
    $message->setData(array(
                    'id' => $rawInput['id'],
                    'data' => $rawInput['data'],
                    'dataCount' => $rawInput['dataCount'],
    ));
    $message->send();
});


/**
 * DELETE
 */

// DELETE a password
$router->addRoute('DELETE', '/password', $authCheck, function() use ($db, $message, $session, $rawInput) {
    $db->deleteEntry($rawInput['id'], $session->getUserid());
    $message->setData(array(
                    'id' => $rawInput['id'],
    ));
    $message->send();
});

// DELETE a password category
$router->addRoute('DELETE', '/password/category', $authCheck, function() use ($db, $message, $session, $rawInput) {
    $db->deleteCategory($rawInput['id'], $session->getUserid());
    $message->setData(array(
                    'id' => $rawInput['id'],
    ));
    $message->send();
});
