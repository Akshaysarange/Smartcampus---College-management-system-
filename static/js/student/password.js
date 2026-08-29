function togglePass(inputId, eyeOpenId, eyeClosedId) {

    const input = document.getElementById(inputId);
    const eyeOpen = document.getElementById(eyeOpenId);
    const eyeClosed = document.getElementById(eyeClosedId);

    if (input.type === "password") {
        input.type = "text";
        eyeOpen.style.display = "none";
        eyeClosed.style.display = "inline";
    } else {
        input.type = "password";
        eyeOpen.style.display = "inline";
        eyeClosed.style.display = "none";
    }
}

function validateForm() {

    const oldPassword = document.getElementById("old_password").value.trim();
    const newPassword = document.getElementById("new_password").value.trim();

    if (oldPassword === "") {
        alert("Please enter old password");
        document.getElementById("old_password").focus();
        return false;
    }

    if (newPassword === "") {
        alert("Please enter new password");
        document.getElementById("new_password").focus();
        return false;
    }

    if (newPassword.length < 4) {
        alert("Password must be at least 4 characters");
        document.getElementById("new_password").focus();
        return false;
    }

    if (oldPassword === newPassword) {
        alert("New password cannot be the same as old password");
        document.getElementById("new_password").focus();
        return false;
    }

    return true;
}

document.addEventListener("DOMContentLoaded", function () {

    const card = document.querySelector(".card");

    card.style.opacity = "0";
    card.style.transform = "translateY(20px)";

    setTimeout(function () {
        card.style.transition = "all .5s ease";
        card.style.opacity = "1";
        card.style.transform = "translateY(0)";
    }, 150);

});