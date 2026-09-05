"use strict";

let attendanceData = [];


/* =========================================================
   Utility Functions
========================================================= */

function escapeHtml(value) {
    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function getTodayLocal() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(
        now.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        now.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function showAttendanceMessage(message) {
    const table = document.getElementById(
        "attendanceTable"
    );

    if (!table) {
        return;
    }

    table.innerHTML = `
        <div class="result-empty">
            ${escapeHtml(message)}
        </div>
    `;
}


/* =========================================================
   Load Teacher Subjects
========================================================= */

function loadSubjects() {
    const yearSelect = document.getElementById(
        "yearSelect"
    );

    const subjectSelect = document.getElementById(
        "subjectSelect"
    );

    if (!yearSelect || !subjectSelect) {
        return;
    }

    const year = yearSelect.value;

    subjectSelect.innerHTML = `
        <option value="">
            Select Subject
        </option>
    `;

    subjectSelect.disabled = true;

    attendanceData = [];

    showAttendanceMessage(
        "Select year, subject and date to take attendance"
    );

    if (!year) {
        subjectSelect.innerHTML = `
            <option value="">
                Select Year First
            </option>
        `;

        return;
    }

    subjectSelect.innerHTML = `
        <option value="">
            Loading subjects...
        </option>
    `;

    fetch(
        `/teacher/subjects/${encodeURIComponent(year)}`
    )
        .then(function (response) {
            if (!response.ok) {
                throw new Error(
                    "Unable to load subjects"
                );
            }

            return response.json();
        })
        .then(function (subjects) {
            subjectSelect.innerHTML = `
                <option value="">
                    Select Subject
                </option>
            `;

            if (
                !Array.isArray(subjects) ||
                subjects.length === 0
            ) {
                subjectSelect.innerHTML = `
                    <option value="">
                        No subjects found
                    </option>
                `;

                return;
            }

            subjects.forEach(function (subject) {
                const option =
                    document.createElement("option");

                option.value = String(subject.id);

                option.textContent =
                    subject.name || "Unnamed Subject";

                subjectSelect.appendChild(option);
            });

            subjectSelect.disabled = false;
        })
        .catch(function (error) {
            console.error(
                "Load subjects error:",
                error
            );

            subjectSelect.innerHTML = `
                <option value="">
                    Error loading subjects
                </option>
            `;

            showAttendanceMessage(
                "Unable to load subjects. Please try again."
            );
        });
}


/* =========================================================
   Load Students for Attendance
========================================================= */

function loadStudentsForAttendance() {
    const yearSelect = document.getElementById(
        "yearSelect"
    );

    const subjectSelect = document.getElementById(
        "subjectSelect"
    );

    const dateInput = document.getElementById(
        "attendanceDate"
    );

    if (
        !yearSelect ||
        !subjectSelect ||
        !dateInput
    ) {
        return;
    }

    const year = yearSelect.value;
    const subject = subjectSelect.value;
    const selectedDate = dateInput.value;
    const today = getTodayLocal();

    attendanceData = [];

    if (!year || !subject || !selectedDate) {
        showAttendanceMessage(
            "Select year, subject and date to take attendance"
        );

        return;
    }

    if (selectedDate > today) {
        showAttendanceMessage(
            "Future date attendance is not allowed."
        );

        alert(
            "Future date attendance is not allowed!"
        );

        return;
    }

    showAttendanceMessage(
        "Loading students..."
    );

    fetch(
        `/teacher/attendance/students/` +
        `${encodeURIComponent(year)}/` +
        `${encodeURIComponent(subject)}/` +
        `${encodeURIComponent(selectedDate)}`
    )
        .then(function (response) {
            if (!response.ok) {
                throw new Error(
                    "Unable to load students"
                );
            }

            return response.json();
        })
        .then(function (students) {
            if (
                !Array.isArray(students) ||
                students.length === 0
            ) {
                showAttendanceMessage(
                    "No students found"
                );

                return;
            }

            let html = `
                <div class="table-wrap">

                    <table>

                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th>Roll No</th>
                                <th>Status</th>
                            </tr>
                        </thead>

                        <tbody>
            `;

            students.forEach(function (
                student,
                index
            ) {
                const studentId =
                    Number(student.id);

                const status =
                    student.status === "A"
                        ? "A"
                        : "P";

                const isPresent =
                    status === "P";

                attendanceData.push({
                    student_id: studentId,
                    status: status
                });

                html += `
                    <tr>

                        <td data-label="#">
                            ${index + 1}
                        </td>

                        <td data-label="Name">
                            ${escapeHtml(
                                student.name || "-"
                            )}
                        </td>

                        <td data-label="Roll No">
                            ${escapeHtml(
                                student.roll || "-"
                            )}
                        </td>

                        <td data-label="Status">

                            <button
                                type="button"
                                id="btn${studentId}"
                                class="status-btn ${
                                    isPresent
                                        ? "present"
                                        : "absent"
                                }"
                                onclick="toggleAttendance(${studentId})"
                            >
                                ${
                                    isPresent
                                        ? "PRESENT"
                                        : "ABSENT"
                                }
                            </button>

                        </td>

                    </tr>
                `;
            });

            html += `
                        </tbody>

                    </table>

                </div>
            `;

            const table =
                document.getElementById(
                    "attendanceTable"
                );

            if (table) {
                table.innerHTML = html;
            }
        })
        .catch(function (error) {
            console.error(
                "Load attendance students error:",
                error
            );

            showAttendanceMessage(
                "Unable to load students. Please try again."
            );
        });
}


/* =========================================================
   Toggle Attendance
========================================================= */

function toggleAttendance(studentId) {
    const button = document.getElementById(
        "btn" + studentId
    );

    const student = attendanceData.find(
        function (item) {
            return (
                Number(item.student_id) ===
                Number(studentId)
            );
        }
    );

    if (!button || !student) {
        return;
    }

    if (student.status === "P") {
        student.status = "A";

        button.textContent = "ABSENT";

        button.classList.remove("present");
        button.classList.add("absent");
    } else {
        student.status = "P";

        button.textContent = "PRESENT";

        button.classList.remove("absent");
        button.classList.add("present");
    }
}


/* =========================================================
   Submit Attendance
========================================================= */

function submitAttendance() {
    const yearSelect = document.getElementById(
        "yearSelect"
    );

    const subjectSelect = document.getElementById(
        "subjectSelect"
    );

    const dateInput = document.getElementById(
        "attendanceDate"
    );

    const submitButton = document.querySelector(
        ".submit-btn"
    );

    if (
        !yearSelect ||
        !subjectSelect ||
        !dateInput
    ) {
        return;
    }

    const year = yearSelect.value;
    const subject = subjectSelect.value;
    const selectedDate = dateInput.value;
    const today = getTodayLocal();

    if (!year || !subject || !selectedDate) {
        alert(
            "Please select year, subject and date!"
        );

        return;
    }

    if (selectedDate > today) {
        alert(
            "Future date attendance is not allowed!"
        );

        return;
    }

    if (attendanceData.length === 0) {
        alert("No students found!");
        return;
    }

    const confirmed = window.confirm(
        "Are you sure you want to submit attendance?"
    );

    if (!confirmed) {
        return;
    }

    if (submitButton) {
        submitButton.disabled = true;

        submitButton.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            Submitting...
        `;
    }

    fetch("/teacher/attendance/submit", {
        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            year: year,
            subject_id: subject,
            date: selectedDate,
            attendance: attendanceData
        })
    })
        .then(function (response) {
            if (!response.ok) {
                throw new Error(
                    "Unable to submit attendance"
                );
            }

            return response.json();
        })
        .then(function (data) {
            if (data.success) {
                alert(
                    "Attendance submitted successfully!\n\n" +
                    "Present: " +
                    data.present +
                    "\n" +
                    "Absent: " +
                    data.absent +
                    "\n\n" +
                    "Database Updated\n" +
                    "Excel Updated"
                );

                loadStudentsForAttendance();
            } else {
                alert(
                    data.message ||
                    "Something went wrong!"
                );
            }
        })
        .catch(function (error) {
            console.error(
                "Submit attendance error:",
                error
            );

            alert(
                "Server error. Please try again."
            );
        })
        .finally(function () {
            if (submitButton) {
                submitButton.disabled = false;

                submitButton.innerHTML = `
                    <i class="fa-solid fa-check"></i>
                    Submit Attendance
                `;
            }
        });
}


/* =========================================================
   Page Initialization
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {
        const dateInput =
            document.getElementById(
                "attendanceDate"
            );

        const subjectSelect =
            document.getElementById(
                "subjectSelect"
            );

        const today = getTodayLocal();

        if (dateInput) {
            dateInput.value = today;
            dateInput.max = today;
        }

        if (subjectSelect) {
            subjectSelect.disabled = true;
        }
    }
);

/* =========================================================
   OTP Attendance
========================================================= */

let otpCountdownInterval = null;
let activeOtpSessionId = null;
let otpStatusInterval = null;

/* =========================================================
   OTP Message
========================================================= */

function showTeacherOtpMessage(message, success) {
    const messageBox = document.getElementById(
        "teacherOtpMessage"
    );

    if (!messageBox) {
        alert(message);
        return;
    }

    messageBox.hidden = false;

    messageBox.className = success
        ? "otp-teacher-message success"
        : "otp-teacher-message error";

    messageBox.textContent = message;
}


/* =========================================================
   Selection Change
========================================================= */

function handleAttendanceSelectionChange() {
    loadStudentsForAttendance();

    const activeOtpPanel = document.getElementById(
        "activeOtpPanel"
    );

    if (activeOtpPanel && !activeOtpPanel.hidden) {
        showTeacherOtpMessage(
            "Stop the current OTP before changing the subject.",
            false
        );
    }
}


/* =========================================================
   Generate OTP
========================================================= */

function generateAttendanceOtp() {
    const yearSelect = document.getElementById(
        "yearSelect"
    );

    const subjectSelect = document.getElementById(
        "subjectSelect"
    );

    const generateButton = document.getElementById(
        "generateOtpButton"
    );

    if (
        !yearSelect ||
        !subjectSelect
    ) {
        return;
    }

    const year = yearSelect.value;
    const subjectId = subjectSelect.value;
    const allowedRadius = 50;

    if (!year) {
        showTeacherOtpMessage(
            "Please select a year.",
            false
        );

        yearSelect.focus();
        return;
    }

    if (!subjectId) {
        showTeacherOtpMessage(
            "Please select a subject.",
            false
        );

        subjectSelect.focus();
        return;
    }

    if (!navigator.geolocation) {
        showTeacherOtpMessage(
            "Your browser does not support location access.",
            false
        );

        return;
    }

    if (generateButton) {
        generateButton.disabled = true;

        generateButton.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            <span>Getting Location...</span>
        `;
    }

    navigator.geolocation.getCurrentPosition(
        function (position) {
            sendGenerateOtpRequest(
                year,
                subjectId,
                allowedRadius,
                position.coords.latitude,
                position.coords.longitude
            );
        },

        function (error) {
            console.error(
                "Teacher location error:",
                error
            );

            resetGenerateOtpButton();

            let message =
                "Unable to access your location.";

            if (error.code === error.PERMISSION_DENIED) {
                message =
                    "Location permission was denied. Please allow location access.";
            } else if (
                error.code === error.POSITION_UNAVAILABLE
            ) {
                message =
                    "Your current location is unavailable.";
            } else if (error.code === error.TIMEOUT) {
                message =
                    "Location request timed out. Please try again.";
            }

            showTeacherOtpMessage(
                message,
                false
            );
        },

        {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
        }
    );
}


function sendGenerateOtpRequest(
    year,
    subjectId,
    allowedRadius,
    latitude,
    longitude
) {
    const generateButton = document.getElementById(
        "generateOtpButton"
    );

    if (generateButton) {
        generateButton.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            <span>Generating OTP...</span>
        `;
    }

    fetch("/teacher/attendance/generate-otp", {
        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            year: year,
            subject_id: subjectId,
            latitude: latitude,
            longitude: longitude,
            allowed_radius: allowedRadius
        })
    })
        .then(function (response) {
            return response.json().then(
                function (data) {
                    if (!response.ok) {
                        throw new Error(
                            data.message ||
                            "Unable to generate OTP."
                        );
                    }

                    return data;
                }
            );
        })
        .then(function (data) {
            if (!data.success) {
                throw new Error(
                    data.message ||
                    "Unable to generate OTP."
                );
            }

            activeOtpSessionId = data.session_id;

            displayActiveOtp(data);
            startOtpStatusPolling();

            startOtpCountdown(
                Number(
                    data.expires_in_seconds || 300
                )
            );

            showTeacherOtpMessage(
                data.message ||
                "Attendance OTP generated successfully.",
                true
            );
        })
        .catch(function (error) {
            console.error(
                "Generate OTP error:",
                error
            );

            showTeacherOtpMessage(
                error.message ||
                "Unable to generate OTP. Please try again.",
                false
            );
        })
        .finally(function () {
            resetGenerateOtpButton();
        });
}


/* =========================================================
   Display OTP
========================================================= */

function displayActiveOtp(data) {
    const activeOtpPanel = document.getElementById(
        "activeOtpPanel"
    );

    const otpCode = document.getElementById(
        "activeOtpCode"
    );

    const otpSubject = document.getElementById(
        "activeOtpSubject"
    );

    if (
        !activeOtpPanel ||
        !otpCode ||
        !otpSubject
    ) {
        return;
    }

    otpCode.textContent =
        data.otp_code || "------";

    otpSubject.textContent =
        `${data.year} • ${data.subject_name} • ${data.allowed_radius} metres`;

    activeOtpPanel.hidden = false;
}


/* =========================================================
   OTP Countdown
========================================================= */

function startOtpCountdown(totalSeconds) {
    const timerElement = document.getElementById(
        "activeOtpTimer"
    );

    if (!timerElement) {
        return;
    }

    if (otpCountdownInterval) {
        clearInterval(otpCountdownInterval);
    }

    let remainingSeconds = totalSeconds;

    updateOtpTimerDisplay(
        timerElement,
        remainingSeconds
    );

    otpCountdownInterval = window.setInterval(
        function () {
            remainingSeconds -= 1;

            updateOtpTimerDisplay(
                timerElement,
                remainingSeconds
            );

            if (remainingSeconds <= 0) {
                clearInterval(
                otpCountdownInterval
                );

                otpCountdownInterval = null;

                stopAttendanceOtp(true);
            }
        },
        1000
    );
}


function updateOtpTimerDisplay(
    timerElement,
    totalSeconds
) {
    const safeSeconds = Math.max(
        0,
        totalSeconds
    );

    const minutes = Math.floor(
        safeSeconds / 60
    );

    const seconds = safeSeconds % 60;

    timerElement.textContent =
        `${String(minutes).padStart(2, "0")}:` +
        `${String(seconds).padStart(2, "0")}`;
}


/* =========================================================
   Stop OTP
========================================================= */

function stopAttendanceOtp(autoExpired = false) {
    if (!activeOtpSessionId) {
        if (!autoExpired) {
            showTeacherOtpMessage(
                "No active OTP session found.",
                false
            );
        }

        return;
    }

    if (
        !autoExpired &&
        !window.confirm(
            "Are you sure you want to stop this OTP?"
        )
    ) {
        return;
    }

    const stopButton = document.getElementById(
        "stopOtpButton"
    );

    if (stopButton) {
        stopButton.disabled = true;

        stopButton.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            <span>Completing...</span>
        `;
    }

    fetch("/teacher/attendance/stop-otp", {
        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            session_id: activeOtpSessionId
        })
    })
        .then(function (response) {
            return response.json().then(function (data) {
                if (!response.ok) {
                    throw new Error(
                        data.message ||
                        "Unable to complete OTP attendance."
                    );
                }

                return data;
            });
        })
        .then(function (data) {
            if (!data.success) {
                throw new Error(
                data.message ||
                "Unable to complete OTP attendance."
            );
        }

        hideActiveOtpPanel();
        stopOtpStatusPolling();

        activeOtpSessionId = null;

            alert(
                "OTP Attendance Completed!\n\n" +
                "Subject: " + data.subject + "\n" +
                "Year: " + data.year + "\n\n" +
                "Present: " + data.present + "\n" +
                "Absent: " + data.absent + "\n" +
                "Total: " + data.total + "\n\n" +
                "Database Updated\n" +
                "Excel Updated"
            );

            loadStudentsForAttendance();
        })
        .catch(function (error) {
            console.error("Stop OTP error:", error);

            showTeacherOtpMessage(
                error.message ||
                "Unable to complete OTP attendance.",
                false
            );
        })
        .finally(function () {
            if (stopButton) {
                stopButton.disabled = false;

                stopButton.innerHTML = `
                    <i class="fa-solid fa-circle-stop"></i>
                    <span>Stop OTP</span>
                `;
            }
        });
}

