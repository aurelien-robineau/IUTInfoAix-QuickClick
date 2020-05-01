game = function () {
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

    /**
     * ID in database of the current game
     * @type {number|null}
     */
    let GAME_ID = null;

    function launchGame (gameId) {
        GAME_ID = gameId;
        createGame();
        countDown(3, 4000, startGame);
    } // launchGame

    /**
     * Empty body and create game html elements
     */
    function createGame () {
        $('#home').hide();
        $('body').append(
            $('<div />').attr({
                id: 'game'
            }).append(
                $('<div />').attr({
                    id: 'game-infos',
                    class: 'green'
                }).append(
                    $('<div />').addClass('row w-100 pt-3 pb-3').append(
                        $('<div />').addClass('col').append(
                            $('<div />').addClass('text-center').append(
                                $('<i />').attr({
                                    id: 'seconds-left-clock',
                                    class: 'fas fa-clock fa-2x white-text'
                                }),
                                '&nbsp;',
                                $('<p />').attr({
                                    id: 'seconds-left',
                                    class: 'h3 white-text d-inline mb-0'
                                }).html(params.GAME_DURATION + '.0')
                            ),
                        ),
                        $('<div />').addClass('col').append(
                            $('<p />').attr({
                                id: 'nb-clicks',
                                class: 'h3 white-text text-center mb-0'
                            }).html('Score&nbsp;:&nbsp;0')
                        )
                    )
                ).hide().fadeIn(200),
                $('<div />').attr({
                    id: 'click-zone',
                    class: 'green ml-auto mr-auto mb-3'
                }).css({
                    height: '85%',
                    width: '100%',
                }).animate({
                    height: '70vh',
                    width: '70vw',
                    marginTop: '11vh',
                })
            )
        );
    } // createGame ()

    /**
     * Execute and display a count down
     * @param start {number} Start number
     * @param duration {number} Duration in milliseconds of the countdown
     * @param callback {function} Function to execute at the end of the count down
     */
    function countDown ( start, duration, callback = null) {
        const timeBetweenNumbers = duration / start;
        const fadeInDuration = timeBetweenNumbers / 5;
        const fadeOutDuration = (timeBetweenNumbers / 5) * 4;
        let   nbLeft = start;

        const countDown = setInterval( function () {
            if(nbLeft === 0) {
                clearInterval(countDown);
                if (callback !== null) callback();
            } else {
                displayNumber(nbLeft);
                nbLeft--;
            }
        }, timeBetweenNumbers);

        /**
         * Make a number fade in and fade out on the click zone
         * @param number {number} number to display
         */
        function displayNumber( number ) {
            $('.count-down-number').remove();
            $('#click-zone').append(
                $('<p />')
                    .addClass('count-down-number text-center white-text')
                    .css({
                        fontSize: '8em',
                        fontWeight: '900',
                        paddingTop: '15%'
                    })
                    .html(number.toString())
                    .hide()
                    .fadeIn(fadeInDuration, function () {
                        $(this).fadeOut(fadeOutDuration)
                    })
            );
        } // displayNumber ()
    } // countDown ()

    /**
     * Start game
     * Count the number of clicks on the click zone during game duration
     * Handle all visual effects
     */
    function startGame () {
        let counter = params.GAME_DURATION;

        // Display a count down of the game duration
        const countDown = setInterval( function () {
            if(counter <= 0) {
                clearInterval(countDown);
                $('#seconds-left, #seconds-left-clock')
                    .removeClass('white-text')
                    .addClass('red-text');
                $('#seconds-left')
                    .removeClass('white-text')
                    .addClass('red-text');
            } else {
                counter -= 0.1;
                // Round counter to correct floating point precision
                counter = Number((counter).toFixed(1));
                $('#seconds-left').html(Number.isInteger(counter) ? counter + '.0' : counter);
            }
        }, 100);

        // Count user's number of clicks
        let clickCounter = 0;
        $('#click-zone').click( function () {
            // Make click zone flash
            $(this).animate({
                opacity: '0.5'
            }, 10, function () {
                $(this).animate({
                    opacity: '1'
                }, 10)
            });

            clickCounter += 1;
            $('#nb-clicks').html('Score&nbsp;:&nbsp;' + clickCounter);
        });

        // Stop game when game duration is over
        setTimeout(function() {
            endGame(clickCounter);
        }, params.GAME_DURATION * 1000);
    } // startGame ()

    /**
     * End the game
     * @param clickCounter {number} Number of clicks of the user
     */
    function endGame (clickCounter) {
        $('#click-zone').off();
        $.ajax({
            url: "../../database/saveScore.php",
            type: "post",
            data: {
                score: clickCounter,
                game_id: GAME_ID
            },
            error: function () {
                displayEndGameCardErrorMessage(!navigator.onLine ? "Pas de connexion internet." : "Erreur.");
            }
        }).done( function (data) {
            // Wait for all players to finish during 2 sec
            setTimeout( function () {
                $('#game').remove();
                $('#home').fadeIn(300);

                $('body').append(
                    $('<div />').addClass('overlay')
                );

                createEndGameCard($('.overlay'));

                if (data.success === true) {
                    console.log(data.message);

                    $.ajax({
                        url: "../../database/getScores.php",
                        type: "post",
                        data:{
                            game_id: GAME_ID
                        },
                        error: function () {
                            displayEndGameCardErrorMessage(
                                !navigator.onLine ? "Pas de connexion internet." : "Erreur."
                            );
                        }
                    }).done( function (dataScores) {
                        if (dataScores.success === true) {
                            console.log(dataScores.message);

                            for (let player of dataScores.players) {
                                displayPlayer(player);
                            }
                        }
                        else {
                            displayEndGameCardErrorMessage(dataScores.message);
                        }
                    });

                    updateBestPlayers();
                    updateSessionUser();
                }
                else {
                    displayEndGameCardErrorMessage(data.message);
                }
            }, 2000)
        });
    } // endGame()

    /**
     * Create a card to display player scores and rank
     * @param target
     */
    function createEndGameCard ( target ) {
        target.append(
            $('<div />').attr({
                id: 'card-end-game',
                class: 'card ml-auto mr-auto mb-5'
            }).append(
                $('<div />').attr({
                    id: 'end-game-banner',
                    class: 'green'
                }).append(
                    $('<div />').addClass('row').append(
                        $('<div />').addClass('col text-center').append(
                            $('<p />')
                                .addClass('h3 white-text m-0 mt-2')
                                .html('Résultats')
                        ),
                        $('<div />').addClass('col text-center').append(
                            $('<button />')
                                .addClass('btn btn-outline-light')
                                .html(' Fermer')
                                .prepend(
                                    $('<i />').addClass('fas fa-times')
                            ).click( function () {
                                $('#card-end-game').animate({
                                    height: '0px',
                                    marginTop: '0px'
                                }, function () {
                                    $('.overlay').remove();
                                });
                            })
                        )
                    )
                ),
                $('<div />').addClass('card-body elegant-color p-3').append(
                    $('<div />').attr({
                        id: 'player-list'
                    })
                )
            ).animate({
                height: '90%',
                marginTop: '2em'
            }, function () {
                //displayPlayer(sessionUser);
            })
        );
    } // createEndGameCard ()

    /**
     * Display a player in the result card
     * @param player
     */
    function displayPlayer ( player ) {
        const color = player.ID === sessionUser.ID ? 'orange-text' : 'white-text';
        const score = player.SCORE === null ? '?' : player.SCORE;
        const bestScore = player.BEST_SCORE === null ? '?' : player.BEST_SCORE;

        $('#player-list').append(
            $('<div />').attr({
                id: 'player-' + player.ID,
                class: 'player-div ml-auto mr-auto p-3 mt-3 elegant-color-dark ' + color,
                'data-player-id': player.ID
            }).append(
                $('<p />').addClass('h4 d-inline').html(score + '&nbsp;'),
                $('<p />').addClass('d-inline').html(player.USERNAME),
                $('<p />').addClass('float-right ml-3')
                    .html('&nbsp;' + player.TOTAL_GAMES)
                    .prepend( $('<i />').addClass('fas fa-chess-pawn') ),
                $('<p />').addClass('float-right ml-3')
                    .html('&nbsp;' + bestScore)
                    .prepend( $('<i />').addClass('fas fa-crown yellow-text') ),
                $('<p />').addClass('float-right')
                    .html('&nbsp;' + Math.round(player.TOTAL_SCORE / player.TOTAL_GAMES * 100) / 100)
                    .prepend( $('<i />').addClass('fas fa-globe') ),
            ).hide().fadeIn(300)
        )
    } // displayPlayer ()

    /**
     * Update best scores of the game on home page
     */
    function updateBestPlayers () {
        $.ajax({
            url: '../../database/getBestPlayers.php',
            error: function () {
                errorMessage(!navigator.onLine ? "Pas de connexion internet." : "Erreur.");
            }
        }).done( function (data) {
            if (data.success === true) {
                console.log(data.message);

                const PLAYERS = data.players;

                $('#best-score-player p.username')
                    .html('&nbsp;' + PLAYERS.bestHighestScore.USERNAME);
                $('#best-score-player p.best-score')
                    .html('&nbsp;' + PLAYERS.bestHighestScore.BEST_SCORE);
                $('#best-score-player p.avg-score')
                    .html('&nbsp;' + Math.round(PLAYERS.bestHighestScore.AVG_SCORE * 100) / 100);
                $('#best-score-player p.nb-games')
                    .html('&nbsp;' + PLAYERS.bestHighestScore.NB_GAMES);

                $('#best-avg-score-player p.username')
                    .html('&nbsp;' + PLAYERS.bestAvgScore.USERNAME);
                $('#best-avg-score-player p.best-score')
                    .html('&nbsp;' + PLAYERS.bestAvgScore.BEST_SCORE);
                $('#best-avg-score-player p.avg-score')
                    .html('&nbsp;' + Math.round(PLAYERS.bestAvgScore.AVG_SCORE * 100) / 100);
                $('#best-avg-score-player p.nb-games')
                    .html('&nbsp;' + PLAYERS.bestAvgScore.NB_GAMES);
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
                    $('<p />')
                        .addClass('red-text')
                        .html('&nbsp;' + msg)
                        .prepend(
                        $('<i />').addClass('fas fa-exclamation-circle red-text')
                    )
                )
            )
        } // errorMessage ()
    } // updateBestPlayers ()

    /**
     * Update infos of session user
     */
    function updateSessionUser () {
        $.ajax({
            url: '../../database/updateSession.php',
            error: function () {
                console.error(!navigator.onLine ? "Pas de connexion internet." : "Erreur.");
            }
        }).done( function (data) {
            if (data.success === true) {
                console.log(data.message);

                // Update session user
                $.ajax({
                    url: "../../php/getPlayerInfos.php",
                    type: "post",
                }).done( function (player) {
                    sessionUser = player;

                    $('#player-infos p.username')
                        .html('&nbsp;' + sessionUser.USERNAME);
                    $('#player-infos p.best-score')
                        .html('&nbsp;' + sessionUser.BEST_SCORE);
                    $('#player-infos p.avg-score')
                        .html('&nbsp;' + Math.round(sessionUser.AVG_SCORE * 100) / 100);
                    $('#player-infos p.nb-games')
                        .html('&nbsp;' + sessionUser.NB_GAMES);
                });
            }
            else {
                console.error(data.message);
            }
        });
    } // updateSessionUser ()

    /**
     * Display an error message in the game end card
     * @param msg {string} Message to display
     */
    function displayEndGameCardErrorMessage ( msg ) {
        $('#card-end-game .card-body').append(
            $('<div />').addClass('m-auto text-center red-text').append(
                $('<i />').addClass('far fa-times-circle fa-7x').hide().fadeIn(200),
                $('<p />').html(msg)
            )
        )
    } // displayEndGameCardErrorMessage ()

    return {
        launch: launchGame
    };
}();