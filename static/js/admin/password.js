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

    if (!oldPassword) {
        alert("Please enter your old password!");
        document.getElementById("old_password").focus();
        return false;
    }

    if (!newPassword) {
        alert("Please enter your new password!");
        document.getElementById("new_password").focus();
        return false;
    }

    if (newPassword.length < 4) {
        alert("Password must be at least 4 characters long!");
        document.getElementById("new_password").focus();
        return false;
    }

    if (oldPassword === newPassword) {
        alert("New password must be different from old password!");
        document.getElementById("new_password").focus();
        return false;
    }

    return true;
}