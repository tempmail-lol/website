
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

const ws = new WebSocket("wss://gateway.exploding.email/stats");

ws.onmessage = function(event) {
    const data = JSON.parse(event.data);
    if(data.op === 3) {
        updateStatsElement(data.statistics.emails_received, data.statistics.clients);
    }
}

updateStatsElement(0, 0, "Loading...");
