<?php
    session_start();

    require_once('database.php');

    $username = $_POST['username'];
    $password = md5($_POST['password']);

    $stmt = $dbh->prepare("SELECT ID, BEST_SCORE, TOTAL_SCORE/TOTAL_GAMES AVG_SCORE, TOTAL_GAMES
                                     FROM `USER`
                                     WHERE USERNAME = :username AND PASSWORD = :password");
    $stmt->execute([
        'username' => $username,
        'password' => $password
    ]);

    $data = $stmt->fetch(PDO::FETCH_ASSOC);

    header('Cache-Control: no-cache, must-revalidate');
    header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
    header('Content-type: application/json');

    if($data) {
        $_SESSION['user_id']    = $data['ID'];
        $_SESSION['username']   = $username;
        $_SESSION['best_score'] = $data['BEST_SCORE'];
        $_SESSION['avg_score']  = $data['AVG_SCORE'];
        $_SESSION['nb_games']   = $data['TOTAL_GAMES'];

        echo json_encode(array(
            'success' => true,
            'message' => 'Bienvenue !'
        ));
    } else {
        echo json_encode(array(
            'success' => false,
            'message' => 'Identifiant ou mot de passe incorrect.'
        ));
    }
