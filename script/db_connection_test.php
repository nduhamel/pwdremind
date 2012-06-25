<?php
	require_once('../config.php');

	try {
		$db = new PDO(PDO_DSN, PDO_USER, PDO_PASSWORD);
		fwrite(STDOUT,"Connection succeeded! \n");
	} catch (PDOException $e) {
		fwrite(STDOUT,"Connection failed : ". $e->getMessage() ."\n");
	}