/* =========================================================
   Reset OTP UI
========================================================= */

function hideActiveOtpPanel() {
    const activeOtpPanel = document.getElementById(
        "activeOtpPanel"
    );

    const otpCode = document.getElementById(
        "activeOtpCode"
    );

    const otpSubject = document.getElementById(
        "activeOtpSubject"
    );

    const timer = document.getElementById(
        "activeOtpTimer"
    );

    if (otpCountdownInterval) {
        clearInterval(otpCountdownInterval);
        otpCountdownInterval = null;
    }

    activeOtpSessionId = null;

    if (activeOtpPanel) {
        activeOtpPanel.hidden = true;
    }

    if (otpCode) {
        otpCode.textContent = "------";
    }

    if (otpSubject) {
        otpSubject.textContent = "";
    }

    if (timer) {
        timer.textContent = "05:00";
    }
}


function resetGenerateOtpButton() {
    const generateButton = document.getElementById(
        "generateOtpButton"
    );

    if (!generateButton) {
        return;
    }

    generateButton.disabled = false;

    generateButton.innerHTML = `
        <i class="fa-solid fa-location-crosshairs"></i>
        <span>Generate OTP</span>
    `;
}

function startOtpStatusPolling() {
    stopOtpStatusPolling();

    loadOtpAttendanceStatus();

    otpStatusInterval = window.setInterval(
        loadOtpAttendanceStatus,
        3000
    );
}


