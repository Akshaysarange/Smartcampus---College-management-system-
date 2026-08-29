"use strict";

let studentSearchTimer = null;

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

function showStudentListMessage(message) {
    const content = document.getElementById(
        "studentsListContent"
    );

    if (!content) {
        return;
    }

    content.innerHTML = `
        <div class="result-empty">
            ${escapeHtml(message)}
        </div>
    `;
}

function attachRemoveStudentEvents() {
    const removeForms = document.querySelectorAll(
        ".remove-student-form"
    );

    removeForms.forEach(function (form) {
        form.addEventListener("submit", function (event) {
            const confirmed = window.confirm(
                "Are you sure you want to remove this student?"
            );

            if (!confirmed) {
                event.preventDefault();
                return;
            }

            const button = form.querySelector(".remove-btn");

            if (button) {
                button.disabled = true;

                button.innerHTML = `
                    <i class="fa-solid fa-spinner fa-spin"></i>
                    Removing...
                `;
            }
        });
    });
}

function createStudentsTable(students) {
    let rows = "";

    students.forEach(function (student, index) {
        const studentId = escapeHtml(student.id);
        const studentName = escapeHtml(student.name || "-");
        const studentRoll = escapeHtml(student.roll || "-");
        const studentUsername = escapeHtml(
            student.username || "-"
        );
        const studentPhone = escapeHtml(
            student.phone || "N/A"
        );
        const studentDepartment = escapeHtml(
            student.department || "-"
        );
        const studentYear = escapeHtml(
            student.year || "-"
        );

        rows += `
            <tr>
                <td data-label="#">
                    ${index + 1}
                </td>

                <td data-label="Name">
                    ${studentName}
                </td>

                <td data-label="Roll No">
                    ${studentRoll}
                </td>

                <td data-label="Username">
                    ${studentUsername}
                </td>

                <td data-label="Phone">
                    ${studentPhone}
                </td>

                <td data-label="Department">
                    ${studentDepartment}
                </td>

                <td data-label="Year">
                    ${studentYear}
                </td>

                <td data-label="Action">
                    <form
                        method="POST"
                        action="/admin/students/remove"
                        class="remove-student-form"
                    >
                        <input
                            type="hidden"
                            name="student_id"
                            value="${studentId}"
                        >

                        <button
                            type="submit"
                            class="remove-btn"
                        >
                            <i class="fa-solid fa-trash"></i>
                            Remove
                        </button>
                    </form>
                </td>
            </tr>
        `;
    });

    return `
        <div class="table-wrap">
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Roll No</th>
                        <th>Username</th>
                        <th>Phone</th>
                        <th>Department</th>
                        <th>Year</th>
                        <th>Action</th>
                    </tr>
                </thead>

                <tbody>
                    ${rows}
                </tbody>
            </table>
        </div>
    `;
}

async function loadStudents() {
    const searchInput = document.getElementById(
        "studentSearch"
    );

    const content = document.getElementById(
        "studentsListContent"
    );

    if (!searchInput || !content) {
        return;
    }

    const keyword = searchInput.value.trim();

    if (!keyword) {
        showStudentListMessage(
            "Start typing to search students"
        );
        return;
    }

    showStudentListMessage(
        "Searching students..."
    );

    try {
        const response = await fetch(
            `/admin/students/search/${encodeURIComponent(keyword)}`,
            {
                method: "GET",
                headers: {
                    Accept: "application/json"
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message ||
                "Unable to search students"
            );
        }

        if (
            !Array.isArray(data) ||
            data.length === 0
        ) {
            showStudentListMessage(
                "No students found"
            );
            return;
        }

        content.innerHTML = createStudentsTable(data);

        attachRemoveStudentEvents();

    } catch (error) {
        console.error(
            "Student search error:",
            error
        );

        showStudentListMessage(
            error.message ||
            "Something went wrong. Please try again."
        );
    }
}

function handleStudentSearchInput() {
    if (studentSearchTimer) {
        clearTimeout(studentSearchTimer);
    }

    studentSearchTimer = setTimeout(
        loadStudents,
        350
    );
}

document.addEventListener("DOMContentLoaded", function () {
    const studentSearch = document.getElementById(
        "studentSearch"
    );

    const phoneInput = document.getElementById(
        "studentPhone"
    );

    if (studentSearch) {
        studentSearch.addEventListener(
            "input",
            handleStudentSearchInput
        );
    }

    if (phoneInput) {
        phoneInput.addEventListener(
            "input",
            function () {
                phoneInput.value = phoneInput.value
                    .replace(/\D/g, "")
                    .slice(0, 10);
            }
        );
    }
});