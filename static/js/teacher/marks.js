"use strict";

let marksData = [];


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

function showMarksMessage(message) {
    const table = document.getElementById("marksTable");

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
   Load Subjects
========================================================= */

function loadMarksSubjects() {
    const yearSelect = document.getElementById("yearSelect");
    const subjectSelect = document.getElementById("subjectSelect");

    if (!yearSelect || !subjectSelect) {
        return;
    }

    const year = yearSelect.value;

    marksData = [];

    subjectSelect.disabled = true;

    subjectSelect.innerHTML = `
        <option value="">
            Select Subject
        </option>
    `;

    showMarksMessage(
        "Select year and subject to upload marks"
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

    fetch(`/teacher/subjects/${encodeURIComponent(year)}`)
        .then(function (response) {
            if (!response.ok) {
                throw new Error("Unable to load subjects");
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
                const option = document.createElement("option");

                option.value = String(subject.id);
                option.textContent =
                    subject.name || "Unnamed Subject";

                subjectSelect.appendChild(option);
            });

            subjectSelect.disabled = false;
        })
        .catch(function (error) {
            console.error("Load marks subjects error:", error);

            subjectSelect.innerHTML = `
                <option value="">
                    Error loading subjects
                </option>
            `;

            showMarksMessage(
                "Unable to load subjects. Please try again."
            );
        });
}


/* =========================================================
   Load Students
========================================================= */

function loadMarksStudents() {
    const yearSelect = document.getElementById("yearSelect");
    const subjectSelect = document.getElementById("subjectSelect");

    if (!yearSelect || !subjectSelect) {
        return;
    }

    const year = yearSelect.value;
    const subject = subjectSelect.value;

    marksData = [];

    if (!year || !subject) {
        showMarksMessage(
            "Select year and subject to upload marks"
        );

        return;
    }

    showMarksMessage("Loading students...");

    fetch(
        `/teacher/marks/students/` +
        `${encodeURIComponent(year)}/` +
        `${encodeURIComponent(subject)}`
    )
        .then(function (response) {
            if (!response.ok) {
                throw new Error("Unable to load students");
            }

            return response.json();
        })
        .then(function (students) {
            if (
                !Array.isArray(students) ||
                students.length === 0
            ) {
                showMarksMessage("No students found");
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
                                <th>Internal / 30</th>
                                <th>Theory / 70</th>
                            </tr>
                        </thead>

                        <tbody>
            `;

            students.forEach(function (student, index) {
                const studentId = Number(student.id);

                const internalValue =
                    student.internal === null ||
                    student.internal === undefined
                        ? 0
                        : Number(student.internal);

                const theoryValue =
                    student.theory === null ||
                    student.theory === undefined
                        ? 0
                        : Number(student.theory);

                marksData.push({
                    student_id: studentId
                });

                html += `
                    <tr>
                        <td data-label="#">
                            ${index + 1}
                        </td>

                        <td data-label="Name">
                            ${escapeHtml(student.name || "-")}
                        </td>

                        <td data-label="Roll No">
                            ${escapeHtml(student.roll || "-")}
                        </td>

                        <td data-label="Internal / 30">
                            <input
                                type="number"
                                min="0"
                                max="30"
                                step="1"
                                value="${internalValue}"
                                id="internal${studentId}"
                                inputmode="numeric"
                            >
                        </td>

                        <td data-label="Theory / 70">
                            <input
                                type="number"
                                min="0"
                                max="70"
                                step="1"
                                value="${theoryValue}"
                                id="theory${studentId}"
                                inputmode="numeric"
                            >
                        </td>
                    </tr>
                `;
            });

            html += `
                        </tbody>
                    </table>
                </div>
            `;

            const table = document.getElementById("marksTable");

            if (table) {
                table.innerHTML = html;
            }
        })
        .catch(function (error) {
            console.error("Load marks students error:", error);

            showMarksMessage(
                "Unable to load students. Please try again."
            );
        });
}


/* =========================================================
   Submit Marks
========================================================= */

function submitMarks() {
    const yearSelect = document.getElementById("yearSelect");
    const subjectSelect = document.getElementById("subjectSelect");
    const submitButton = document.getElementById(
        "submitMarksButton"
    );

    if (!yearSelect || !subjectSelect) {
        return;
    }

    const year = yearSelect.value;
    const subject = subjectSelect.value;

    if (!year || !subject) {
        alert("Please select year and subject!");
        return;
    }

    if (marksData.length === 0) {
        alert("No students found!");
        return;
    }

    const finalMarks = [];

    for (const student of marksData) {
        const internalInput = document.getElementById(
            "internal" + student.student_id
        );

        const theoryInput = document.getElementById(
            "theory" + student.student_id
        );

        if (!internalInput || !theoryInput) {
            alert("One or more marks fields are missing.");
            return;
        }

        const internalText = internalInput.value.trim();
        const theoryText = theoryInput.value.trim();

        if (internalText === "" || theoryText === "") {
            alert("Please enter all student marks.");

            if (internalText === "") {
                internalInput.focus();
            } else {
                theoryInput.focus();
            }

            return;
        }

        const internal = Number(internalText);
        const theory = Number(theoryText);

        if (
            !Number.isFinite(internal) ||
            internal < 0 ||
            internal > 30
        ) {
            alert("Internal marks must be between 0 and 30.");
            internalInput.focus();
            return;
        }

        if (
            !Number.isFinite(theory) ||
            theory < 0 ||
            theory > 70
        ) {
            alert("Theory marks must be between 0 and 70.");
            theoryInput.focus();
            return;
        }

        finalMarks.push({
            student_id: student.student_id,
            internal: internal,
            theory: theory
        });
    }

    const confirmed = window.confirm(
        "Are you sure you want to submit marks?"
    );

    if (!confirmed) {
        return;
    }

    if (submitButton) {
        submitButton.disabled = true;

        submitButton.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            <span>Submitting...</span>
        `;
    }

    fetch("/teacher/marks/submit", {
        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            subject_id: subject,
            marks: finalMarks
        })
    })
        .then(function (response) {
            if (!response.ok) {
                throw new Error("Unable to submit marks");
            }

            return response.json();
        })
        .then(function (data) {
            if (data.success) {
                alert(
                    "Marks uploaded successfully!\n\n" +
                    "Students Updated: " +
                    data.updated
                );

                loadMarksStudents();
            } else {
                alert(
                    data.message ||
                    "Something went wrong!"
                );
            }
        })
        .catch(function (error) {
            console.error("Submit marks error:", error);

            alert("Server error. Please try again.");
        })
        .finally(function () {
            if (submitButton) {
                submitButton.disabled = false;

                submitButton.innerHTML = `
                    <i class="fa-solid fa-check"></i>
                    <span>Submit Marks</span>
                `;
            }
        });
}


/* =========================================================
   Page Initialization
========================================================= */

document.addEventListener("DOMContentLoaded", function () {
    const subjectSelect = document.getElementById(
        "subjectSelect"
    );

    if (subjectSelect) {
        subjectSelect.disabled = true;
    }
});