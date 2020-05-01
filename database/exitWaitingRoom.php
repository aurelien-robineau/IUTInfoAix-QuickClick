<?php
session_start();

if (isset($_SESSION['user_id'])) {

    require_once('database.php');

    try {
        $stmt = $dbh->prepare("DELETE FROM `WAITING_ROOM` WHERE USERID = :userid");
        $stmt->execute([
            'userid' => $_SESSION['user_id']
        ]);

        $stmt->closeCursor;

        header('Cache-Control: no-cache, must-revalidate');
        header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
        header('Content-type: application/json');

    } catch (Exception $e) {
        echo json_encode(array(
            'success' => false,
            'message' => 'Une erreur est survenue en quittant la salle d\'attente.'
        ));
        exit;
    }

    echo json_encode(array(
        'success' => true,
        'message' => 'Vous avez bien quitté la salle d\'attente.'
    ));
}
else {
    echo json_encode(array(
        'success' => false,
        'message' => 'Vous devez être connecté pour effectuer cette action.'
    ));
}