"use strict";

/* =========================================================
   Utility Functions
========================================================= */

function escapeHtml(value) {
    const element = document.createElement("div");

    element.textContent =
        value === null || value === undefined
            ? ""
            : String(value);

    return element.innerHTML;
}

function showFormError(message) {
    const errorElement = document.getElementById(
        "teacherFormError"
    );

    if (!errorElement) {
        return;
    }

    errorElement.textContent = message;
    errorElement.hidden = false;

    errorElement.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}

function hideFormError() {
    const errorElement = document.getElementById(
        "teacherFormError"
    );

    if (!errorElement) {
        return;
    }

    errorElement.textContent = "";
    errorElement.hidden = true;
}


/* =========================================================
   Subject Configuration
========================================================= */

const subjectYearConfig = {
    FY: {
        yearId: 1,
        containerId: "fySubjectsContainer",
        counterId: "fySubjectCounter",
        inputName: "fy_subject_ids"
    },

    SY: {
        yearId: 2,
        containerId: "sySubjectsContainer",
        counterId: "sySubjectCounter",
        inputName: "sy_subject_ids"
    },

    TY: {
        yearId: 3,
        containerId: "tySubjectsContainer",
        counterId: "tySubjectCounter",
        inputName: "ty_subject_ids"
    }
};

function getYearConfig(year) {
    const normalizedYear = String(year).toUpperCase();

    return subjectYearConfig[normalizedYear] || null;
}

function getSubjectContainer(year) {
    const config = getYearConfig(year);

    if (!config) {
        return null;
    }

    return document.getElementById(config.containerId);
}

function getSubjectCounter(year) {
    const config = getYearConfig(year);

    if (!config) {
        return null;
    }

    return document.getElementById(config.counterId);
}


/* =========================================================
   Subject Container Messages
========================================================= */

function showSubjectContainerMessage(
    year,
    message,
    iconClass = "fa-solid fa-circle-info"
) {
    const container = getSubjectContainer(year);

    if (!container) {
        return;
    }

    container.innerHTML = `
        <div class="subject-loading-message">
            <i class="${escapeHtml(iconClass)}"></i>

            <span>
                ${escapeHtml(message)}
            </span>
        </div>
    `;
}

function resetSubjectContainer(year, message) {
    showSubjectContainerMessage(
        year,
        message,
        "fa-solid fa-circle-info"
    );

    updateSubjectCounter(year);
}

function resetAllSubjectContainers(message) {
    resetSubjectContainer("FY", message);
    resetSubjectContainer("SY", message);
    resetSubjectContainer("TY", message);
}


/* =========================================================
   Subject Selection Counters
========================================================= */

function getCheckedSubjects(year) {
    const config = getYearConfig(year);
    const container = getSubjectContainer(year);

    if (!config || !container) {
        return [];
    }

    return Array.from(
        container.querySelectorAll(
            `input[name="${config.inputName}"]:checked`
        )
    );
}

function updateSubjectCounter(year) {
    const counter = getSubjectCounter(year);

    if (!counter) {
        return;
    }

    const selectedCount = getCheckedSubjects(year).length;

    counter.textContent = `${selectedCount}/6 Selected`;

    if (selectedCount >= 1 && selectedCount <= 6) {
        counter.classList.add("complete");
    } else {
        counter.classList.remove("complete");
    }
}

function resetAllSubjectCounters() {
    updateSubjectCounter("FY");
    updateSubjectCounter("SY");
    updateSubjectCounter("TY");
}


/* =========================================================
   Create Subject Checkboxes
========================================================= */

