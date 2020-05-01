<?php
try {
    $dbh = new PDO('mysql:host=mysql-aure-rob.alwaysdata.net;dbname=aure-rob_bd', 'aure-rob', 'unmdp');
} catch (Exception $e) {
    $_SESSION['error'] = $e->getCode() . " : " . $e->getMessage();
    header('Location: index.php');
}