
const GENERATE_URL  = "https://api.tempmail.lol/inbox/create";
const AUTH_URL_BASE = "https://api.tempmail.lol/inbox?token=";

let emails = [];

if(localStorage.getItem("emails")) {
    emails = JSON.parse(localStorage.getItem("emails"));
    emails.forEach(email => {
        createEmailElement(email.from, email.to, email.subject, email.body, email.html, email.date, false);
    });
}

let address;
let token;

function clearLS() {
    //don't clear everything as there may be other data
    localStorage.removeItem("emails");
    localStorage.removeItem("address");
    localStorage.removeItem("token");
    localStorage.removeItem("creation_time");
}

if(emails && emails.length && emails.length > 0) {
    document.getElementById("click_prompt").style.display = "block";
}

//if the "creation_time" in unix milliseconds is less than the current time, then the token is expired
const ct = localStorage.getItem("creation_time");
if(ct && ct < Date.now()) {
    clearLS();
    location.reload();
}

if(localStorage.getItem("address") && localStorage.getItem("token")) {
    address = localStorage.getItem("address");
    token = localStorage.getItem("token");
    
    document.getElementById("email_field").value = address;
} else {
    
    let url = GENERATE_URL;
    let rush = false;
    
    console.log(`rush_mode: ${localStorage.getItem("rush_mode")}`);
    
    if(localStorage.getItem("rush_mode") && localStorage.getItem("rush_mode") === "true") {
        rush = true;
    }
    
    fetch(url, {
        method: "POST",
        body: JSON.stringify({
            community: rush,
        })
    }).then(res => res.json()).then(data => {
        console.log(data);
        
        address = data.address;
        token = data.token;
        
        document.getElementById("email_field").value = address;
        
        localStorage.setItem("address", address);
        localStorage.setItem("token", token);
        
        //set creation time to be the current time plus 1 hour
        localStorage.setItem("creation_time", String(Date.now() + 3600000));
    });
    
}

//fetch emails
setInterval(() => {
    fetch(AUTH_URL_BASE + token).then(res => res.json()).then(data => {
        console.log(data);
        if(data.expired) {
            clearLS();
            location.reload();
        }
        
        //if there are new emails
        if(data.emails instanceof Array && data.emails.length > 0) {
            document.getElementById("click_prompt").style.display = "block";
            
            let old_size = emails.length;
            
            data.emails.forEach(email => {
                createEmailElement(email.from, email.to, email.subject, email.body, email.html, email.date, false);
                
                //if the page is not visible, add an identifier to the title until the user goes back on
                if(document.hidden) {
                    const identifier = "(1)";
                    
                    if(document.title.indexOf(identifier) === -1) {
                        document.title = identifier + " " + document.title;
                        
                        document.addEventListener("visibilitychange", () => {
                            document.title = document.title.replace(identifier, "");
                        });
                    }
                }
            });
            
            emails.push(...data.emails);
        }
    });
}, 5000);

setInterval(() => {
    localStorage.setItem("emails", JSON.stringify(emails));
}, 3000);

const waiting_text = "Waiting for emails";
let periods = 1;

setInterval(() => {
    document.getElementById("waiting").innerText = waiting_text + ".".repeat(periods);
    periods = Math.max(1, (periods + 1) % 4);
}, 1000);

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
    fetch("https://api.tempmail.lol/v2/stats").then(res => res.json()).then((data) => {
        console.log(data);
        updateStatsElement(data.emails_received, data.clients_connected);
    });
}, 5000);

fetch("https://api.tempmail.lol/v2/stats").then(res => res.json()).then((data) => {
    console.log(data);
    updateStatsElement(data.emails_received, data.clients_connected);
});

updateStatsElement(0, 0, "Loading...");


/**
 * Format the given unix timestamp to a human-readable date
 *
 * Format: YYYY-MM-DD HH:MM:SS
 *
 * @param date {number}
 * @returns {string}
 */
function formatDate(date) {
    const d = new Date(date);
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const hour = d.getHours();
    const minute = d.getMinutes();
    const second = d.getSeconds();
    return d.getFullYear() + '-' + (month < 10 ? '0' : '') + month + '-' + (day < 10 ? '0' : '') + day + ' ' + (hour < 10 ? '0' : '') + hour + ':' + (minute < 10 ? '0' : '') + minute + ':' + (second < 10 ? '0' : '') + second;
}

