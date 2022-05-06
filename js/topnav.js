
function topnav_resize() {
    const x = document.getElementById("topnav");
    if(x.className === "topnav") {
        x.className += " responsive";
    } else {
        x.className = "topnav";
    }
}