function createSubjectCheckboxes(year, subjects) {
    const config = getYearConfig(year);
    const container = getSubjectContainer(year);

    if (!config || !container) {
        return;
    }

    container.innerHTML = "";

    if (!Array.isArray(subjects) || subjects.length === 0) {
        showSubjectContainerMessage(
            year,
            "No subjects found",
            "fa-solid fa-circle-exclamation"
        );

        updateSubjectCounter(year);
        return;
    }

    subjects.forEach(function (subject) {
        const subjectId = String(subject.id);

        const checkboxId =
            `${year.toLowerCase()}Subject${subjectId}`;

        const checkboxLabel = document.createElement("label");

        checkboxLabel.className = "subject-checkbox-card";
        checkboxLabel.setAttribute("for", checkboxId);

        checkboxLabel.innerHTML = `
            <input
                type="checkbox"
                id="${escapeHtml(checkboxId)}"
                name="${escapeHtml(config.inputName)}"
                value="${escapeHtml(subjectId)}"
                class="subject-checkbox"
                data-year="${escapeHtml(year)}"
            >

            <span
                class="custom-checkbox"
                aria-hidden="true"
            >
                <i class="fa-solid fa-check"></i>
            </span>

            <span class="subject-checkbox-name">
                ${escapeHtml(
                    subject.name || "Unnamed Subject"
                )}
            </span>
        `;

        container.appendChild(checkboxLabel);
    });

    attachSubjectCheckboxEvents(year);
    updateSubjectCounter(year);
}

function attachSubjectCheckboxEvents(year) {
    const container = getSubjectContainer(year);

    if (!container) {
        return;
    }

    const checkboxes = container.querySelectorAll(
        ".subject-checkbox"
    );

    checkboxes.forEach(function (checkbox) {
        checkbox.addEventListener(
            "change",
            handleSubjectCheckboxChange
        );
    });
}


/* =========================================================
   Subject Checkbox Selection
========================================================= */

function handleSubjectCheckboxChange(event) {
    const checkbox = event.target;
    const year = checkbox.dataset.year;

    if (!year) {
        return;
    }

    const selectedSubjects = getCheckedSubjects(year);

    if (selectedSubjects.length > 6) {
        checkbox.checked = false;

        showFormError(
            `You can select maximum 6 subjects for ${year}.`
        );

        updateSubjectCounter(year);
        return;
    }

    hideFormError();
    updateSubjectCounter(year);
}


/* =========================================================
   Load Subjects from Backend
========================================================= */

async function loadSubjectsByYear(
    departmentId,
    year,
    yearId
) {
    showSubjectContainerMessage(
        year,
        "Loading subjects...",
        "fa-solid fa-spinner fa-spin"
    );

    try {
        const response = await fetch(
            `/admin/subjects/list/${encodeURIComponent(
                departmentId
            )}/${encodeURIComponent(yearId)}`,
            {
                method: "GET",
                headers: {
                    Accept: "application/json"
                }
            }
        );

        if (!response.ok) {
            throw new Error(
                `Unable to load ${year} subjects`
            );
        }

        const subjects = await response.json();

        if (!Array.isArray(subjects)) {
            throw new Error(
                `Invalid ${year} subjects response`
            );
        }

        createSubjectCheckboxes(year, subjects);

    } catch (error) {
        console.error(error);

        showSubjectContainerMessage(
            year,
            "Error loading subjects",
            "fa-solid fa-triangle-exclamation"
        );

        updateSubjectCounter(year);

        showFormError(
            `Unable to load ${year} subjects. Please try again.`
        );
    }
}

async function loadAllSubjects() {
    const departmentSelect = document.getElementById(
        "deptSelectAdd"
    );

    if (!departmentSelect) {
        return;
    }

    hideFormError();

    const departmentId = departmentSelect.value;

    if (!departmentId) {
        resetAllSubjectContainers(
            "Select Department First"
        );

        resetAllSubjectCounters();
        return;
    }

    await Promise.all([
        loadSubjectsByYear(
            departmentId,
            "FY",
            subjectYearConfig.FY.yearId
        ),

        loadSubjectsByYear(
            departmentId,
            "SY",
            subjectYearConfig.SY.yearId
        ),

        loadSubjectsByYear(
            departmentId,
            "TY",
            subjectYearConfig.TY.yearId
        )
    ]);
}


/* =========================================================
   Teacher Form Validation
========================================================= */

function validateTeacherName() {
    const teacherName = document.getElementById(
        "teacherName"
    );

    if (!teacherName) {
        return false;
    }

    const name = teacherName.value.trim();

    if (name.length < 2) {
        showFormError(
            "Please enter a valid teacher name."
        );

        teacherName.focus();
        return false;
    }

    teacherName.value = name;

    return true;
}

