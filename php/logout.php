<?php
/**
 * Code from http://www.php.net/manual/en/function.session-destroy.php
 */

session_start();

try {
    // Unset all of the session variables.
    $_SESSION = array();

    // If it's desired to kill the session, also delete the session cookie.
    // Note: This will destroy the session, and not just the session data!
    if (ini_get("session.use_cookies")) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $params["path"], $params["domain"],
            $params["secure"], $params["httponly"]
        );
    }

    // Finally, destroy the session.
    session_destroy();

    header('Cache-Control: no-cache, must-revalidate');
    header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
    header('Content-type: application/json');
} catch (Exception $e) {
    echo json_encode(array(
        'success' => false,
        'message' => 'La déconnexion a échoué.'
    ));
    exit;
}

echo json_encode(array(
    'success' => true,
    'message' => 'Déconnexion réussie.'
));