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

function liveSearch() {
    const searchInput = document.getElementById("searchInput");
    const result = document.getElementById("resultContent");

    if (!searchInput || !result) {
        console.error("Search input or result container not found.");
        return;
    }

    const keyword = searchInput.value.trim();

    if (keyword.length === 0) {
        result.innerHTML =
            '<div class="result-empty">Start typing to search...</div>';
        return;
    }

    result.innerHTML =
        '<div class="result-empty">Searching...</div>';

    fetch(`/admin/search/${encodeURIComponent(keyword)}`)
        .then(function (response) {
            return response.json().then(function (data) {
                if (!response.ok) {
                    throw new Error(
                        data.message || "Unable to search records."
                    );
                }

                return data;
            });
        })
        .then(function (data) {
            if (!Array.isArray(data) || data.length === 0) {
                result.innerHTML =
                    '<div class="result-empty">No record found</div>';
                return;
            }

            let html = `
                <div class="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Type</th>
                                <th>Name</th>
                                <th>Department</th>
                                <th>Year</th>
                                <th>Roll No</th>
                                <th>Subjects</th>
                                <th>Username</th>
                                <th>Phone</th>
                                <th>Password</th>
                            </tr>
                        </thead>

                        <tbody>
            `;

            data.forEach(function (item) {
                let subjects = `
                    <span class="not-applicable">-</span>
                `;

                if (item.type === "Teacher") {
                    subjects = `
                        <div class="teacher-subjects-list">

                            <div class="teacher-subject-year">
                                <strong>FY:</strong>
                                <span>
                                    ${escapeHtml(
                                        item.fy_subjects || "Not Assigned"
                                    )}
                                </span>
                            </div>

                            <div class="teacher-subject-year">
                                <strong>SY:</strong>
                                <span>
                                    ${escapeHtml(
                                        item.sy_subjects || "Not Assigned"
                                    )}
                                </span>
                            </div>

                            <div class="teacher-subject-year">
                                <strong>TY:</strong>
                                <span>
                                    ${escapeHtml(
                                        item.ty_subjects || "Not Assigned"
                                    )}
                                </span>
                            </div>

                        </div>
                    `;
                }

                html += `
                    <tr>
                        <td data-label="Type">
                            ${escapeHtml(item.type || "-")}
                        </td>

                        <td data-label="Name">
                            ${escapeHtml(item.name || "-")}
                        </td>

                        <td data-label="Department">
                            ${escapeHtml(item.department || "-")}
                        </td>

                        <td data-label="Year">
                            ${escapeHtml(item.year || "-")}
                        </td>

                        <td data-label="Roll No">
                            ${escapeHtml(item.roll || "-")}
                        </td>

                        <td data-label="Subjects">
                            ${subjects}
                        </td>

                        <td data-label="Username">
                            ${escapeHtml(item.username || "-")}
                        </td>

                        <td data-label="Phone">
                            ${escapeHtml(item.phone || "N/A")}
                        </td>

                        <td data-label="Password">
                            ${escapeHtml(item.password || "-")}
                        </td>
                    </tr>
                `;
            });

            html += `
                        </tbody>
                    </table>
                </div>
            `;

            result.innerHTML = html;
        })
        .catch(function (error) {
            console.error("Live search error:", error);

            result.innerHTML = `
                <div class="result-empty">
                    ${escapeHtml(
                        error.message ||
                        "Unable to search records. Please try again."
                    )}
                </div>
            `;
        });
}

document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("searchInput");

    if (!searchInput) {
        console.error("Search input was not found.");
        return;
    }

    searchInput.addEventListener("input", liveSearch);
});