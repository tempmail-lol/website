
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

//fetch emails
setInterval(() => {
    fetch(AUTH_URL_BASE + token).then(res => res.json()).then(data => {
        console.log(data);
        if(data.token === "invalid") {
            clearLS();
            location.reload();
        }
        
        //if there are new emails
        if(data.email instanceof Array) {
            document.getElementById("click_prompt").style.display = "block";
            
            let old_size = emails.length;
            
            data.email.forEach(email => {
                createEmailElement(email.from, email.to, email.subject, email.body, email.html, email.date);
                
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
            
            emails.push(...data.email);
            
            //reload if the emails haven't displayed (kind of a duct tape solution, but whatever)
            setTimeout(() => {
                if(old_size !== document.getElementById("email_list").children.length - 1) {
                    location.reload();
                }
            }, 2000);
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
