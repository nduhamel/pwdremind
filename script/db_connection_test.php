<?php
require_once('../config.php');

try {
  $db = new PDO(PDO_DSN, PDO_USER, PDO_PASSWORD);
  echo 'Connection succeeded';
} catch (PDOException $e) {
  echo 'Connection failed : ' . $e->getMessage();
}