function validateTeacherPhone() {
    const teacherPhone = document.getElementById(
        "teacherPhone"
    );

    if (!teacherPhone) {
        return false;
    }

    const phone = teacherPhone.value.trim();
    const phonePattern = /^[0-9]{10}$/;

    if (!phonePattern.test(phone)) {
        showFormError(
            "Please enter a valid 10-digit phone number."
        );

        teacherPhone.focus();
        return false;
    }

    teacherPhone.value = phone;

    return true;
}

function validateDepartment() {
    const departmentSelect = document.getElementById(
        "deptSelectAdd"
    );

    if (!departmentSelect || !departmentSelect.value) {
        showFormError(
            "Please select a department."
        );

        if (departmentSelect) {
            departmentSelect.focus();
        }

        return false;
    }

    return true;
}

function validateYearSubjects(year) {
    const selectedSubjects = getCheckedSubjects(year);

    if (selectedSubjects.length === 0) {
        showFormError(
            `Please select at least 1 subject for ${year}.`
        );

        const container = getSubjectContainer(year);

        if (container) {
            container.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        }

        return false;
    }

    if (selectedSubjects.length > 6) {
        showFormError(
            `You can select maximum 6 subjects for ${year}.`
        );

        return false;
    }

    return true;
}

function validateTeacherForm() {
    hideFormError();

    if (!validateTeacherName()) {
        return false;
    }

    if (!validateTeacherPhone()) {
        return false;
    }

    if (!validateDepartment()) {
        return false;
    }

    if (!validateYearSubjects("FY")) {
        return false;
    }

    if (!validateYearSubjects("SY")) {
        return false;
    }

    if (!validateYearSubjects("TY")) {
        return false;
    }

    return true;
}

