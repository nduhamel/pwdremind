<?php

/*
 * HISTORY
 ***************/

/**
 * POST
 */

 $router->addRoute('POST', '/history', $authCheck, function() use ($db, $message, $session, $rawInput) {
    $timestamp = time();
    $id = $db->addHistory($rawInput['data'], $timestamp, $session->getUserid());
    $message->setData(array(
                    'id' => $id,
                    'data' => $rawInput['data'],
                    'timestamp' => $timestamp
    ));
    $message->send();
 });


/**
 * PUT
 */

 $router->addRoute('PUT', '/history', $authCheck, function() use ($db, $message, $session, $rawInput) {
    $db->updateHistory($rawInput['id'], $rawInput['data'], $session->getUserid());
    $message->setData(array(
                    'id' => $rawInput['id'],
                    'data' => $rawInput['data'],
    ));
    $message->send();
 });

/**
 * GET
 */

 $router->addRoute('GET', '/history', $authCheck, function() use ($db, $message, $session, $rawInput) {
    $entries = $db->getHistory($session->getUserid());
    $message->setData($entries);
    $message->send();
 });

 /**
 * DELETE
 */

 $router->addRoute('DELETE', '/history/:id', $authCheck, function($id) use ($db, $message, $session, $rawInput) {
    $db->removeHistory($id, $session->getUserid());
    $message->setData(array(
                    'id' => $id,
    ));
    $message->send();
 });