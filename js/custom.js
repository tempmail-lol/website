
let emails = [];

if(localStorage.getItem("emails")) {
    emails = JSON.parse(localStorage.getItem("emails"));
    emails.forEach(email => {
        createEmailElement(email.from, email.to, email.subject, email.body, email.html, email.date, true);
    });
}

let address;
let token;

if(emails && emails.length && emails.length > 0) {
    document.getElementById("click_prompt").style.display = "block";
}

function clearLS() {
    if(!confirm("Are you sure?  The emails on your device will be deleted, and you will be logged out."))
        return;
    //clear email field
    document.getElementById("email_field").value = "";
    localStorage.removeItem("emails");
    localStorage.removeItem("domain");
    location.reload();
}

//fetch emails
function startInterval() {
    setInterval(() => {
        fetch(`https://api.tempmail.lol/custom/${localStorage.getItem("c_token")}/${localStorage.getItem("domain")}`, {
            // headers: {
            //     "X-BananaCrumbs-ID": localStorage.getItem("account_id"),
            //     "X-BananaCrumbs-MFA": localStorage.getItem("mfa_token"),
            // }
            headers: {
                "Authorization": `${localStorage.getItem("account_id")},${localStorage.getItem("mfa_token")}`
            },
        }).then(res => res.json()).then(data => {
            console.log(data);
            
            if(data.error) {
                const l = confirm(`Error from server: ${data.error}.  Would you like to login again?`);
                if(l) {
                    clearLS();
                }
            }
            
            //if there are new emails
            if(data.email instanceof Array && data.email.length > 0) {
                document.getElementById("click_prompt").style.display = "block";
                
                let old_size = emails.length;
                
                data.email.forEach(email => {
                    createEmailElement(email.from, email.to, email.subject, email.body, email.html, email.date, true);
                    
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
        }).catch(e => {
            alert(`Error using custom domains.  Are your account details correct?`);
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

function submit_data() {
    const domain = document.getElementById("cd_domain").value;
    const key = document.getElementById("cd_key").value;
    const bc_id = document.getElementById("cd_id").value;
    const mfa = document.getElementById("cd_mfa").value;
    
    yesCustomDomains(domain, key, bc_id, mfa);
}

function yesCustomDomains(domain, token, account_id, mfa_token) {
    
    if(domain && token && account_id && mfa_token) {
        
        if(account_id.length !== 24) return alert("The BananaCrumbs Account ID should be 24 numbers");
        
        //save the domain and token
        localStorage.setItem("domain", domain);
        localStorage.setItem("c_token", token);
        localStorage.setItem("account_id", account_id);
        localStorage.setItem("mfa_token", mfa_token);
        
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

function noCustomDomains() {
    document.getElementById("phase1").hidden = true;
    document.getElementById("phase1.9").hidden = false;
}

function opt19Public() {
    document.getElementById("phase1.9").hidden = true;
    document.getElementById("phase_1.9.9").hidden = false;
}

//if the title hash has #p19, run noCustomDomains and opt19Prublic
if(location.hash === "#p19") {
    noCustomDomains();
    opt19Public();
}

async function continueCustom199() {
    const dm = document.getElementById("input_domain").value;
    
    if(!dm || dm.length === 0) return;
    
    await fetch("https://api.tempmail.lol/addpublic/" + dm);
    
    alert("Success!  Your domain has been added.  If it is found to be malicious, it will be removed.");
    
    location.reload();
}

async function opt19Private() {
    document.getElementById("phase1.9").hidden = true;
    document.getElementById("phase2").hidden = false;
    const str = randomBase64UrlString();
    let strSHA512 = (await sha512(str));
    //convert to hex
    strSHA512 = Array.from(new Uint8Array(strSHA512)).map(b => b.toString(16).padStart(2, "0")).join("");
    
    document.getElementById("domain_hash").innerText = strSHA512;
    document.getElementById("unhashed").innerText = str;
}

if(localStorage.getItem("domain")) {
    document.getElementById("waiting_login").hidden = true;
    document.getElementById("waiting").hidden = false;
    
    address = localStorage.getItem("domain");
    token = localStorage.getItem("c_token");
    
    console.log(address, token);
    
    document.getElementById("email_field").value = address;
    
    startInterval();
}

function p19Yes() {
    
}

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

//whenever outside the modal is clicked, close the modal
window.onclick = (event) => {
    if(event.target === document.getElementById("email_modal")) {
        document.getElementById("email_modal").style.display = "none";
    }
}


function copyToClipboard() {
    const ef = document.getElementById("email_field");
    ef.select();
    ef.setSelectionRange(0, 99999);
    
    navigator.clipboard.writeText(ef.value).then(() => {
        const copy_button = document.getElementById("copy_button");
        //change the text to "copied" with a checkmark unicode
        copy_button.innerHTML = "&#x2713; Copied!";
        
        setTimeout(() => {
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

function verifyToken(secret, token) {
    if (!token || !token.length) return null;
    
    const unformatted = secret.replace(/\W+/g, "").toUpperCase();
    const bin = b32.decode(unformatted);
    
    return notp.totp.verify(token.replace(/\W+/g, ""), bin, {
        time: 30,
    });
}
