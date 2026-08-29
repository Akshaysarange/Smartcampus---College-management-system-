"use strict";


/* =========================================================
   Year Wise Attendance Bars
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const bars = document.querySelectorAll(
        ".vertical-bar-fill"
    );

    bars.forEach(function (bar) {

        let height =
            parseFloat(bar.dataset.height) || 0;

        if (height > 100) {
            height = 100;
        }

        if (height < 0) {
            height = 0;
        }

        bar.style.height = height + "%";
    });

});


/* =========================================================
   OTP Message
========================================================= */

function showOtpMessage(message, success) {

    const box = document.getElementById(
        "otpAttendanceMessage"
    );

    if (!box) {
        alert(message);
        return;
    }

    box.hidden = false;

    box.className = success
        ? "otp-message success"
        : "otp-message error";

    box.textContent = message;
}


/* =========================================================
   Accurate Location Helper
========================================================= */

function getAccurateLocation(
    successCallback,
    errorCallback
) {

    if (!navigator.geolocation) {

        errorCallback({
            message:
                "Location is not supported by this browser."
        });

        return;
    }

    let bestPosition = null;
    let finished = false;

    const watchId =
        navigator.geolocation.watchPosition(

            function (position) {

                if (finished) {
                    return;
                }

                const accuracy =
                    Number(
                        position.coords.accuracy
                    ) || 9999;

                console.log(
                    "Location:",
                    position.coords.latitude,
                    position.coords.longitude
                );

                console.log(
                    "Accuracy:",
                    accuracy,
                    "metres"
                );

                if (
                    !bestPosition ||
                    accuracy <
                    bestPosition.coords.accuracy
                ) {
                    bestPosition = position;
                }

                /*
                 * Agar 40 metre ya better
                 * accuracy mil gayi to
                 * immediately use karo.
                 */
                if (accuracy <= 40) {

                    finished = true;

                    navigator.geolocation.clearWatch(
                        watchId
                    );

                    successCallback(
                        bestPosition
                    );
                }
            },

            function (error) {

                if (finished) {
                    return;
                }

                finished = true;

                navigator.geolocation.clearWatch(
                    watchId
                );

                errorCallback(error);
            },

            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0
            }
        );


    /*
     * Maximum 8 seconds tak
     * best location ka wait karo.
     */
    window.setTimeout(
        function () {

            if (finished) {
                return;
            }

            finished = true;

            navigator.geolocation.clearWatch(
                watchId
            );

            if (bestPosition) {

                successCallback(
                    bestPosition
                );

            } else {

                errorCallback({
                    message:
                        "Unable to get your current location."
                });
            }

        },
        8000
    );
}


/* =========================================================
   Reset OTP Button
========================================================= */

function resetOtpButton() {

    const button = document.getElementById(
        "verifyOtpButton"
    );

    if (!button) {
        return;
    }

    button.disabled = false;

    button.innerHTML = `
        <i class="fa-solid fa-location-crosshairs"></i>
        <span>
            Verify OTP & Mark Present
        </span>
    `;
}


/* =========================================================
   Verify Attendance OTP
========================================================= */

function verifyAttendanceOtp(event) {

    event.preventDefault();

    const otpInput =
        document.getElementById(
            "attendanceOtp"
        );

    const button =
        document.getElementById(
            "verifyOtpButton"
        );

    if (!otpInput || !button) {
        return;
    }

    const otp =
        otpInput.value
            .trim()
            .replace(/\D/g, "");

    if (
        otp.length !== 6
    ) {

        showOtpMessage(
            "Please enter a valid 6-digit OTP.",
            false
        );

        otpInput.focus();

        return;
    }

    if (!navigator.geolocation) {

        showOtpMessage(
            "Your browser does not support location.",
            false
        );

        return;
    }

    button.disabled = true;

    button.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        <span>
            Getting accurate location...
        </span>
    `;


    getAccurateLocation(

        function (position) {

            const latitude =
                position.coords.latitude;

            const longitude =
                position.coords.longitude;

            const accuracy =
                Number(
                    position.coords.accuracy
                ) || 0;


            console.log(
                "Student Latitude:",
                latitude
            );

            console.log(
                "Student Longitude:",
                longitude
            );

            console.log(
                "Student Accuracy:",
                accuracy
            );


            button.innerHTML = `
                <i class="fa-solid fa-spinner fa-spin"></i>
                <span>
                    Verifying OTP...
                </span>
            `;


            fetch(
                "/student/attendance/verify-otp",
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        otp_code: otp,

                        latitude: latitude,

                        longitude: longitude,

                        accuracy: accuracy
                    })

                }
            )

            .then(function (response) {

                return response
                    .json()
                    .then(function (data) {

                        return {
                            ok: response.ok,
                            data: data
                        };

                    });

            })

            .then(function (result) {

                const data =
                    result.data;

                if (
                    result.ok &&
                    data.success
                ) {

                    let message =
                        data.message ||
                        "Attendance marked successfully.";

                    if (
                        data.distance !== undefined
                    ) {

                        message +=
                            " Distance: " +
                            Math.round(
                                Number(
                                    data.distance
                                )
                            ) +
                            " metres.";
                    }

                    showOtpMessage(
                        message,
                        true
                    );


                    otpInput.value = "";


                    window.setTimeout(
                        function () {

                            window.location.reload();

                        },
                        1500
                    );

                    return;
                }


                showOtpMessage(
                    data.message ||
                    "Unable to mark attendance.",
                    false
                );

            })

            .catch(function (error) {

                console.error(
                    "OTP verification error:",
                    error
                );

                showOtpMessage(
                    "Server error. Please try again.",
                    false
                );

            })

            .finally(function () {

                resetOtpButton();

            });

        },


        function (error) {

            console.error(
                "Student location error:",
                error
            );

            resetOtpButton();


            let message =
                "Unable to access your location.";

            if (
                error &&
                error.code ===
                    error.PERMISSION_DENIED
            ) {

                message =
                    "Location permission was denied. Please allow location access.";

            } else if (
                error &&
                error.code ===
                    error.POSITION_UNAVAILABLE
            ) {

                message =
                    "Your current location is unavailable. Turn on GPS and try again.";

            } else if (
                error &&
                error.code ===
                    error.TIMEOUT
            ) {

                message =
                    "Location request timed out. Please try again.";

            } else if (
                error &&
                error.message
            ) {

                message =
                    error.message;
            }


            showOtpMessage(
                message,
                false
            );

        }

    );
}


/* =========================================================
   OTP Input Restriction
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const otpInput =
            document.getElementById(
                "attendanceOtp"
            );

        if (!otpInput) {
            return;
        }

        otpInput.addEventListener(
            "input",
            function () {

                otpInput.value =
                    otpInput.value
                        .replace(/\D/g, "")
                        .slice(0, 6);

            }
        );

    }
);