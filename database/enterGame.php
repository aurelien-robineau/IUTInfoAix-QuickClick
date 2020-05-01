<?php
session_start();

if (isset($_SESSION['user_id'])) {

    require_once('database.php');

    try {
        $stmt = $dbh->prepare("INSERT INTO `GAME` (`GAME_ID`, `USER_ID`) VALUES ((SELECT `GAME_ID` FROM `NEXT_GAME`), :userid)");
        $stmt->execute([
            'userid' => $_SESSION['user_id']
        ]);

        $stmt->closeCursor;

        $stmt = $dbh->prepare("SELECT `GAME_ID` FROM `NEXT_GAME`");
        $stmt->execute();
        $gameId = $stmt->fetch(PDO::FETCH_ASSOC)['GAME_ID'];

        $stmt->closeCursor;

        header('Cache-Control: no-cache, must-revalidate');
        header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
        header('Content-type: application/json');

    } catch (Exception $e) {
        echo json_encode(array(
            'success' => false,
            'message' => 'Erreur lors du lancement de la partie.'
        ));
        exit;
    }

    echo json_encode(array(
        'success' => true,
        'message' => 'Vous être entré dans la partie !',
        'game_id' => $gameId
    ));
}
else {
    echo json_encode(array(
        'success' => false,
        'message' => 'Vous devez être connecté pour effectuer cette action.'
    ));
}
