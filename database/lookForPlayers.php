<?php
session_start();

require_once('database.php');

/// /!\ IMPORTANT /!\ To change NB_PLAYER_MIN, you also have to change it into the global_params.js file and in database trigger "delete_begin_date"
const NB_PLAYER_MIN = 2;

/// /!\ IMPORTANT /!\ To change MS_BEFORE_START, you also have to change it into the global_params.js file
const MS_BEFORE_START = 8000;

$players = [];

try {
    $stmt = $dbh->prepare("UPDATE WAITING_ROOM SET LAST_QUERY_DATE = CURRENT_TIMESTAMP WHERE USERID = :userid;
                          DELETE FROM WAITING_ROOM WHERE (CURRENT_TIMESTAMP - LAST_QUERY_DATE) > 2;");
    $stmt->execute([
        'userid' => $_SESSION['user_id']
    ]);

    $stmt = $dbh->prepare("SELECT ID, USERNAME FROM USER WHERE ID IN (SELECT USERID FROM WAITING_ROOM WHERE USERID != :userid)");
    $stmt->execute([
        'userid' => $_SESSION['user_id']
    ]);

    while($data = $stmt->fetch(PDO::FETCH_ASSOC))
    {
        array_push($players, $data);
    }

    // Remove 1 to the minimal number of player because current user is not listed in results
    if(count($players) >= NB_PLAYER_MIN - 1) {
        $stmt = $dbh->prepare("SELECT COUNT(BEGIN_DATE) FROM NEXT_GAME");
        $stmt->execute();
        $data = $stmt->fetch(PDO::FETCH_ASSOC);

        if($data['COUNT(BEGIN_DATE)'] == 0) {
            $stmt = $dbh->prepare("INSERT INTO `NEXT_GAME` (`BEGIN_DATE`) VALUES (CURRENT_TIMESTAMP + :sec_before_start)");
            $stmt->execute([
                'sec_before_start' => MS_BEFORE_START / 1000
            ]);
        }
    }

    $stmt->closeCursor;

    header('Cache-Control: no-cache, must-revalidate');
    header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
    header('Content-type: application/json');

} catch (Exception $e) {
    echo json_encode(array(
        'success' => false,
        'message' => 'Erreur lors de la recherche de joueurs.'
    ));
    exit;
}

echo json_encode(array(
    'success' => true,
    'message' => 'Recherche de joueurs effectuée.',
    'players'   => $players
));
