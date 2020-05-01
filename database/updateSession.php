<?php
session_start();

if (isset($_SESSION['user_id'])) {

    require_once('database.php');

    $stmt = $dbh->prepare("SELECT BEST_SCORE, TOTAL_SCORE/TOTAL_GAMES AVG_SCORE, TOTAL_GAMES
                                     FROM `USER`
                                     WHERE USERNAME = :username");
    $stmt->execute([
        'username' => $_SESSION['username'],
    ]);

    $data = $stmt->fetch(PDO::FETCH_ASSOC);

    header('Cache-Control: no-cache, must-revalidate');
    header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
    header('Content-type: application/json');

    if($data) {
        $_SESSION['best_score'] = $data['BEST_SCORE'];
        $_SESSION['avg_score']  = $data['AVG_SCORE'];
        $_SESSION['nb_games']   = $data['TOTAL_GAMES'];

        echo json_encode(array(
            'success' => true,
            'message' => 'Données du joueur mises à jour.'
        ));
    } else {
        echo json_encode(array(
            'success' => false,
            'message' => 'Impossible de mettre à jour les données du joueur.'
        ));
    }
}
else {
    echo json_encode(array(
        'success' => false,
        'message' => 'Vous devez être connecté pour effectuer cette action.'
    ));
}