function handleTeacherFormSubmit(event) {
    if (!validateTeacherForm()) {
        event.preventDefault();
        return;
    }

    const confirmed = window.confirm(
        "Are you sure you want to add this teacher?"
    );

    if (!confirmed) {
        event.preventDefault();
        return;
    }

    const submitButton = document.getElementById(
        "addTeacherButton"
    );

    if (submitButton) {
        submitButton.disabled = true;

        submitButton.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>

            <span>
                Adding Teacher...
            </span>
        `;
    }
}


/* =========================================================
   Phone Input Restriction
========================================================= */

function restrictPhoneInput(event) {
    const input = event.target;

    input.value = input.value
        .replace(/\D/g, "")
        .slice(0, 10);
}


/* =========================================================
   Remove Teacher List Utilities
========================================================= */

function showTeacherListMessage(
    message,
    iconClass = ""
) {
    const content = document.getElementById(
        "teachersListContent"
    );

    if (!content) {
        return;
    }

    const icon = iconClass
        ? `<i class="${escapeHtml(iconClass)}"></i>`
        : "";

    content.innerHTML = `
        <div class="result-empty">
            ${icon}

            <p>
                ${escapeHtml(message)}
            </p>
        </div>
    `;
}

function formatTeacherSubjects(
    year,
    subjectText
) {
    const subjects =
        subjectText && String(subjectText).trim()
            ? String(subjectText).trim()
            : "Not assigned";

    return `
        <div class="teacher-subject-year">

            <span class="teacher-year-badge">
                ${escapeHtml(year)}
            </span>

            <span class="teacher-subject-text">
                ${escapeHtml(subjects)}
            </span>

        </div>
    `;
}

function createTeacherTable(teachers) {
    let rows = "";

    teachers.forEach(function (teacher, index) {
        const teacherId = escapeHtml(teacher.id);

        const teacherName = escapeHtml(
            teacher.name || "-"
        );

        const teacherUsername = escapeHtml(
            teacher.username || "-"
        );

        const teacherPassword = escapeHtml(
            teacher.password || "-"
        );

        const teacherSubjects = `
            <div class="teacher-subjects-list">

                ${formatTeacherSubjects(
                    "FY",
                    teacher.fy_subjects
                )}

                ${formatTeacherSubjects(
                    "SY",
                    teacher.sy_subjects
                )}

                ${formatTeacherSubjects(
                    "TY",
                    teacher.ty_subjects
                )}

            </div>
        `;

        rows += `
            <tr>

                <td data-label="#">
                    ${index + 1}
                </td>

                <td data-label="Name">
                    ${teacherName}
                </td>

                <td data-label="Username">
                    ${teacherUsername}
                </td>

                <td data-label="Subjects">
                    ${teacherSubjects}
                </td>

                <td data-label="Password">
                    ${teacherPassword}
                </td>

                <td data-label="Action">

                    <form
                        method="POST"
                        action="/admin/teachers/remove"
                        class="remove-teacher-form"
                    >

                        <input
                            type="hidden"
                            name="teacher_id"
                            value="${teacherId}"
                        >

                        <button
                            type="submit"
                            class="remove-btn"
                        >

                            <i class="fa-solid fa-trash"></i>

                            <span>
                                Remove
                            </span>

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
                        <th>Username</th>
                        <th>Subjects</th>
                        <th>Password</th>
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

function attachRemoveTeacherEvents() {
    const removeForms = document.querySelectorAll(
        ".remove-teacher-form"
    );

    removeForms.forEach(function (form) {
        form.addEventListener(
            "submit",
            function (event) {
                const confirmed = window.confirm(
                    "Are you sure you want to remove this teacher?"
                );

                if (!confirmed) {
                    event.preventDefault();
                    return;
                }

                const removeButton = form.querySelector(
                    ".remove-btn"
                );

                if (removeButton) {
                    removeButton.disabled = true;

                    removeButton.innerHTML = `
                        <i class="fa-solid fa-spinner fa-spin"></i>

                        <span>
                            Removing...
                        </span>
                    `;
                }
            }
        );
    });
}


/* =========================================================
   Load Teacher List
========================================================= */

let teacherSearchTimer = null;

async function loadTeachers() {
    const searchInput = document.getElementById(
        "teacherSearch"
    );

    const content = document.getElementById(
        "teachersListContent"
    );

    if (!searchInput || !content) {
        return;
    }

    const keyword = searchInput.value.trim();

    if (!keyword) {
        showTeacherListMessage(
            "Start typing to search teachers",
            "fa-solid fa-magnifying-glass"
        );

        return;
    }

    showTeacherListMessage(
        "Searching teachers...",
        "fa-solid fa-spinner fa-spin"
    );

    try {
        const response = await fetch(
            `/admin/teachers/search/${encodeURIComponent(keyword)}`,
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
                "Unable to search teachers"
            );
        }

        if (
            !Array.isArray(data) ||
            data.length === 0
        ) {
            showTeacherListMessage(
                "No teachers found",
                "fa-solid fa-user-slash"
            );

            return;
        }

        content.innerHTML = createTeacherTable(data);

        attachRemoveTeacherEvents();

    } catch (error) {
        console.error(
            "Teacher search error:",
            error
        );

        showTeacherListMessage(
            error.message ||
            "Something went wrong. Please try again.",
            "fa-solid fa-triangle-exclamation"
        );
    }
}

function handleTeacherSearchInput() {
    if (teacherSearchTimer) {
        clearTimeout(teacherSearchTimer);
    }

    teacherSearchTimer = setTimeout(
        loadTeachers,
        350
    );
}


/* =========================================================
   Page Initialization
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {
        const departmentAdd = document.getElementById(
            "deptSelectAdd"
        );

        const teacherForm = document.getElementById(
            "addTeacherForm"
        );

        const teacherPhone = document.getElementById(
            "teacherPhone"
        );

        const teacherSearch = document.getElementById(
            "teacherSearch"
        );

        if (departmentAdd) {
            departmentAdd.addEventListener(
                "change",
                loadAllSubjects
            );
        }

        if (teacherSearch) {
            teacherSearch.addEventListener(
                "input",
                handleTeacherSearchInput
            );
        }

        if (teacherForm) {
            teacherForm.addEventListener(
                "submit",
                handleTeacherFormSubmit
            );
        }

        if (teacherPhone) {
            teacherPhone.addEventListener(
                "input",
                restrictPhoneInput
            );
        }

        resetAllSubjectContainers(
            "Select Department First"
        );

        resetAllSubjectCounters();
    }
);