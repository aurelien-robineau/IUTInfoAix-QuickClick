<html lang="fr">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
        <meta http-equiv="x-ua-compatible" content="ie=edge">
        
        <title>QUICK CLICK</title>
        <link rel="icon" href="favicon.ico" />

        <!-- Font Awesome -->
        <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.7.0/css/all.css">
        <!-- Bootstrap core CSS -->
        <link href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.3.1/css/bootstrap.min.css" rel="stylesheet">
        <!-- Material Design Bootstrap -->
        <link href="https://cdnjs.cloudflare.com/ajax/libs/mdbootstrap/4.7.4/css/mdb.min.css" rel="stylesheet">

        <!-- Custom css -->
        <link rel="stylesheet" type="text/css" href="public/resources/css/global.css">
        <link rel="stylesheet" type="text/css" href="public/resources/css/home.css">
        <link rel="stylesheet" type="text/css" href="public/resources/css/waiting_room.css">
        <link rel="stylesheet" type="text/css" href="public/resources/css/game.css">

        <!-- jQuery -->
        <script src="https://code.jquery.com/jquery-3.3.1.min.js"></script>

        <!-- Custom javascript -->
        <script type="text/javascript" src="public/resources/js/main.js"></script>
        <script type="text/javascript" src="public/resources/js/game.js"></script>
        <script type="text/javascript" src="public/resources/js/global_params.js"></script>
        <script type="text/javascript" src="public/resources/js/waiting_room.js"></script>
    </head>

    <body class="elegant-color-dark">
        <div id="home" class="container">
            <div class="text-center mt-5" id="home-title">
                <h3 class="h3 text-white m-0">Aurélien ROBINEAU</h3>
                <h1 id="title" class="green-text">QUICK CLICK</h1>
            </div>

            <div class="row m-auto" id="home-content">
                <div class="col text-justify white-text" id="gamerules">
                    <p>Bienvenue sur Quick Click ! Connectez vous pour jouer.
                        D'abord, entrez dans la salle d'attente afin que l'on trouve des joueurs avec qui jouer.
                        Quand nous aurons trouvé des joueurs, la partie se lancera. Après le décompte, vous avez 5
                        secondes pour cliquer le plus de fois possible sur la zone verte. Prêt ? Partez !
                    </p>
                </div>
                <div class="col" id="player-infos"></div>
            </div>

            <div id="best-scores" class="row mt-3 ml-auto mr-auto"></div>
        </div>
    </body>
</html>
