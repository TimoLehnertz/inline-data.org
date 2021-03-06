<?php

include_once "api/userAPI.php";

if(!isLoggedIn()){
    tryRememberMeLogin();
}


include_once "includes/error.php";
include_once "api/userAPI.php";
include_once "includes/roles.php";
include_once "includes/preview.php";
$loggedIn = isLoggedIn();//
$user;
if($loggedIn){
    $user = getUser($_SESSION["iduser"]);
}
$actual_link = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";
?>

<html>
    <head>
        <meta charset="UTF-8">
        
        <title>Roller Results</title>
        <meta name="description" content="Roller skating results and analysis">

        <meta property="og:image" content="<?php echo getPreview();?>">

        <meta property="og:title" content="Roller Results" />
        <meta property="og:url" content="<?=$actual_link?>" />
        <meta property="og:description" content="Roller skating results and analysis">
        <meta property="og:type" content="profile" />

        <link rel="icon" type="image/png" href="/img/logo.PNG">
        <link rel="stylesheet" href="/styles/main.css">
        <!-- GOOGLE fonts -->
        <link rel="preconnect" href="https://fonts.gstatic.com">
        <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,200;0,300;0,400;0,500;0,600;1,200;1,400;1,500;1,600&display=swap" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap" rel="stylesheet">

        <!-- Jquery -->
        <script src="/js/jquery-3.5.1.js"></script>

        <!-- Anime -->
        <script src="/js/anime.min.js"></script>

        <!-- Font Awesome -->
        <script src="https://kit.fontawesome.com/bb5d468397.js" crossorigin="anonymous"></script>

        <!-- chart.js -->
        <script src="https://cdn.jsdelivr.net/npm/chart.js@2.9.4/dist/Chart.bundle.js"></script>

        <script src="/js/ajaxAPI.js"></script>
        <script src="/js/lib.js"></script>
        <script src="/js/ui.js"></script>
        <script src="/js/interface.js"></script>
        <script src="/js/html2canvas/html2canvas.js" defer></script>
        <script>
            <?php echo "const phpUId = '".uniqid($_SERVER["SERVER_NAME"], true)."';";?>
            </script>
        <script src="/js/log.js"></script>

        <meta name="viewport" content='width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0'>
    </head>