/**
 * Create an email element.
 *
 * @param from {string}
 * @param to {string}
 * @param subject {string}
 * @param body {string}
 * @param html {string}
 * @param date {number}
 * @param custom {boolean}
 */
function createEmailElement(from, to, subject, body, html, date, custom) {
    
    //hide the "Waiting..." message
    document.getElementById('waiting').style.display = "none";
    
    const email = document.createElement("tr");
    //will have <td> for from, date, and subject
    const fromTd = document.createElement("td");
    const dateTd = document.createElement("td");
    const subjectTd = document.createElement("td");
    
    let toTd;
    if(custom) {
        toTd = document.createElement("td");
        toTd.innerHTML = to;
    }
    
    fromTd.innerHTML = from;
    dateTd.innerHTML = formatDate(date);
    subjectTd.innerHTML = subject;
    
    //append to inbox_table
    email.appendChild(fromTd);
    email.appendChild(dateTd);
    custom && email.appendChild(toTd);
    email.appendChild(subjectTd);
    
    email.style.cursor = "pointer";
    
    email.onclick = () => {
        openEmailModal(from, to, subject, body, html, date);
    };
    
    document.getElementById("inbox_table").appendChild(email);
}

function openEmailModal(from, to, subject, body, html, date) {
    //email_iframe
    //embed the html into the iframe, if it is undefined, embed the body
    if (html === undefined) {
        document.getElementById("email_iframe").srcdoc = body;
    } else {
        document.getElementById("email_iframe").srcdoc = html;
    }
    
    //email_modal
    document.getElementById("email_modal").style.display = "block";
    document.getElementById("modal_subject").innerText = subject;
}

document.getElementById("modal_close").onclick = () => {
    document.getElementById("email_modal").style.display = "none";
};

//whenever outside the modal is clicked, close the modal
window.onclick = (event) => {
    if(event.target === document.getElementById("email_modal")) {
        document.getElementById("email_modal").style.display = "none";
    }
}

let copy_count = 0;

let copy_timeout;

function copyToClipboard() {
    const ef = document.getElementById("email_field");
    ef.select();
    ef.setSelectionRange(0, 99999);
    
    navigator.clipboard.writeText(ef.value).then(() => {
        const copy_button = document.getElementById("copy_button");
        //change the text to "copied" with a checkmark unicode
        copy_button.innerHTML = "&#x2713; Copied!";
        
        copy_count++;
        
        if(copy_count >= 30) {
            //redirect
            alert("You have peeked into the abyss of the copy button, and now the copy button is staring back at you...");
            location.href = "https://tempmail.lol/egg.html";
        }
        
        if(copy_timeout) clearInterval(copy_timeout);
        
        copy_timeout = setTimeout(() => {
            copy_button.innerHTML = "Copy";
        }, 3000);
    }).catch(err => {
        console.error("Could not copy email: ", err);
        alert("Could not copy email, please report this error to bugs@bananacrumbs.us: " + err);
    });
    
    
}

function regenerate() {
    //are you sure dialog
    const sure = confirm("Are you sure?  Your old email will be deleted as well as your inbox.");
    if(sure) {
        localStorage.removeItem("emails");
        localStorage.removeItem("address");
        localStorage.removeItem("token");
        localStorage.removeItem("creation_time");
        location.reload();
    }
}

function topnav_resize() {
    const x = document.getElementById("topnav");
    if(x.className === "topnav") {
        x.className += " responsive";
    } else {
        x.className = "topnav";
    }
}

function ca_info() {
    alert("Community addresses use domains people have given to the website (such as @example.com).\n\nThis can help to avoid TempMail detection on some" +
        " websites; however, please be aware that the original domain owner can see all emails from expired inboxes, should it be removed from the website.\n\n" +
        "If you have your own domain and would like to allow people to use it for temporary email addresses, please add it here: https://tempmail.lol/custom.html\n\n" +
        "Note that community email addresses can be used by the original domain owner.  Do not use these addresses for anything sensitive.");
}
