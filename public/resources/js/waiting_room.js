waitingRoom = function () {
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
     * All infos on the current waiting room
     * isActive : defines if player is currently looking for a game
     * searchFunction : id of the interval function used to search for players
     * roomPlayers : players in the same waiting room as current player
     * @type {{searchFunction: number, isActive: boolean, roomPlayers: Array}}
     */
    let waitingRoom = {
        isActive: false,
        searchFunction: -1,
        roomPlayers: [sessionUser],
    };

    /**
     * Reset waiting room to is original value
     */
    function resetWaitingRoom () {
        waitingRoom.isActive = false;
        waitingRoom.searchFunction = -1;
        waitingRoom.roomPlayers = [sessionUser];
    }

    /**
     * Display and animate the waiting room
     * Make current user search for players in database
     */
    function enterWaitingRoom () {
        waitingRoom.isActive = true;

        $('body').append(
            $('<div />').addClass('overlay')
        );

        createWaitingRoomCard($('.overlay'));

        $('#card-waiting-room').animate({
            height: '90%',
            marginTop: '2em'
        }, function () {
            // Always display current user in waiting room
            displayPlayer(sessionUser);
            createWaitingRoomSpinner($('#card-waiting-room .card-body'));

            // Make user enter waiting room in database
            $.ajax({
                url: "../../database/enterWaitingRoom.php",
                type: "post",
                error: () => {
                    displayWaitingRoomErrorMessage(!navigator.onLine ? "Pas de connexion internet." : "Erreur.");
                }
            }).done( function (data) {
                if (data.success === true) {
                    console.log(data.message);
                    lookForPlayers(1000);
                } else {
                    displayWaitingRoomErrorMessage(data.message);
                }
            }); // end ajax enter waiting room
        }); // end animate
    } // enterWaitingRoom ()

    /**
     * Append target with the html waiting room.
     * @param target {jQuery}
     */
    function createWaitingRoomCard ( target ) {
        target.append(
            $('<div />').attr({
                id: 'card-waiting-room',
                class: 'card ml-auto mr-auto mb-5'
            }).append(
                $('<div />').attr({
                    id: 'waiting-room-banner',
                    class: 'green'
                }).append(
                    $('<div />').addClass('row').append(
                        $('<div />').addClass('col text-center').append(
                            $('<p />').addClass('h3 white-text m-0 mt-2').html('Salle d\'attente')
                        ),
                        $('<div />').addClass('col text-center').append(
                            $('<button />').attr({
                                id: 'btn-leave',
                                class: 'btn btn-outline-light'
                            }).html(' Annuler').prepend(
                                $('<i />').addClass('fas fa-times')
                            ).click( exitWaitingRoom )
                        )
                    )
                ),
                $('<div />').addClass('card-body elegant-color p-3').append(
                    $('<div />').attr({
                        id: 'player-list'
                    })
                )
            )
        );
    } // createWaitingRoomCard ()

    /**
     * Look for players in waiting room at regular interval and display them
     * @param interval Time in milliseconds between executions
     */
    function lookForPlayers( interval ) {
        waitingRoom.searchFunction = window.setInterval(function(){
            $.ajax({
                url: "../../database/lookForPlayers.php",
                type: "post",
                error: () => {
                    displayWaitingRoomErrorMessage(!navigator.onLine ? "Pas de connexion internet." : "Erreur.");
                }
            }).done( function (dataPlayer) {
                if (dataPlayer.success === true) {
                    console.log(dataPlayer.message);

                    if($('#waiting-room-spinner').is(':hidden')) {
                        $("#waiting-room-error").remove();
                        $('#waiting-room-spinner').fadeIn(200);
                    }

                    // If no players in waiting room, empty it.
                    waitingRoom.roomPlayers = dataPlayer.players.length ? dataPlayer.players : [];
                    waitingRoom.roomPlayers.unshift(sessionUser);
                    displayPlayersInWaitingRoom();
                } else {
                    displayWaitingRoomErrorMessage(dataPlayer.message);
                }
            }); // end ajax look for players
        }, interval);
    } // lookForPlayers ()

    /**
     * Close the waiting room card and remove current user from waiting room in database
     */
    function exitWaitingRoom () {
        $.ajax({
            url: "../../database/exitWaitingRoom.php",
            type: "post",
        }).done( function (data) {
            if (data.success === true) {
                console.log(data.message);

                // Stop looking for players
                clearInterval(waitingRoom.searchFunction);
                resetWaitingRoom();

                // Prevent timer from executing callback
                $('#waiting-room-timer').stop();

                $('#card-waiting-room').animate({
                    height: '0px',
                    marginTop: '0px'
                }, function () {
                    $('.overlay').remove();
                });
            }
            else {
                displayWaitingRoomErrorMessage(data.message);
            }
        });
    } // exitWaitingRoom ()

    /**
     * Display an error message in the waiting room
     * @param msg {string} Message to display
     */
    function displayWaitingRoomErrorMessage ( msg ) {
        $('#waiting-room-spinner').fadeOut(200, function () {
            if(!$('#waiting-room-error').length) {
                $('#waiting-room-spinner-wrapper').append(
                    $('<div />').attr({
                        id: 'waiting-room-error'
                    }).append(
                        $('<i />').addClass('far fa-times-circle red-text fa-7x').hide().fadeIn(200),
                        $('#search-label').addClass('red-text').html(msg)
                    )
                );
            } else {
                $('#search-label').html(msg);
            }
        });
    } // displayWaitingRoomErrorMessage ()

    /**
     * Display a spinner in waiting room with the number of players to find to begin game
     * @param target
     */
    function createWaitingRoomSpinner ( target ) {
        const nbPlayerToFind = params.NB_PLAYER_MIN - waitingRoom.roomPlayers.length;
        target.append(
            $('<div />').attr({
                id: 'waiting-room-spinner-wrapper',
                class: 'w-100 text-center'
            }).append(
                $('<div />').attr({
                    id: 'waiting-room-spinner',
                    class: 'spinner-border green-text',
                    role: 'status'
                }).append(
                    $('<span />').addClass('sr-only').html('Loading...')
                ),
                $('<div />').addClass('w-100 white-text text-center mt-3').append(
                    $('<p />').attr({
                        id: 'search-label',
                        class: 'h5'
                    }).html('Recherche de ' + nbPlayerToFind + ' joueur' + (nbPlayerToFind > 1 ? 's' : '') + ' ...')
                )
            ).hide().fadeIn(200),
        )
    } // createWaitingRoomSpinner ()

    /**
     * Update spinner with the new number of players to find
     */
    function updateSpinnerMessage () {
        const nbPlayerToFind = params.NB_PLAYER_MIN - waitingRoom.roomPlayers.length;
        $('#search-label')
            .html('Recherche de ' + nbPlayerToFind + ' joueur' + (nbPlayerToFind > 1 ? 's' : '') + ' ...')
    } // updateSpinnerMessage ()

    /**
     * Display all the players currently looking for a game in the waiting room card
     */
    function displayPlayersInWaitingRoom () {
        // If not enough players to play then update waiting room, else display timer before game starts
        if (waitingRoom.roomPlayers.length < params.NB_PLAYER_MIN) {
            // Delete timer
            $('#waiting-room-timer').stop().remove();

            // Display spinner if not displayed, or update its message
            if(!$('#waiting-room-spinner-wrapper').length)
                createWaitingRoomSpinner($('#card-waiting-room .card-body'));
            else
                updateSpinnerMessage();

            updatePlayers();
        }
        else {
            // Display timer if not displayed
            if(!$('#waiting-room-timer').length) {
                $.ajax({
                    url: "../../database/getSecondsToNextGame.php",
                    type: "post",
                }).done( function (dataTime) {
                    if (dataTime.success === true) {
                        console.log(dataTime.message);

                        const msLeft = dataTime.seconds_to_next_game * 1000;
                        const pct = msLeft * 100 / params.MS_BEFORE_START;

                        createTimer($('#card-waiting-room .card-body'), pct, enterGame);
                    } else {
                        if(!$('#card-waiting-room .card-body .error-msg').length) {
                            $('#card-waiting-room .card-body').prepend(
                                $('<p />').addClass('error-msg text-center red-text').html(dataTime.message)
                            )
                        }
                    }
                });
            }

            // Delete spinner
            const spinner = $('#waiting-room-spinner-wrapper');
            if(spinner.length) {
                spinner.fadeOut(200, function () {
                    $(this).remove();
                    updatePlayers();
                });
            } else {
                updatePlayers();
            }
        }

        /**
         * Make user enter game in database and leave waiting room, then launch the game.
         */
        function enterGame() {
            $.ajax({
                url: "../../database/enterGame.php",
                type: "post",
                error: () => {
                    const msg = !navigator.onLine ? "Pas de connexion internet." : "Erreur.";
                    $('#waiting-room-timer').after(
                        $('<p />').addClass('text-center red-text').html(msg)
                    ).remove();
                }
            }).done( function (dataGame) {
                if(dataGame.success === true) {
                    console.log(dataGame.message);

                    // Wait for others players in waiting room for 1.5 sec
                    setTimeout( function () {
                        $.ajax({
                            url: "../../database/exitWaitingRoom.php",
                            type: "post",
                            error: () => {
                                displayWaitingRoomErrorMessage(
                                    !navigator.onLine ? "Pas de connexion internet." : "Erreur."
                                );
                            }
                        }).done( function (data) {
                            if(data.success === true) {
                                clearInterval(waitingRoom.searchFunction);
                                $('.overlay').remove();
                                game.launch(dataGame.game_id);
                            }
                            else {
                                displayWaitingRoomErrorMessage(data.message)
                            }
                        }); // end ajax exit waiting room
                    }, 1500)
                }
                else {
                    $('#waiting-room-timer').after(
                        $('<p />').addClass('text-center red-text').html(dataGame.message)
                    ).remove();
                }
            });
        } // enterGame ()

        /**
         * Update the displayed players in waiting room
         * Delete players who left and display new players
         */
        function updatePlayers() {
            // Delete old players
            $('.player-div').each( function () {
                let toDelete = true;

                // Test if div's user is in the room players
                for (let player of waitingRoom.roomPlayers) {
                    if (player.ID === $(this).attr('data-player-id')) {
                        toDelete = false;
                        break;
                    }
                }

                // Delete div if to delete
                if(toDelete)
                    $(this).remove();
            });

            // Display new players
            for (let player of waitingRoom.roomPlayers) {
                // If user has not been displayed yet
                if(!$('#player-' + player.ID).length) {
                    // Display it
                    displayPlayer(player);
                }
            }
        } // updatePlayers ()

        /**
         * Display the timer showing when the game starts
         * @param target {jQuery} Timer will be prepended to the target
         * @param pct {number} Percentage left of the timer
         * @param callback {function|null} Function to call at the end of the timer animation
         */
        function createTimer ( target, pct, callback = null ) {
            const timerWidth = (pct * target.width()) / 100;

            target.prepend(
                $('<div />').attr({
                    id: 'waiting-room-timer',
                    class: 'green mt-2'
                }).css({width: timerWidth + "px"}).hide().fadeIn(200, function () {
                    $(this).animate({
                        width: '0px'
                    }, {
                        duration: params.MS_BEFORE_START * (pct / 100),
                        easing: 'linear',
                        complete() {
                            if (callback !== null) {
                                callback();
                            }
                        }
                    });
                })
            );
        } // createTimer ()
    } // displayPlayersInWaitingRoom ()

    /**
     * Display a player in waiting room
     * @param player
     */
    function displayPlayer ( player ) {
        const color = player.ID === sessionUser.ID ? 'orange-text' : 'white-text';

        $('#player-list').append(
            $('<div />').attr({
                id: 'player-' + player.ID,
                class: 'player-div ml-auto mr-auto p-3 mt-3 elegant-color-dark ' + color,
                'data-player-id': player.ID
            }).html(player.USERNAME).hide().fadeIn(300)
        )
    } // displayPlayer ()

    return {
        enter: enterWaitingRoom
    }
}();