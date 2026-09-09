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

function getCsrfToken() {
    const meta = document.querySelector(
        'meta[name="csrf-token"]'
    );

    return meta ? meta.content : "";
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
   Department Multi-Select
========================================================= */

var selectedSubjectsByDept = {};
var activeDeptId = null;
var deptSubjectsCache = {};

function getSelectedDeptIds() {
    var checkboxes = document.querySelectorAll(
        ".dept-checkbox:checked"
    );

    return Array.from(checkboxes).map(function (cb) {
        return cb.value;
    });
}

function updateDeptTriggerText() {
    var trigger = document.getElementById(
        "deptMultiTrigger"
    );

    if (!trigger) {
        return;
    }

    var placeholder = trigger.querySelector(
        ".dept-multi-placeholder"
    );

    if (!placeholder) {
        return;
    }

    var selectedIds = getSelectedDeptIds();

    if (selectedIds.length === 0) {
        placeholder.textContent = "Select Departments";
        placeholder.classList.remove("has-selection");
    } else {
        var deptNames = selectedIds.map(function (id) {
            var label = document.querySelector(
                '.dept-multi-option[data-dept-id="' +
                id + '"] span:last-child'
            );
            return label ? label.textContent : id;
        });

        placeholder.textContent = deptNames.join(", ");
        placeholder.classList.add("has-selection");
    }
}

function updateDeptSavedBadges() {
    var options = document.querySelectorAll(
        ".dept-multi-option"
    );

    options.forEach(function (option) {
        var deptId = option.getAttribute("data-dept-id");
        var saved = selectedSubjectsByDept[deptId];
        var existing = option.querySelector(
            ".dept-saved-badge"
        );

        if (
            saved &&
            (saved.fy.length > 0 ||
                saved.sy.length > 0 ||
                saved.ty.length > 0)
        ) {
            if (!existing) {
                var badge = document.createElement("span");
                badge.className = "dept-saved-badge";
                badge.textContent = "saved";
                option.appendChild(badge);
            }
        } else if (existing) {
            existing.remove();
        }
    });
}

function toggleDeptMultiSelect() {
    var select = document.getElementById(
        "deptMultiSelect"
    );

    if (!select) {
        return;
    }

    select.classList.toggle("open");

    var trigger = document.getElementById(
        "deptMultiTrigger"
    );

    if (trigger) {
        var isOpen = select.classList.contains("open");
        trigger.setAttribute(
            "aria-expanded",
            String(isOpen)
        );
    }
}

function closeDeptMultiSelect() {
    var select = document.getElementById(
        "deptMultiSelect"
    );

    if (select) {
        select.classList.remove("open");

        var trigger = document.getElementById(
            "deptMultiTrigger"
        );

        if (trigger) {
            trigger.setAttribute("aria-expanded", "false");
        }
    }
}


/* =========================================================
   Subject Configuration
========================================================= */

var subjectYearConfig = {
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
    var normalizedYear = String(year).toUpperCase();

    return subjectYearConfig[normalizedYear] || null;
}

function getSubjectContainer(year) {
    var config = getYearConfig(year);

    if (!config) {
        return null;
    }

    return document.getElementById(config.containerId);
}

function getSubjectCounter(year) {
    var config = getYearConfig(year);

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
    iconClass
) {
    iconClass = iconClass || "fa-solid fa-circle-info";

    var container = getSubjectContainer(year);

    if (!container) {
        return;
    }

    container.innerHTML =
        '<div class="subject-loading-message">' +
        '<i class="' + escapeHtml(iconClass) + '"></i>' +
        "<span>" + escapeHtml(message) + "</span>" +
        "</div>";
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
    var container = getSubjectContainer(year);

    if (!container) {
        return [];
    }

    return Array.from(
        container.querySelectorAll(
            '.subject-checkbox[data-year="' +
            year +
            '"]:checked'
        )
    );
}

function getActiveDeptCheckedCount(year) {
    return getCheckedSubjects(year).length;
}

function getAllDeptCheckedCount(year) {
    var config = getYearConfig(year);

    if (!config) {
        return 0;
    }

    var total = 0;
    var deptIds = Object.keys(selectedSubjectsByDept);

    for (var i = 0; i < deptIds.length; i++) {
        var saved = selectedSubjectsByDept[deptIds[i]];

        if (saved) {
            var yearKey = year.toLowerCase();

            if (saved[yearKey]) {
                total += saved[yearKey].length;
            }
        }
    }

    return total;
}

function updateSubjectCounter(year) {
    var counter = getSubjectCounter(year);

    if (!counter) {
        return;
    }

    var activeCount = getActiveDeptCheckedCount(year);
    var totalCount = getAllDeptCheckedCount(year);

    if (activeDeptId && totalCount !== activeCount) {
        counter.textContent =
            activeCount + "/6 (Total: " + totalCount + ")";
    } else {
        counter.textContent = activeCount + "/6 Selected";
    }

    if (totalCount >= 1 && totalCount <= 6) {
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
   Save / Restore Selections Per Department
========================================================= */

function saveCurrentDeptSelections() {
    if (!activeDeptId) {
        return;
    }

    var fyChecked = getCheckedSubjects("FY").map(
        function (cb) {
            return cb.value;
        }
    );

    var syChecked = getCheckedSubjects("SY").map(
        function (cb) {
            return cb.value;
        }
    );

    var tyChecked = getCheckedSubjects("TY").map(
        function (cb) {
            return cb.value;
        }
    );

    selectedSubjectsByDept[activeDeptId] = {
        fy: fyChecked,
        sy: syChecked,
        ty: tyChecked
    };

    updateDeptSavedBadges();
}

function restoreSelectionsForDept(deptId) {
    var saved = selectedSubjectsByDept[deptId];

    if (!saved) {
        return;
    }

    ["FY", "SY", "TY"].forEach(function (year) {
        var config = getYearConfig(year);

        if (!config) {
            return;
        }

        var yearKey = year.toLowerCase();
        var ids = saved[yearKey] || [];

        ids.forEach(function (subjectId) {
            var cb = document.querySelector(
                '.subject-checkbox[value="' +
                subjectId +
                '"][data-year="' +
                year +
                '"]'
            );

            if (cb) {
                cb.checked = true;
            }
        });
    });

    updateSubjectCounter("FY");
    updateSubjectCounter("SY");
    updateSubjectCounter("TY");
}


/* =========================================================
   Create Subject Checkboxes (Single Dept View)
========================================================= */

var deptColorMap = {
    1: {
        bg: "#ede9fe",
        text: "#7c3aed",
        border: "#d8b4fe"
    },
    2: {
        bg: "#dbeafe",
        text: "#2563eb",
        border: "#93c5fd"
    },
    3: {
        bg: "#d1fae5",
        text: "#059669",
        border: "#6ee7b7"
    },
    4: {
        bg: "#fef3c7",
        text: "#d97706",
        border: "#fcd34d"
    }
};

function getDeptBadgeStyle(deptId) {
    var colors = deptColorMap[deptId] || {
        bg: "#f3f4f6",
        text: "#6b7280",
        border: "#d1d5db"
    };

    return (
        "background:" +
        colors.bg +
        ";color:" +
        colors.text +
        ";border:1px solid " +
        colors.border +
        ";"
    );
}

function renderSubjectsForYear(
    year,
    deptId,
    deptName,
    subjects
) {
    var config = getYearConfig(year);
    var container = getSubjectContainer(year);

    if (!config || !container) {
        return;
    }

    container.innerHTML = "";

    var filtered = subjects.filter(function (s) {
        return String(s.year_id) === String(config.yearId);
    });

    if (filtered.length === 0) {
        showSubjectContainerMessage(
            year,
            "No subjects found for this department",
            "fa-solid fa-circle-exclamation"
        );

        updateSubjectCounter(year);
        return;
    }

    var deptLabel = document.createElement("div");

    deptLabel.className = "subject-dept-label";
    deptLabel.style.cssText =
        "display:flex;align-items:center;gap:8px;" +
        "margin:8px 0 6px;padding:6px 10px;" +
        "border-radius:6px;font-size:12px;" +
        "font-weight:600;letter-spacing:0.3px;";

    var badgeStyle = getDeptBadgeStyle(
        parseInt(deptId, 10)
    );

    deptLabel.innerHTML =
        '<span style="' +
        badgeStyle +
        'padding:2px 8px;border-radius:4px;font-size:11px;">' +
        escapeHtml(deptName) +
        "</span>" +
        '<span style="color:#888;font-weight:500;">' +
        filtered.length +
        " subject" +
        (filtered.length > 1 ? "s" : "") +
        "</span>";

    container.appendChild(deptLabel);

    filtered.forEach(function (subject) {
        var subjectId = String(subject.id);

        var checkboxId =
            year.toLowerCase() + "Subject" + subjectId;

        var checkboxLabel =
            document.createElement("label");

        checkboxLabel.className =
            "subject-checkbox-card";
        checkboxLabel.setAttribute("for", checkboxId);

        checkboxLabel.innerHTML =
            '<input type="checkbox" ' +
            'id="' +
            escapeHtml(checkboxId) +
            '" ' +
            'value="' +
            escapeHtml(subjectId) +
            '" ' +
            'class="subject-checkbox" ' +
            'data-year="' +
            escapeHtml(year) +
            '" ' +
            'data-dept="' +
            escapeHtml(deptId) +
            '">' +
            '<span class="custom-checkbox" aria-hidden="true">' +
            '<i class="fa-solid fa-check"></i>' +
            "</span>" +
            '<span class="subject-checkbox-name">' +
            escapeHtml(subject.name || "Unnamed Subject") +
            "</span>";

        container.appendChild(checkboxLabel);
    });

    attachSubjectCheckboxEvents(year);
    restoreSelectionsForDept(deptId);
    updateSubjectCounter(year);
}

function attachSubjectCheckboxEvents(year) {
    var container = getSubjectContainer(year);

    if (!container) {
        return;
    }

    var checkboxes = container.querySelectorAll(
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
    var checkbox = event.target;
    var year = checkbox.dataset.year;

    if (!year) {
        return;
    }

    var selectedSubjects = getCheckedSubjects(year);

    if (selectedSubjects.length > 6) {
        checkbox.checked = false;

        showFormError(
            "You can select maximum 6 subjects for " +
            year +
            " in this department."
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

async function loadSubjectsByDeptAndYear(
    departmentId,
    yearId
) {
    var response = await fetch(
        "/admin/subjects/list/" +
        encodeURIComponent(departmentId) +
        "/" +
        encodeURIComponent(yearId),
        {
            method: "GET",
            headers: {
                Accept: "application/json"
            }
        }
    );

    if (!response.ok) {
        throw new Error(
            "Unable to load subjects for dept " +
            departmentId
        );
    }

    var subjects = await response.json();

    if (!Array.isArray(subjects)) {
        throw new Error(
            "Invalid subjects response for dept " +
            departmentId
        );
    }

    return subjects;
}

async function loadDeptSubjects(deptId) {
    if (deptSubjectsCache[deptId]) {
        return deptSubjectsCache[deptId];
    }

    var fySubjects = await loadSubjectsByDeptAndYear(
        deptId,
        subjectYearConfig.FY.yearId
    );

    var sySubjects = await loadSubjectsByDeptAndYear(
        deptId,
        subjectYearConfig.SY.yearId
    );

    var tySubjects = await loadSubjectsByDeptAndYear(
        deptId,
        subjectYearConfig.TY.yearId
    );

    var deptLabel = document.querySelector(
        '.dept-multi-option[data-dept-id="' +
        deptId +
        '"] span:last-child'
    );

    var allSubjects = fySubjects.concat(
        sySubjects,
        tySubjects
    );

    deptSubjectsCache[deptId] = {
        deptName: deptLabel
            ? deptLabel.textContent
            : deptId,
        subjects: allSubjects
    };

    return deptSubjectsCache[deptId];
}

async function handleDeptCheckboxChange(event) {
    var checkbox = event.target;
    var deptId = checkbox.value;

    hideFormError();
    updateDeptTriggerText();

    if (checkbox.checked) {
        saveCurrentDeptSelections();

        activeDeptId = deptId;

        ["FY", "SY", "TY"].forEach(function (year) {
            showSubjectContainerMessage(
                year,
                "Loading subjects...",
                "fa-solid fa-spinner fa-spin"
            );
        });

        try {
            var deptData =
                await loadDeptSubjects(deptId);

            renderSubjectsForYear(
                "FY",
                deptId,
                deptData.deptName,
                deptData.subjects
            );

            renderSubjectsForYear(
                "SY",
                deptId,
                deptData.deptName,
                deptData.subjects
            );

            renderSubjectsForYear(
                "TY",
                deptId,
                deptData.deptName,
                deptData.subjects
            );
        } catch (error) {
            console.error(
                "Error loading dept " + deptId + ":",
                error
            );

            resetAllSubjectContainers(
                "Error loading subjects"
            );

            showFormError(
                "Unable to load subjects. Please try again."
            );
        }
    } else {
        if (activeDeptId === deptId) {
            saveCurrentDeptSelections();

            activeDeptId = null;

            var remaining = getSelectedDeptIds();

            if (remaining.length > 0) {
                var lastDept =
                    remaining[remaining.length - 1];

                activeDeptId = lastDept;

                ["FY", "SY", "TY"].forEach(function (
                    year
                ) {
                    showSubjectContainerMessage(
                        year,
                        "Loading subjects...",
                        "fa-solid fa-spinner fa-spin"
                    );
                });

                try {
                    var deptData2 =
                        await loadDeptSubjects(lastDept);

                    renderSubjectsForYear(
                        "FY",
                        lastDept,
                        deptData2.deptName,
                        deptData2.subjects
                    );

                    renderSubjectsForYear(
                        "SY",
                        lastDept,
                        deptData2.deptName,
                        deptData2.subjects
                    );

                    renderSubjectsForYear(
                        "TY",
                        lastDept,
                        deptData2.deptName,
                        deptData2.subjects
                    );
                } catch (err) {
                    console.error(err);

                    resetAllSubjectContainers(
                        "Error loading subjects"
                    );
                }
            } else {
                resetAllSubjectContainers(
                    "Select Department First"
                );

                resetAllSubjectCounters();
            }
        } else {
            saveCurrentDeptSelections();
        }

        updateDeptSavedBadges();
    }
}


/* =========================================================
   Teacher Form Validation
========================================================= */

function validateTeacherName() {
    var teacherName = document.getElementById(
        "teacherName"
    );

    if (!teacherName) {
        return false;
    }

    var name = teacherName.value.trim();

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
    var teacherPhone = document.getElementById(
        "teacherPhone"
    );

    if (!teacherPhone) {
        return false;
    }

    var phone = teacherPhone.value.trim();
    var phonePattern = /^[0-9]{10}$/;

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

function validateTeacherEmail() {
    var teacherEmail = document.getElementById(
        "teacherEmail"
    );

    if (!teacherEmail) {
        return true;
    }

    var email = teacherEmail.value.trim();
    var emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

    if (email && !emailPattern.test(email)) {
        showFormError(
            "Please enter a valid email address."
        );

        teacherEmail.focus();
        return false;
    }

    teacherEmail.value = email.toLowerCase();

    return true;
}

function validateDepartment() {
    var selectedDeptIds = getSelectedDeptIds();

    if (selectedDeptIds.length === 0) {
        showFormError(
            "Please select at least one department."
        );

        var trigger = document.getElementById(
            "deptMultiTrigger"
        );

        if (trigger) {
            trigger.focus();
        }

        return false;
    }

    return true;
}

function validateAllYearSubjects() {
    var years = ["FY", "SY", "TY"];

    for (var i = 0; i < years.length; i++) {
        var year = years[i];
        var total = getAllDeptCheckedCount(year);

        if (total === 0) {
            showFormError(
                "Please select at least 1 subject for " +
                year +
                "."
            );

            var container = getSubjectContainer(year);

            if (container) {
                container.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });
            }

            return false;
        }

        if (total > 6) {
            showFormError(
                "You can select maximum 6 subjects for " +
                year +
                " (across all departments)."
            );

            return false;
        }
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

    if (!validateTeacherEmail()) {
        return false;
    }

    if (!validateDepartment()) {
        return false;
    }

    if (!validateAllYearSubjects()) {
        return false;
    }

    return true;
}

function injectAllSelectionsAsHiddenInputs() {
    var form = document.getElementById("addTeacherForm");

    if (!form) {
        return;
    }

    var existing = form.querySelectorAll(
        ".dynamic-subject-input"
    );

    existing.forEach(function (el) {
        el.remove();
    });

    var deptIds = Object.keys(selectedSubjectsByDept);

    deptIds.forEach(function (deptId) {
        var input = document.createElement("input");

        input.type = "hidden";
        input.name = "dept_ids";
        input.value = deptId;
        input.className = "dynamic-subject-input";

        form.appendChild(input);
    });

    ["fy", "sy", "ty"].forEach(function (yearKey) {
        var allIds = [];

        deptIds.forEach(function (deptId) {
            var saved =
                selectedSubjectsByDept[deptId];

            if (saved && saved[yearKey]) {
                allIds = allIds.concat(saved[yearKey]);
            }
        });

        var unique = [];

        allIds.forEach(function (id) {
            if (unique.indexOf(id) === -1) {
                unique.push(id);
            }
        });

        unique.forEach(function (subjectId) {
            var input =
                document.createElement("input");

            input.type = "hidden";
            input.name = yearKey + "_subject_ids";
            input.value = subjectId;
            input.className = "dynamic-subject-input";

            form.appendChild(input);
        });
    });
}

function handleTeacherFormSubmit(event) {
    saveCurrentDeptSelections();

    if (!validateTeacherForm()) {
        event.preventDefault();
        return;
    }

    var confirmed = window.confirm(
        "Are you sure you want to add this teacher?"
    );

    if (!confirmed) {
        event.preventDefault();
        return;
    }

    injectAllSelectionsAsHiddenInputs();

    var submitButton = document.getElementById(
        "addTeacherButton"
    );

    if (submitButton) {
        submitButton.disabled = true;

        submitButton.innerHTML =
            '<i class="fa-solid fa-spinner fa-spin"></i>' +
            "<span>Adding Teacher...</span>";
    }
}


/* =========================================================
   Phone Input Restriction
========================================================= */

function restrictPhoneInput(event) {
    var input = event.target;

    input.value = input.value
        .replace(/\D/g, "")
        .slice(0, 10);
}


/* =========================================================
   Remove Teacher List Utilities
========================================================= */

function showTeacherListMessage(
    message,
    iconClass
) {
    iconClass = iconClass || "";

    var content = document.getElementById(
        "teachersListContent"
    );

    if (!content) {
        return;
    }

    var icon = iconClass
        ? '<i class="' + escapeHtml(iconClass) + '"></i>'
        : "";

    content.innerHTML =
        '<div class="result-empty">' +
        icon +
        "<p>" +
        escapeHtml(message) +
        "</p>" +
        "</div>";
}

function formatTeacherSubjects(year, subjectText) {
    var subjects =
        subjectText && String(subjectText).trim()
            ? String(subjectText).trim()
            : "Not assigned";

    return (
        '<div class="teacher-subject-year">' +
        '<span class="teacher-year-badge">' +
        escapeHtml(year) +
        "</span>" +
        '<span class="teacher-subject-text">' +
        escapeHtml(subjects) +
        "</span>" +
        "</div>"
    );
}

function createTeacherTable(teachers) {
    var rows = "";

    teachers.forEach(function (teacher, index) {
        var teacherId = escapeHtml(teacher.id);

        var teacherName = escapeHtml(
            teacher.name || "-"
        );

        var teacherUsername = escapeHtml(
            teacher.username || "-"
        );

        var teacherDepartment = escapeHtml(
            teacher.department || "Not Assigned"
        );

        var teacherSubjects =
            '<div class="teacher-subjects-list">' +
            formatTeacherSubjects(
                "FY",
                teacher.fy_subjects
            ) +
            formatTeacherSubjects(
                "SY",
                teacher.sy_subjects
            ) +
            formatTeacherSubjects(
                "TY",
                teacher.ty_subjects
            ) +
            "</div>";

        rows +=
            "<tr>" +
            '<td data-label="#">' +
            (index + 1) +
            "</td>" +
            '<td data-label="Name">' +
            teacherName +
            "</td>" +
            '<td data-label="Username">' +
            teacherUsername +
            "</td>" +
            '<td data-label="Department">' +
            teacherDepartment +
            "</td>" +
            '<td data-label="Subjects">' +
            teacherSubjects +
            "</td>" +
            '<td data-label="Action">' +
            '<form method="POST" action="/admin/teachers/remove" class="remove-teacher-form">' +
            '<input type="hidden" name="csrf_token" value="' +
            getCsrfToken() +
            '">' +
            '<input type="hidden" name="teacher_id" value="' +
            teacherId +
            '">' +
            '<button type="submit" class="remove-btn">' +
            '<i class="fa-solid fa-trash"></i>' +
            "<span>Remove</span>" +
            "</button>" +
            "</form>" +
            "</td>" +
            "</tr>";
    });

    return (
        '<div class="table-wrap"><table>' +
        "<thead><tr>" +
        "<th>#</th>" +
        "<th>Name</th>" +
        "<th>Username</th>" +
        "<th>Department</th>" +
        "<th>Subjects</th>" +
        "<th>Action</th>" +
        "</tr></thead>" +
        "<tbody>" +
        rows +
        "</tbody></table></div>"
    );
}

function attachRemoveTeacherEvents() {
    var removeForms = document.querySelectorAll(
        ".remove-teacher-form"
    );

    removeForms.forEach(function (form) {
        form.addEventListener(
            "submit",
            function (event) {
                var confirmed = window.confirm(
                    "Are you sure you want to remove this teacher?"
                );

                if (!confirmed) {
                    event.preventDefault();
                    return;
                }

                var removeButton = form.querySelector(
                    ".remove-btn"
                );

                if (removeButton) {
                    removeButton.disabled = true;

                    removeButton.innerHTML =
                        '<i class="fa-solid fa-spinner fa-spin"></i>' +
                        "<span>Removing...</span>";
                }
            }
        );
    });
}


/* =========================================================
   Load Teacher List
========================================================= */

var teacherSearchTimer = null;

async function loadTeachers() {
    var searchInput = document.getElementById(
        "teacherSearch"
    );

    var content = document.getElementById(
        "teachersListContent"
    );

    if (!searchInput || !content) {
        return;
    }

    var keyword = searchInput.value.trim();

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
        var response = await fetch(
            "/admin/teachers/search/" +
            encodeURIComponent(keyword),
            {
                method: "GET",
                headers: {
                    Accept: "application/json"
                }
            }
        );

        var data = await response.json();

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
        var deptTrigger = document.getElementById(
            "deptMultiTrigger"
        );

        var deptCheckboxes = document.querySelectorAll(
            ".dept-checkbox"
        );

        var teacherForm = document.getElementById(
            "addTeacherForm"
        );

        var teacherPhone = document.getElementById(
            "teacherPhone"
        );

        var teacherSearch = document.getElementById(
            "teacherSearch"
        );

        if (deptTrigger) {
            deptTrigger.addEventListener(
                "click",
                toggleDeptMultiSelect
            );

            deptTrigger.addEventListener(
                "keydown",
                function (event) {
                    if (
                        event.key === "Enter" ||
                        event.key === " "
                    ) {
                        event.preventDefault();
                        toggleDeptMultiSelect();
                    }

                    if (event.key === "Escape") {
                        closeDeptMultiSelect();
                    }
                }
            );
        }

        deptCheckboxes.forEach(function (checkbox) {
            checkbox.addEventListener(
                "change",
                handleDeptCheckboxChange
            );
        });

        document.addEventListener(
            "click",
            function (event) {
                var select = document.getElementById(
                    "deptMultiSelect"
                );

                if (
                    select &&
                    !select.contains(event.target)
                ) {
                    closeDeptMultiSelect();
                }
            }
        );

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
