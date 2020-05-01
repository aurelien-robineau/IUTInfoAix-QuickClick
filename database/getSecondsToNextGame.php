<?php
session_start();

if (isset($_SESSION['user_id'])) {

    require_once('database.php');

    $secondsToNextGame = null;

    try {
        $stmt = $dbh->prepare("SELECT TIME_TO_SEC(TIMEDIFF(BEGIN_DATE, CURRENT_TIMESTAMP)) AS SECONDS_TO_NEXT_GAME FROM NEXT_GAME");
        $stmt->execute();
        $secondsToNextGame = $stmt->fetch(PDO::FETCH_ASSOC)['SECONDS_TO_NEXT_GAME'];

        $stmt->closeCursor;

        header('Cache-Control: no-cache, must-revalidate');
        header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
        header('Content-type: application/json');
    } catch (Exception $e) {
        echo json_encode(array(
            'success' => false,
            'message' => 'Impossible de trouver la prochaine partie.'
        ));
        exit;
    }

    echo json_encode(array(
        'success'              => true,
        'message'              => 'Prochaine partie trouvée !',
        'seconds_to_next_game' => $secondsToNextGame
    ));
}
else {
    echo json_encode(array(
        'success' => false,
        'message' => 'Vous devez être connecté pour effectuer cette action.'
    ));
}