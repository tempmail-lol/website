
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
 */
function createEmailElement(from, to, subject, body, html, date) {
    
    //hide the "Waiting..." message
    document.getElementById('waiting').style.display = "none";
    
    const email = document.createElement("tr");
    //will have <td> for from, date, and subject
    const fromTd = document.createElement("td");
    const dateTd = document.createElement("td");
    const toTd = document.createElement("td");
    const subjectTd = document.createElement("td");
    
    fromTd.innerHTML = from;
    dateTd.innerHTML = formatDate(date);
    toTd.innerHTML = to;
    subjectTd.innerHTML = subject;
    
    //append to inbox_table
    email.appendChild(fromTd);
    email.appendChild(dateTd);
    email.appendChild(toTd);
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
