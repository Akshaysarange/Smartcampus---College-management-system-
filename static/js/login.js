"use strict";

function togglePassword() {
    const passwordInput = document.getElementById("password");
    const eyeOpen = document.getElementById("eyeOpen");
    const eyeClosed = document.getElementById("eyeClosed");

    if (!passwordInput || !eyeOpen || !eyeClosed) {
        return;
    }

    const passwordHidden = passwordInput.type === "password";

    passwordInput.type = passwordHidden ? "text" : "password";

    eyeOpen.style.display = passwordHidden ? "none" : "inline";
    eyeClosed.style.display = passwordHidden ? "inline" : "none";

    const toggleButton = eyeOpen.closest(".toggle-password");

    if (toggleButton) {
        toggleButton.setAttribute(
            "aria-label",
            passwordHidden ? "Hide password" : "Show password"
        );
    }

    passwordInput.focus();
}

function validateForm() {
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");

    if (!usernameInput || !passwordInput) {
        return false;
    }

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (!username) {
        alert("Please enter your username!");
        usernameInput.focus();
        return false;
    }

    if (!password) {
        alert("Please enter your password!");
        passwordInput.focus();
        return false;
    }

    usernameInput.value = username;

    return true;
}

document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");
    const submitButton = document.querySelector(".login-btn");

    if (!loginForm) {
        return;
    }

    loginForm.addEventListener("submit", function (event) {
        if (!validateForm()) {
            event.preventDefault();
            return;
        }

        if (submitButton) {
            submitButton.disabled = true;

            submitButton.innerHTML = `
                <i class="fa-solid fa-spinner fa-spin"></i>
                <span>Logging in...</span>
            `;
        }
    });
});