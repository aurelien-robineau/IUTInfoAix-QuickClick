<?php
session_start();

if (isset($_SESSION['user_id'])) {

    require_once('database.php');

    try {
        $stmt = $dbh->prepare("UPDATE GAME SET SCORE = :score WHERE USER_ID = :userId AND GAME_ID = :gameId;
                                     UPDATE USER SET TOTAL_SCORE = TOTAL_SCORE + :score WHERE ID = :userId;
                                     UPDATE USER SET TOTAL_GAMES = TOTAL_GAMES + 1 WHERE ID = :userId");
        $stmt->execute([
            'score'  => $_POST['score'],
            'userId' => $_SESSION['user_id'],
            'gameId' => $_POST['game_id']
        ]);

        $stmt->closeCursor;

        $stmt = $dbh->prepare("SELECT BEST_SCORE FROM USER WHERE ID = :userId");
        $stmt->execute([
            'userId' => $_SESSION['user_id']
        ]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);

        $stmt->closeCursor;

        if($data['BEST_SCORE'] < $_POST['score']) {
            $stmt = $dbh->prepare("UPDATE USER SET BEST_SCORE = :score WHERE ID = :userId");
            $stmt->execute([
                'score'  => $_POST['score'],
                'userId' => $_SESSION['user_id']
            ]);
            $data = $stmt->fetch(PDO::FETCH_ASSOC);

            $stmt->closeCursor;
        }

        header('Cache-Control: no-cache, must-revalidate');
        header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
        header('Content-type: application/json');
    } catch (Exception $e) {
        echo json_encode(array(
            'success' => false,
            'message' => 'Erreur lors de la sauvegarde du score.'
        ));
        exit;
    }

    echo json_encode(array(
        'success' => true,
        'message' => 'Score sauvegardé.'
    ));
}
else {
    echo json_encode(array(
        'success' => false,
        'message' => 'Vous devez être connecté pour effectuer cette action.'
    ));
}