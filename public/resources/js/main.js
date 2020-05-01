(function () {
    "use strict";

    /**
     * Session user
     * @type {{
     * USERNAME: string|null,
     * ID: number|null,
     * BEST_SCORE: number|null,
     * AVG_SCORE: number|null,
     * NB_GAMES: number|null
     * }}
     */
    let sessionUser = {
        ID: null,
        USERNAME: null,
        BEST_SCORE: null,
        AVG_SCORE: null,
        NB_GAMES: null
    };

    // Initialize session user
    $.ajax({
        url: "../../php/getPlayerInfos.php",
        type: "post",
    }).done( function (player) {
        sessionUser = player;
    });

    $(document).ready( function () {
        $.ajax({
            url: '../../php/is_connected.php'
        }).done( function (data) {
            /* data content :
             * - success
             * - message
             */
            if (data.success === true) {
                onLogged();
            } else {
                createLoginCard($('#player-infos'));
                $('#login-card').hide().fadeIn(300);
                $('#login-form').submit(login);
            }

            fillTopPlayersArea();
        });
    });

    /**
     * Display the current best scores and there players
     */
    function fillTopPlayersArea() {
        $.ajax({
            url: '../../database/getBestPlayers.php',
            error: () => { errorMessage(!navigator.onLine ? "Pas de connexion internet." : "Erreur."); }
        }).done( function (data) {
            if (data.success === true) {
                console.log(data.message);

                const PLAYERS = data.players;

                $('#best-scores').append(
                    $('<div />').attr({
                        id: 'best-score-player',
                        class: 'col text-center'
                    }).append(
                        $('<p />')
                            .addClass('h4 white-text')
                            .html('Meilleur score'),
                    ),
                    $('<div />').attr({
                        id: 'best-avg-score-player',
                        class: 'col text-center'
                    }).append(
                        $('<p />')
                            .addClass('h4 white-text')
                            .html('Meilleur score moyen'),
                    ),
                );
                displayPlayer(PLAYERS.bestHighestScore, $('#best-score-player'));
                displayPlayer(PLAYERS.bestAvgScore, $('#best-avg-score-player'));
            }
            else {
                errorMessage(data.message);
            }
        });

        /**
         * Display an error message
         * @param msg {string} Message to display
         */
        function errorMessage ( msg ) {
            $('#best-scores').empty().append(
                $('<div />').addClass('col text-center').append(
                    $('<p />').addClass('red-text').html('&nbsp;' + msg).prepend(
                        $('<i />').addClass('fas fa-exclamation-circle red-text')
                    )
                )
            )
        } // errorMessage
    } // fillTopPlayersArea ()

    /**
     * Try to log the user in. Display error when log in fails.
     * @return {boolean}
     */
    function login() {
        $.ajax({
            url: "../../database/login.php",
            type: "post",
            data: $(this).serialize(),
            error: () => { errorMessage(!navigator.onLine ? "Pas de connexion internet." : "Erreur."); }
        }).done( function (response) {
            if(response.success === true) {
                console.log(response.message);
                window.location.reload(true);
            } else {
                errorMessage(response.message);
                $('#password').val("");
            }
        });
        return false;

        /**
         * Display an error message
         * @param msg {string} Message to display
         */
        function errorMessage ( msg ) {
            $('#login-form .error-msg').remove();
            $('#login-form p').after (
                $('<p \>').html(' ' + msg)
                    .addClass('text-center red-text error-msg m-0 p-0')
                    .prepend( $('<i />').addClass('fas fa-exclamation-circle') )
                    .hide()
                    .fadeIn(300)
            );
        } // errorMessage ()
    } // login ()

    /**
     * Append target with the login form. No event handled.
     * @param target {jQuery}
     */
    function createLoginCard ( target ) {
        target.append(
            $('<div />').attr({
                id: 'card-login',
                class: 'card ml-auto mr-auto mb-5'
            }).append(
                $('<div />').addClass('card-body elegant-color white-text').append(
                    $('<form />').attr({
                        id: 'login-form',
                    }).append(
                        $('<p />').addClass('h4 text-center py-4').html('Se connecter'),
                        $('<div />').addClass('md-form').append(
                            $('<i />').addClass('fa fa-user prefix grey-text'),
                            $('<input />').attr({
                                type: 'text',
                                id: 'username',
                                class: 'form-control',
                                name: 'username',
                                placeholder: 'Nom d\'utilisateur',
                                required: true
                            }).css({
                                color: 'white'
                            })
                        ),

                        $('<div />').addClass('md-form').append(
                            $('<i />').addClass('fa fa-lock prefix grey-text'),
                            $('<input />').attr({
                                type: 'password',
                                id: 'password',
                                class: 'form-control',
                                name: 'password',
                                placeholder: 'Mot de passe',
                                required: true
                            }).css({
                                color: 'white'
                            })
                        ),

                        $('<div />').addClass('text-center py-4 mt-3').append(
                            $('<button />').attr({
                                type: 'submit',
                                class: 'btn btn-green',
                            }).html('Connexion')
                        )
                    )
                )
            )
        )
    } // createLoginCard ()

    /**
     * Remove login card, display infos on the player and a logout button.
     */
    function onLogged () {
        $('#card-login').remove();

        let playerInfos = $('#player-infos');
        displayPlayer(sessionUser, playerInfos);
        playerInfos.addClass('text-center').prepend(
            $('<p />')
                .addClass('h5 white-text')
                .html('Connecté en tant que'),
        ).append(
            $('<button \>').html(' Jouer').prepend (
                $('<i />').addClass('fas fa-play fa-1x')
            ).attr({
                id: 'btn-play',
                class: 'btn btn-green w-100'
            }).click( waitingRoom.enter ),
            $('<br />'),
            $('<button \>').html(' Deconnexion').prepend (
                $('<i />').addClass('fas fa-sign-out-alt')
            ).addClass('btn btn-green w-100').click(logOut)
        ).hide().fadeIn(300);
    } // onLogged ()

    /**
     * Reset php $_SESSION variable and display login form
     */
    function logOut () {
        $.ajax({
            url: '../../php/logout.php',
            error: () => { errorMessage(!navigator.onLine ? "Pas de connexion internet." : "Erreur."); }
        }).done( function (data) {
            if(data.success === true) {
                console.log(data.message);
                window.location.reload(true);
            } else {
                errorMessage(data.message);
            }
        });

        /**
         * Display an error message
         * @param msg {string} Message to display
         */
        function errorMessage ( msg ) {
            $('.error-msg').remove();
            $('#player-infos').append(
                $('<p />').addClass('text-center red-text error-msg')
                    .html(msg)
                    .hide().fadeIn(200)
            )
        } // errorMessage ()
    } // logOut ()

    /**
     * Prepend the player infos to the target
     * @param player Player to display
     * @param target Element to append
     */
    function displayPlayer ( player , target ) {
        target.append(
            // Username
            $('<p \>')
                .addClass('username h1 green-text mb-0')
                .html(player.USERNAME),

            // Best score
            $('<i />').addClass('fas fa-crown yellow-text'),
            $('<p />')
                .addClass('best-score d-inline white-text')
                .html('&nbsp;' + player.BEST_SCORE),

            // Average score
            $('<i />').addClass('fas fa-globe white-text ml-3'),
            $('<p />')
                .addClass('avg-score d-inline white-text')
                .html('&nbsp;' + Math.round(player.AVG_SCORE * 100) / 100),

            // Number of games
            $('<i />').addClass('fas fa-chess-pawn white-text ml-3'),
            $('<p />')
                .addClass('nb-games d-inline white-text')
                .html('&nbsp;' + player.NB_GAMES)
        );
    } // displayPlayer ()
})();