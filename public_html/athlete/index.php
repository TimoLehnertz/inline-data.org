<?php
include_once "../includes/error.php";
/**
 * Setup
 */
if(!isset($_GET["id"])){
    throwError($ERROR_NO_ID);
}
include_once "../api/index.php";
include_once "../api/imgAPI.php";

// $person = getAthlete($_GET["id"]);

// if(!$person){
//     throwError($ERROR_INVALID_ID);
// }

include_once "../header.php";

// echo "<script>const person = ". json_encode($person) ."; const id=".$_GET["id"]."</script>";
echo "<script>const id=".$_GET["id"]."</script>";
?>
<main class="main">
    
</main>
<script>
    get("athlete", id).receive((succsess, person) => {
        if(!succsess || person.length === 0) {
            window.location.href = "/index.php";
        }
        const profile = athleteToProfile(person, Profile.MAX);
        profile.appendTo($("main"));
    });
    // scoreCallbacks.push(() => {
    //     profile.grayOut = true;
        
    // });
</script>
<?php
include_once "../footer.php";
?>