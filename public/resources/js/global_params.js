params = function () {
    "use strict";

    return {
        /// /!\ IMPORTANT /!\ To change MS_BEFORE_START, you also have to change it into the lookForPlayers.php file
        MS_BEFORE_START: 8000,
        /// /!\ IMPORTANT /!\ To change NB_PLAYER_MIN, you also have to change it into the lookForPlayers.php file and in database trigger "delete_begin_date"
        NB_PLAYER_MIN: 2,
        GAME_DURATION: 5,
    }
}();