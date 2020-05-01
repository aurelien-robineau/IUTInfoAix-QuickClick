<?php
session_start();

if (isset($_SESSION['user_id'])) {

    require_once('database.php');

    $players = [];

    try {
        $stmt = $dbh->prepare("SELECT GAME.SCORE, USER.ID, USER.USERNAME, USER.BEST_SCORE, USER.TOTAL_SCORE, USER.TOTAL_GAMES FROM GAME JOIN USER ON GAME.USER_ID = USER.ID WHERE GAME.GAME_ID = :gameId ORDER BY SCORE DESC");
        $stmt->execute([
            'gameId' => $_POST['game_id']
        ]);
        while($data = $stmt->fetch(PDO::FETCH_ASSOC))
        {
            array_push($players, $data);
        }

        $stmt->closeCursor;

        header('Cache-Control: no-cache, must-revalidate');
        header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
        header('Content-type: application/json');

    } catch (Exception $e) {
        echo json_encode(array(
            'success' => false,
            'message' => 'Erreur lors de l\'obtention des scores des joueurs.'
        ));
        exit;
    }

    echo json_encode(array(
        'success' => true,
        'message' => 'Scores des joueurs obtenus.',
        'players'  => $players
    ));
}
else {
    echo json_encode(array(
        'success' => false,
        'message' => 'Vous devez être connecté pour effectuer cette action.'
    ));
}