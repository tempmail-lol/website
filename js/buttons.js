
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
        alert("Could not copy email, please report this error to bugs@exploding.email: " + err);
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
