<?php

session_start();

$return = new stdClass();
$return->success = false;

if (isset($_SESSION['user_id'])) {
    $return->success = true;
}

header('Cache-Control: no-cache, must-revalidate');
header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
header('Content-type: application/json');

echo json_encode($return);