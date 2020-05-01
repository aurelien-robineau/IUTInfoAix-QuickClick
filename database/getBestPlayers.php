<?php
session_start();

require_once('database.php');

$players = [];

try {
    $stmt = $dbh->prepare("SELECT U.USERNAME USERNAME, U.BEST_SCORE BEST_SCORE, U.TOTAL_SCORE/U.TOTAL_GAMES AVG_SCORE, U.TOTAL_GAMES NB_GAMES FROM `USER` U,
                                    (SELECT MAX(BEST_SCORE) `VALUE` FROM `USER`) MAX_SCORE
                                      WHERE U.BEST_SCORE = MAX_SCORE.VALUE");
    $stmt->execute();
    $data = $stmt->fetch(PDO::FETCH_ASSOC);
    $players['bestHighestScore'] = $data;
    $stmt->closeCursor;

    $stmt = $dbh->prepare("SELECT U.USERNAME USERNAME, U.TOTAL_SCORE/U.TOTAL_GAMES AVG_SCORE , U.BEST_SCORE BEST_SCORE, U.TOTAL_GAMES NB_GAMES FROM `USER` U,
                                    (SELECT MAX(TOTAL_SCORE/TOTAL_GAMES) `VALUE` FROM `USER`) MAX_SCORE
                                      WHERE ROUND(U.TOTAL_SCORE/U.TOTAL_GAMES, 4) = ROUND(MAX_SCORE.VALUE, 4)");
    $stmt->execute();
    $data = $stmt->fetch(PDO::FETCH_ASSOC);
    $players['bestAvgScore'] = $data;
    $stmt->closeCursor;

    header('Cache-Control: no-cache, must-revalidate');
    header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
    header('Content-type: application/json');

} catch (Exception $e) {
    echo json_encode(array(
        'success' => false,
        'message' => 'Impossible d\'afficher les meilleurs joueurs.'
    ));
    exit;
}

echo json_encode(array(
    'success' => true,
    'message' => 'Meilleurs joueurs trouvés !',
    'players'  => $players
));