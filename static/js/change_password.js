"use strict";

function togglePass(inputId, openId, closedId) {
    const input = document.getElementById(inputId);
    const eyeOpen = document.getElementById(openId);
    const eyeClosed = document.getElementById(closedId);

    if (!input || !eyeOpen || !eyeClosed) {
        return;
    }

    const passwordHidden = input.type === "password";

    input.type = passwordHidden ? "text" : "password";

    eyeOpen.style.display = passwordHidden ? "none" : "inline";
    eyeClosed.style.display = passwordHidden ? "inline" : "none";

    const toggleButton = eyeOpen.closest(".toggle-password");

    if (toggleButton) {
        toggleButton.setAttribute(
            "aria-label",
            passwordHidden ? "Hide password" : "Show password"
        );
    }

    input.focus();
}

function showError(message) {
    const errorBox = document.getElementById("errorBox");

    if (!errorBox) {
        return;
    }

    errorBox.textContent = message;
    errorBox.hidden = false;
}

function hideError() {
    const errorBox = document.getElementById("errorBox");

    if (!errorBox) {
        return;
    }

    errorBox.textContent = "";
    errorBox.hidden = true;
}

function validateForm() {
    const newPasswordInput =
        document.getElementById("new_password");

    const confirmPasswordInput =
        document.getElementById("confirm_password");

    if (!newPasswordInput || !confirmPasswordInput) {
        return false;
    }

    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    hideError();

    if (!newPassword) {
        showError("Please enter a new password!");
        newPasswordInput.focus();
        return false;
    }

    if (newPassword.length < 4) {
        showError(
            "Password must be at least 4 characters!"
        );
        newPasswordInput.focus();
        return false;
    }

    if (!confirmPassword) {
        showError("Please confirm your password!");
        confirmPasswordInput.focus();
        return false;
    }

    if (newPassword !== confirmPassword) {
        showError("Passwords do not match!");
        confirmPasswordInput.focus();
        return false;
    }

    return true;
}

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("changeForm");

    if (!form) {
        return;
    }

    form.addEventListener("submit", function (event) {
        const clickedButton = event.submitter;

        if (!clickedButton) {
            event.preventDefault();
            return;
        }

        const action = clickedButton.value;

        if (action === "skip") {
            hideError();
            return;
        }

        if (action === "change" && !validateForm()) {
            event.preventDefault();
            return;
        }

        clickedButton.disabled = true;

        if (action === "change") {
            clickedButton.innerHTML = `
                <i class="fa-solid fa-spinner fa-spin"></i>
                <span>Changing...</span>
            `;
        } else {
            clickedButton.innerHTML = `
                <i class="fa-solid fa-spinner fa-spin"></i>
                <span>Continuing...</span>
            `;
        }
    });
});