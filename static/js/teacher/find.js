"use strict";

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

function loadTeacherStudents() {
    const yearSelect = document.getElementById("yearSelect");
    const content = document.getElementById("studentsContent");

    if (!yearSelect || !content) {
        return;
    }

    const year = yearSelect.value;

    if (!year) {
        content.innerHTML = `
            <div class="result-empty">
                Select year to view students
            </div>
        `;
        return;
    }

    content.innerHTML = `
        <div class="result-empty">
            Loading students...
        </div>
    `;

    fetch(`/teacher/students/${encodeURIComponent(year)}`)
        .then(function (response) {
            if (!response.ok) {
                throw new Error("Unable to load students");
            }

            return response.json();
        })
        .then(function (students) {
            if (!Array.isArray(students) || students.length === 0) {
                content.innerHTML = `
                    <div class="result-empty">
                        No students found
                    </div>
                `;
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
                                <th>Username</th>
                                <th>Phone No</th>
                            </tr>
                        </thead>

                        <tbody>
            `;

            students.forEach(function (student, index) {
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

                        <td data-label="Username">
                            ${escapeHtml(student.username || "-")}
                        </td>

                        <td data-label="Phone No">
                            ${escapeHtml(student.phone || "Not Available")}
                        </td>
                    </tr>
                `;
            });

            html += `
                        </tbody>
                    </table>
                </div>
            `;

            content.innerHTML = html;
        })
        .catch(function (error) {
            console.error("Teacher students error:", error);

            content.innerHTML = `
                <div class="result-empty">
                    Something went wrong. Please try again.
                </div>
            `;
        });
}

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

function searchStudents() {

    const keyword = document
        .getElementById("studentSearch")
        .value
        .trim();

    const container = document.getElementById(
        "studentsContainer"
    );

    if (keyword.length === 0) {

        container.innerHTML = `
            <div class="result-empty">
                Start typing to search students
            </div>
        `;

        return;
    }

    container.innerHTML = `
        <div class="result-empty">
            Searching...
        </div>
    `;

    fetch(
        `/teacher/search/${encodeURIComponent(keyword)}`
    )
        .then(response => response.json())
        .then(data => {

            if (!Array.isArray(data) || data.length === 0) {

                container.innerHTML = `
                    <div class="result-empty">
                        No students found
                    </div>
                `;

                return;
            }

            let html = `
                <div class="table-wrap">

                <table>

                    <thead>

                        <tr>

                            <th>Name</th>
                            <th>Roll No</th>
                            <th>Department</th>
                            <th>Year</th>
                            <th>Username</th>

                        </tr>

                    </thead>

                    <tbody>
            `;

            data.forEach(student => {

                html += `
                    <tr>

                        <td>
                            ${escapeHtml(student.name)}
                        </td>

                        <td>
                            ${escapeHtml(student.roll)}
                        </td>

                        <td>
                            ${escapeHtml(student.department)}
                        </td>

                        <td>
                            ${escapeHtml(student.year)}
                        </td>

                        <td>
                            ${escapeHtml(student.username)}
                        </td>

                    </tr>
                `;
            });

            html += `
                    </tbody>

                </table>

                </div>
            `;

            container.innerHTML = html;
        })
        .catch(function () {

            container.innerHTML = `
                <div class="result-empty">
                    Unable to search students.
                </div>
            `;

        });
}