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

function getFilters() {
    const role = document.getElementById("roleFilter");
    const dept = document.getElementById("deptFilter");
    const year = document.getElementById("yearFilter");

    return {
        role: role ? role.value : "all",
        dept: dept ? dept.value : "all",
        year: year ? year.value : "all",
    };
}

function filtersActive() {
    const f = getFilters();
    return f.role !== "all" || f.dept !== "all" || f.year !== "all";
}

function liveSearch() {
    const searchInput = document.getElementById("searchInput");
    const result = document.getElementById("resultContent");

    if (!searchInput || !result) {
        console.error("Search input or result container not found.");
        return;
    }

    const keyword = searchInput.value.trim();

    if (keyword.length === 0 && !filtersActive()) {
        result.innerHTML =
            '<div class="result-empty">Start typing to search...</div>';
        return;
    }

    result.innerHTML =
        '<div class="result-empty">Searching...</div>';

    const filters = getFilters();
    const params = new URLSearchParams();
    params.set("keyword", keyword);
    params.set("role", filters.role);
    params.set("dept", filters.dept);
    params.set("year", filters.year);

    fetch(`/admin/search?${params.toString()}`)
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
                    '<div class="result-empty">No results found</div>';
                return;
            }

            const hasStudents = data.some(function (item) {
                return item.type === "Student";
            });
            const hasTeachers = data.some(function (item) {
                return item.type === "Teacher";
            });

            const showYearRoll = !hasTeachers && hasStudents;
            const showSubjects = !hasStudents && hasTeachers;

            let headers = `
                            <tr>
                                <th>Type</th>
                                <th>Name</th>
                                <th>Department</th>
            `;

            if (showYearRoll) {
                headers += `
                                <th>Year</th>
                                <th>Roll No</th>
                `;
            }

            if (showSubjects) {
                headers += `
                                <th>Subjects</th>
                `;
            }

            headers += `
                                <th>Username</th>
                                <th>Phone</th>
                            </tr>
            `;

            let html = `
                <div class="table-wrap">
                    <table>
                        <thead>
                            ${headers}
                        </thead>

                        <tbody>
            `;

            data.forEach(function (item) {
                let subjects = "";

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
                `;

                if (showYearRoll) {
                    html += `
                        <td data-label="Year">
                            ${escapeHtml(item.year || "-")}
                        </td>

                        <td data-label="Roll No">
                            ${escapeHtml(item.roll || "-")}
                        </td>
                    `;
                }

                if (showSubjects) {
                    html += `
                        <td data-label="Subjects">
                            ${subjects}
                        </td>
                    `;
                }

                html += `
                        <td data-label="Username">
                            ${escapeHtml(item.username || "-")}
                        </td>

                        <td data-label="Phone">
                            ${escapeHtml(item.phone || "N/A")}
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

function updateYearField() {
    const roleFilter = document.getElementById("roleFilter");
    const yearFilter = document.getElementById("yearFilter");

    if (!roleFilter || !yearFilter) {
        return;
    }

    if (roleFilter.value === "teacher") {
        yearFilter.value = "all";
        yearFilter.disabled = true;
    } else {
        yearFilter.disabled = false;
    }
}

function resetFilters() {
    const searchInput = document.getElementById("searchInput");
    const roleFilter = document.getElementById("roleFilter");
    const deptFilter = document.getElementById("deptFilter");
    const yearFilter = document.getElementById("yearFilter");

    if (searchInput) {
        searchInput.value = "";
    }
    if (roleFilter) {
        roleFilter.value = "all";
    }
    if (deptFilter) {
        deptFilter.value = "all";
    }
    if (yearFilter) {
        yearFilter.value = "all";
    }

    updateYearField();
    liveSearch();
}

document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("searchInput");
    const roleFilter = document.getElementById("roleFilter");
    const deptFilter = document.getElementById("deptFilter");
    const yearFilter = document.getElementById("yearFilter");
    const clearFiltersBtn = document.getElementById("clearFiltersBtn");

    if (!searchInput) {
        console.error("Search input was not found.");
        return;
    }

    updateYearField();

    searchInput.addEventListener("input", liveSearch);

    if (roleFilter) {
        roleFilter.addEventListener("change", function () {
            updateYearField();
            liveSearch();
        });
    }

    if (deptFilter) {
        deptFilter.addEventListener("change", liveSearch);
    }

    if (yearFilter) {
        yearFilter.addEventListener("change", liveSearch);
    }

    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener("click", resetFilters);
    }
});