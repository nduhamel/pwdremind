<?php

require_once('../php/database.php');
require_once('../php/srpsession.php');
require_once('../php/response.php');


define("SESSION_TIMEOUT", 300);

ini_set("log_errors" , "1");
ini_set("error_log" , "Errors.log.txt");
ini_set("display_errors" , "0");

$db = new Database('../test.db');
$session = new SrpSession();
$response = new Response();


if (isset($_GET['action'])){

	if ( $_GET['action'] == 'isloggedin') {

		if ($session->is_logged_in())
			$response->message("AUTHENTICATED");
		else
			$response->message("NOT_AUTHENTICATED");
	}
	elseif ( $session->is_logged_in() ){
		
		$response->setKey($session->getKhex());

		switch( $_GET['action'] ) {

			case 'logout':
			$session->logout();
			$response->message("LOGOUT");
			break;

			case 'ping':
			$response->message("OK");
			break;

			case 'add':
			$data = stripslashes($_GET['data']);
			$id = $db->store_entry($data, $session->get_username());
			$response->data($id);
			break;

			case 'remove':
			$id = $_GET['id'];
			$id = $db->delete_entry($id, $session->get_username());
			$response->data($id);
			break;

			case 'get':
			$entries = $db->get_entries($session->get_username());
			$response->data($entries);
			break;
		}
	}
	else {
		$response->error("NOT_AUTHENTICATED");
	}
}

$response->send();
