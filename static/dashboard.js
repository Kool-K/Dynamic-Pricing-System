document.getElementById("showInventory").addEventListener("click", function() {
    window.location.href = "/inventory";
});

function logout() {
    fetch("/logout")
        .then(response => window.location.href = "/")
        .catch(error => console.error("Error logging out:", error));
}