function stopOtpStatusPolling() {
    if (otpStatusInterval) {
        clearInterval(otpStatusInterval);
        otpStatusInterval = null;
    }
}


function loadOtpAttendanceStatus() {
    if (!activeOtpSessionId) {
        return;
    }

    fetch(
        `/teacher/attendance/otp-status/${encodeURIComponent(
            activeOtpSessionId
        )}`
    )
        .then(function (response) {
            if (!response.ok) {
                throw new Error(
                    "Unable to load OTP status."
                );
            }

            return response.json();
        })
        .then(function (data) {
            if (!data.success) {
                return;
            }

            updateOtpLiveCounts(data);

            if (!data.is_active) {
                stopOtpStatusPolling();
            }
        })
        .catch(function (error) {
            console.error(
                "OTP live status error:",
                error
            );
        });
}


function updateOtpLiveCounts(data) {
    const presentElement = document.getElementById(
        "otpPresentCount"
    );

    const absentElement = document.getElementById(
        "otpAbsentCount"
    );

    const totalElement = document.getElementById(
        "otpTotalCount"
    );

    if (presentElement) {
        presentElement.textContent =
            Number(data.present || 0);
    }

    if (absentElement) {
        absentElement.textContent =
            Number(data.absent || 0);
    }

    if (totalElement) {
        totalElement.textContent =
            Number(data.total || 0);
    }
}