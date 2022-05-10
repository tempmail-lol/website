
const GENERATE_URL  = "https://api.tempmail.lol/generate";
const AUTH_URL_BASE = "https://api.tempmail.lol/auth/";

let emails = [];

if(localStorage.getItem("emails")) {
    emails = JSON.parse(localStorage.getItem("emails"));
    emails.forEach(email => {
        createEmailElement(email.from, email.to, email.subject, email.body, email.html, email.date);
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

if(emails.length > 0) {
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
    fetch(GENERATE_URL).then(res => res.json()).then(data => {
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

setInterval(() => {
    fetch(AUTH_URL_BASE + token).then(res => res.json()).then(data => {
        console.log(data);
        if(data.token === "invalid") {
            clearLS();
            location.reload();
        }
        if(data.email instanceof Array) {
            document.getElementById("click_prompt").style.display = "block";
            data.email.forEach(email => {
                createEmailElement(email.from, email.to, email.subject, email.body, email.html, email.date);
            });
            emails.push(...data.email);
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
