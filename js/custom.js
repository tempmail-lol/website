
let emails = [];

if(localStorage.getItem("emails")) {
    emails = JSON.parse(localStorage.getItem("emails"));
    emails.forEach(email => {
        createEmailElement(email.from, email.to, email.subject, email.body, email.html, email.date);
    });
}

let address;
let token;

if(emails && emails.length && emails.length > 0) {
    document.getElementById("click_prompt").style.display = "block";
}

function clearLS() {
    localStorage.removeItem("domain");
    localStorage.removeItem("token");
    location.reload();
}

//fetch emails
function startInterval() {
    setInterval(() => {
        fetch(`https://api.tempmail.lol/custom/${localStorage.getItem("token")}/${localStorage.getItem("domain")}`).then(res => res.json()).then(data => {
            console.log(data);
            
            //if there are new emails
            if(data.email instanceof Array && data.email.length > 0) {
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
            }
        });
    }, 5000);
}

setInterval(() => {
    localStorage.setItem("emails", JSON.stringify(emails));
}, 3000);

const waiting_text = "Waiting for emails";
let periods = 1;

setInterval(() => {
    document.getElementById("waiting").innerText = waiting_text + ".".repeat(periods);
    periods = Math.max(1, (periods + 1) % 4);
}, 1000);


function yesCustomDomains() {
    //prompt for the domain and token
    const domain = prompt("Enter your domain name");
    const token = prompt("Enter the token we gave you before (note: we will NOT alert you if it is invalid)");
    
    //if the user didn't cancel
    if(domain && token) {
        //save the domain and token
        localStorage.setItem("domain", domain);
        localStorage.setItem("token", token);
        
        //reload the page
        location.reload();
    }
}

function randomBase64UrlString() {
    const randomBytes = new Uint8Array(32);
    window.crypto.getRandomValues(randomBytes);
    return btoa(String.fromCharCode(...randomBytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function sha512(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    return window.crypto.subtle.digest("SHA-512", data);
}

async function noCustomDomains() {
    document.getElementById("phase1").hidden = true;
    document.getElementById("phase2").hidden = false;
    
    const str = randomBase64UrlString();
    let strSHA512 = (await sha512(str));
    //convert to hex
    strSHA512 = Array.from(new Uint8Array(strSHA512)).map(b => b.toString(16).padStart(2, "0")).join("");
    
    document.getElementById("domain_hash").innerText = strSHA512;
    document.getElementById("unhashed").innerText = str;
}

if(localStorage.getItem("domain")) {
    document.getElementById("phase1").hidden = true;
    document.getElementById("phase2").hidden = true;
    document.getElementById("phase3").hidden = false;
    document.getElementById("email_set").hidden = false;
    
    address = localStorage.getItem("domain");
    token = localStorage.getItem("token");
    
    console.log(address, token);
    
    document.getElementById("email_field").value = address;
    
    startInterval();
}