"use strict";

function togglePass(inputId, openId, closedId) {

    const input = document.getElementById(inputId);
    const eyeOpen = document.getElementById(openId);
    const eyeClosed = document.getElementById(closedId);

    if (!input) {
        return;
    }

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

    const currentPassword =
        document.getElementById("current_password");

    const newPassword =
        document.getElementById("new_password");

    const submitButton =
        document.getElementById("changePasswordButton");

    const current =
        currentPassword.value.trim();

    const updated =
        newPassword.value.trim();


    if (current === "") {

        alert("Please enter old password.");

        currentPassword.focus();

        return false;
    }


    if (updated === "") {

        alert("Please enter new password.");

        newPassword.focus();

        return false;
    }


    if (updated.length < 4) {

        alert(
            "New password must be at least 4 characters."
        );

        newPassword.focus();

        return false;
    }


    if (current === updated) {

        alert(
            "New password cannot be same as old password."
        );

        newPassword.focus();

        return false;
    }


    if (submitButton) {

        submitButton.disabled = true;

        submitButton.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            <span>Updating...</span>
        `;
    }

    return true;
}


document.addEventListener("DOMContentLoaded", function () {

    const currentPassword =
        document.getElementById("current_password");

    const newPassword =
        document.getElementById("new_password");

    if (currentPassword) {
        currentPassword.focus();
    }

    [currentPassword, newPassword].forEach(function (input) {

        if (!input) {
            return;
        }

        input.addEventListener("keydown", function (event) {

            if (event.key === "Enter") {

                const form = input.closest("form");

                if (form) {
                    form.requestSubmit();
                }

            }

        });

    });

});