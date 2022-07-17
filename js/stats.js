
/**
 * Update the stats element.
 * @param emails {number}
 * @param clients {number}
 * @param text {string}
 */
function updateStatsElement(emails, clients, text = "We've processed {emails} emails with {clients} active inboxes.") {
    const stats = document.getElementById("stats");
    stats.innerText = text.replace("{emails}", emails).replace("{clients}", clients);
}

//fetch stats
setInterval(() => {
    fetch("https://api.tempmail.lol/stats").then(res => res.json()).then((data) => {
        console.log(data);
        updateStatsElement(data.emails_received, data.clients_connected);
    });
}, 5000);

fetch("https://api.tempmail.lol/stats").then(res => res.json()).then((data) => {
    console.log(data);
    updateStatsElement(data.emails_received, data.clients_connected);
});

updateStatsElement(0, 0, "Loading...");
