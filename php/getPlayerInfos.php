<?php
session_start();

header('Cache-Control: no-cache, must-revalidate');
header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
header('Content-type: application/json');

echo json_encode(array(
    'ID'         => $_SESSION['user_id'],
    'USERNAME'   => $_SESSION['username'],
    'BEST_SCORE' => $_SESSION['best_score'],
    'AVG_SCORE'  => $_SESSION['avg_score'],
    'NB_GAMES'   => $_SESSION['nb_games']
));
