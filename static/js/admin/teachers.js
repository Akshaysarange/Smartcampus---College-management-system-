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
            '<div class="teacher-action-btns">' +
            '<button type="button" class="edit-btn" data-teacher-id="' +
            teacherId +
            '" title="Edit Teacher">' +
            '<i class="fa-solid fa-pen-to-square"></i>' +
            "<span>Edit</span>" +
            "</button>" +
            '<form method="POST" action="/admin/teachers/remove" class="remove-teacher-form">' +
            '<input type="hidden" name="csrf_token" value="' +
            getCsrfToken() +
            '">' +
            '<input type="hidden" name="teacher_id" value="' +
            teacherId +
            '">' +
            '<button type="submit" class="remove-btn" title="Remove Teacher">' +
            '<i class="fa-solid fa-trash"></i>' +
            "<span>Remove</span>" +
            "</button>" +
            "</form>" +
            "</div>" +
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
        attachEditTeacherEvents();
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

        /* Edit Teacher Modal Event Listeners */
        var editDeptTrigger = document.getElementById(
            "editDeptMultiTrigger"
        );
        var editDeptCheckboxes = document.querySelectorAll(
            ".edit-dept-checkbox"
        );
        var editTeacherForm = document.getElementById(
            "editTeacherForm"
        );
        var editTeacherPhone = document.getElementById(
            "editTeacherPhone"
        );

        if (editDeptTrigger) {
            editDeptTrigger.addEventListener(
                "click",
                toggleEditDeptMultiSelect
            );

            editDeptTrigger.addEventListener(
                "keydown",
                function (event) {
                    if (
                        event.key === "Enter" ||
                        event.key === " "
                    ) {
                        event.preventDefault();
                        toggleEditDeptMultiSelect();
                    }

                    if (event.key === "Escape") {
                        closeEditDeptMultiSelect();
                    }
                }
            );
        }

        editDeptCheckboxes.forEach(function (checkbox) {
            checkbox.addEventListener(
                "change",
                handleEditDeptCheckboxChange
            );
        });

        document.addEventListener(
            "click",
            function (event) {
                var editSelect = document.getElementById(
                    "editDeptMultiSelect"
                );

                if (
                    editSelect &&
                    !editSelect.contains(event.target)
                ) {
                    closeEditDeptMultiSelect();
                }
            }
        );

        if (editTeacherForm) {
            editTeacherForm.addEventListener(
                "submit",
                handleEditTeacherFormSubmit
            );
        }

        if (editTeacherPhone) {
            editTeacherPhone.addEventListener(
                "input",
                restrictPhoneInput
            );
        }

        document.addEventListener(
            "keydown",
            function (event) {
                if (event.key === "Escape") {
                    var modal = document.getElementById(
                        "editTeacherModal"
                    );

                    if (
                        modal &&
                        modal.classList.contains("open")
                    ) {
                        closeEditTeacherModal();
                    }
                }
            }
        );

        resetAllSubjectContainers(
            "Select Department First"
        );

        resetAllSubjectCounters();
    }
);


/* =========================================================
   Edit Teacher Modal Functions
========================================================= */

var editSelectedSubjectsByDept = {};
var editActiveDeptId = null;

var editSubjectYearConfig = {
    FY: {
        yearId: 1,
        containerId: "editFySubjectsContainer",
        counterId: "editFySubjectCounter"
    },

    SY: {
        yearId: 2,
        containerId: "editSySubjectsContainer",
        counterId: "editSySubjectCounter"
    },

    TY: {
        yearId: 3,
        containerId: "editTySubjectsContainer",
        counterId: "editTySubjectCounter"
    }
};

function getEditYearConfig(year) {
    var normalizedYear = String(year).toUpperCase();

    return editSubjectYearConfig[normalizedYear] || null;
}

function getEditSubjectContainer(year) {
    var config = getEditYearConfig(year);

    if (!config) {
        return null;
    }

    return document.getElementById(config.containerId);
}

function getEditSubjectCounter(year) {
    var config = getEditYearConfig(year);

    if (!config) {
        return null;
    }

    return document.getElementById(config.counterId);
}

function showEditFormError(message) {
    var errorElement = document.getElementById(
        "editTeacherFormError"
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

function hideEditFormError() {
    var errorElement = document.getElementById(
        "editTeacherFormError"
    );

    if (!errorElement) {
        return;
    }

    errorElement.textContent = "";
    errorElement.hidden = true;
}

function showEditSubjectContainerMessage(
    year,
    message,
    iconClass
) {
    iconClass = iconClass || "fa-solid fa-circle-info";

    var container = getEditSubjectContainer(year);

    if (!container) {
        return;
    }

    container.innerHTML =
        '<div class="subject-loading-message">' +
        '<i class="' +
        escapeHtml(iconClass) +
        '"></i>' +
        "<span>" +
        escapeHtml(message) +
        "</span>" +
        "</div>";
}

function resetAllEditSubjectContainers(message) {
    showEditSubjectContainerMessage(
        "FY",
        message,
        "fa-solid fa-circle-info"
    );
    showEditSubjectContainerMessage(
        "SY",
        message,
        "fa-solid fa-circle-info"
    );
    showEditSubjectContainerMessage(
        "TY",
        message,
        "fa-solid fa-circle-info"
    );
}

function getEditCheckedSubjects(year) {
    var container = getEditSubjectContainer(year);

    if (!container) {
        return [];
    }

    return Array.from(
        container.querySelectorAll(
            '.edit-subject-checkbox[data-year="' +
                year +
                '"]:checked'
        )
    );
}

function getActiveEditDeptCheckedCount(year) {
    return getEditCheckedSubjects(year).length;
}

function getAllEditDeptCheckedCount(year) {
    var total = 0;
    var deptIds = Object.keys(editSelectedSubjectsByDept);

    for (var i = 0; i < deptIds.length; i++) {
        var saved = editSelectedSubjectsByDept[deptIds[i]];

        if (saved) {
            var yearKey = year.toLowerCase();

            if (saved[yearKey]) {
                total += saved[yearKey].length;
            }
        }
    }

    return total;
}

function updateEditSubjectCounter(year) {
    var counter = getEditSubjectCounter(year);

    if (!counter) {
        return;
    }

    var activeCount = getActiveEditDeptCheckedCount(year);
    var totalCount = getAllEditDeptCheckedCount(year);

    if (editActiveDeptId && totalCount !== activeCount) {
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

function resetAllEditSubjectCounters() {
    updateEditSubjectCounter("FY");
    updateEditSubjectCounter("SY");
    updateEditSubjectCounter("TY");
}

function getEditSelectedDeptIds() {
    var checkboxes = document.querySelectorAll(
        ".edit-dept-checkbox:checked"
    );

    return Array.from(checkboxes).map(function (cb) {
        return cb.value;
    });
}

function updateEditDeptTriggerText() {
    var trigger = document.getElementById(
        "editDeptMultiTrigger"
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

    var selectedIds = getEditSelectedDeptIds();

    if (selectedIds.length === 0) {
        placeholder.textContent = "Select Departments";
        placeholder.classList.remove("has-selection");
    } else {
        var deptNames = selectedIds.map(function (id) {
            var label = document.querySelector(
                '.edit-dept-multi-option[data-dept-id="' +
                    id +
                    '"] span:last-child'
            );
            return label ? label.textContent : id;
        });

        placeholder.textContent = deptNames.join(", ");
        placeholder.classList.add("has-selection");
    }
}

function updateEditDeptSavedBadges() {
    var options = document.querySelectorAll(
        ".edit-dept-multi-option"
    );

    options.forEach(function (option) {
        var deptId = option.getAttribute("data-dept-id");
        var saved = editSelectedSubjectsByDept[deptId];
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

function toggleEditDeptMultiSelect() {
    var select = document.getElementById(
        "editDeptMultiSelect"
    );

    if (!select) {
        return;
    }

    select.classList.toggle("open");

    var trigger = document.getElementById(
        "editDeptMultiTrigger"
    );

    if (trigger) {
        trigger.setAttribute(
            "aria-expanded",
            String(select.classList.contains("open"))
        );
    }
}

function closeEditDeptMultiSelect() {
    var select = document.getElementById(
        "editDeptMultiSelect"
    );

    if (select) {
        select.classList.remove("open");

        var trigger = document.getElementById(
            "editDeptMultiTrigger"
        );

        if (trigger) {
            trigger.setAttribute("aria-expanded", "false");
        }
    }
}

function saveCurrentEditDeptSelections() {
    if (!editActiveDeptId) {
        return;
    }

    var fyChecked = getEditCheckedSubjects("FY").map(
        function (cb) {
            return cb.value;
        }
    );

    var syChecked = getEditCheckedSubjects("SY").map(
        function (cb) {
            return cb.value;
        }
    );

    var tyChecked = getEditCheckedSubjects("TY").map(
        function (cb) {
            return cb.value;
        }
    );

    editSelectedSubjectsByDept[editActiveDeptId] = {
        fy: fyChecked,
        sy: syChecked,
        ty: tyChecked
    };

    updateEditDeptSavedBadges();
}

function restoreEditSelectionsForDept(deptId) {
    var saved = editSelectedSubjectsByDept[deptId];

    if (!saved) {
        return;
    }

    ["FY", "SY", "TY"].forEach(function (year) {
        var yearKey = year.toLowerCase();
        var ids = saved[yearKey] || [];

        ids.forEach(function (subjectId) {
            var cb = document.querySelector(
                '.edit-subject-checkbox[value="' +
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

    updateEditSubjectCounter("FY");
    updateEditSubjectCounter("SY");
    updateEditSubjectCounter("TY");
}

function renderEditSubjectsForYear(
    year,
    deptId,
    deptName,
    subjects
) {
    var config = getEditYearConfig(year);
    var container = getEditSubjectContainer(year);

    if (!config || !container) {
        return;
    }

    container.innerHTML = "";

    var filtered = subjects.filter(function (s) {
        return String(s.year_id) === String(config.yearId);
    });

    if (filtered.length === 0) {
        showEditSubjectContainerMessage(
            year,
            "No subjects found for this department",
            "fa-solid fa-circle-exclamation"
        );

        updateEditSubjectCounter(year);
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
            "edit" +
            year.toLowerCase() +
            "Subject" +
            subjectId;

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
            'class="edit-subject-checkbox" ' +
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

    attachEditSubjectCheckboxEvents(year);
    restoreEditSelectionsForDept(deptId);
    updateEditSubjectCounter(year);
}

function attachEditSubjectCheckboxEvents(year) {
    var container = getEditSubjectContainer(year);

    if (!container) {
        return;
    }

    var checkboxes = container.querySelectorAll(
        ".edit-subject-checkbox"
    );

    checkboxes.forEach(function (checkbox) {
        checkbox.addEventListener(
            "change",
            handleEditSubjectCheckboxChange
        );
    });
}

function handleEditSubjectCheckboxChange(event) {
    var checkbox = event.target;
    var year = checkbox.dataset.year;

    if (!year) {
        return;
    }

    var selectedSubjects = getEditCheckedSubjects(year);

    if (selectedSubjects.length > 6) {
        checkbox.checked = false;

        showEditFormError(
            "You can select maximum 6 subjects for " +
                year +
                " in this department."
        );

        updateEditSubjectCounter(year);
        return;
    }

    hideEditFormError();
    updateEditSubjectCounter(year);
}

async function handleEditDeptCheckboxChange(event) {
    var checkbox = event.target;
    var deptId = checkbox.value;

    hideEditFormError();
    updateEditDeptTriggerText();

    if (checkbox.checked) {
        saveCurrentEditDeptSelections();

        editActiveDeptId = deptId;

        ["FY", "SY", "TY"].forEach(function (year) {
            showEditSubjectContainerMessage(
                year,
                "Loading subjects...",
                "fa-solid fa-spinner fa-spin"
            );
        });

        try {
            var deptData =
                await loadDeptSubjects(deptId);

            renderEditSubjectsForYear(
                "FY",
                deptId,
                deptData.deptName,
                deptData.subjects
            );

            renderEditSubjectsForYear(
                "SY",
                deptId,
                deptData.deptName,
                deptData.subjects
            );

            renderEditSubjectsForYear(
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

            resetAllEditSubjectContainers(
                "Error loading subjects"
            );

            showEditFormError(
                "Unable to load subjects. Please try again."
            );
        }
    } else {
        if (editActiveDeptId === deptId) {
            saveCurrentEditDeptSelections();
            delete editSelectedSubjectsByDept[deptId];
            editActiveDeptId = null;

            var remaining = getEditSelectedDeptIds();

            if (remaining.length > 0) {
                var lastDept =
                    remaining[remaining.length - 1];

                editActiveDeptId = lastDept;

                ["FY", "SY", "TY"].forEach(function (
                    year
                ) {
                    showEditSubjectContainerMessage(
                        year,
                        "Loading subjects...",
                        "fa-solid fa-spinner fa-spin"
                    );
                });

                try {
                    var deptData2 =
                        await loadDeptSubjects(lastDept);

                    renderEditSubjectsForYear(
                        "FY",
                        lastDept,
                        deptData2.deptName,
                        deptData2.subjects
                    );

                    renderEditSubjectsForYear(
                        "SY",
                        lastDept,
                        deptData2.deptName,
                        deptData2.subjects
                    );

                    renderEditSubjectsForYear(
                        "TY",
                        lastDept,
                        deptData2.deptName,
                        deptData2.subjects
                    );
                } catch (err) {
                    console.error(err);

                    resetAllEditSubjectContainers(
                        "Error loading subjects"
                    );
                }
            } else {
                resetAllEditSubjectContainers(
                    "Select Department First"
                );

                resetAllEditSubjectCounters();
            }
        } else {
            delete editSelectedSubjectsByDept[deptId];
        }

        updateEditDeptSavedBadges();
    }
}

function openEditTeacherModal(teacherId) {
    var modal = document.getElementById(
        "editTeacherModal"
    );
    var loading = document.getElementById(
        "editModalLoading"
    );
    var form = document.getElementById(
        "editTeacherForm"
    );

    if (!modal) {
        return;
    }

    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    if (loading) {
        loading.hidden = false;
        loading.style.display = "flex";
    }

    if (form) {
        form.hidden = true;
        form.style.display = "none";
    }

    hideEditFormError();

    fetchTeacherDetailsAndPopulate(teacherId);
}

function closeEditTeacherModal() {
    var modal = document.getElementById(
        "editTeacherModal"
    );
    var loading = document.getElementById(
        "editModalLoading"
    );
    var form = document.getElementById(
        "editTeacherForm"
    );

    if (!modal) {
        return;
    }

    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";

    if (loading) {
        loading.hidden = true;
        loading.style.display = "none";
    }

    if (form) {
        form.hidden = false;
        form.style.display = "block";
    }

    closeEditDeptMultiSelect();
}

async function fetchTeacherDetailsAndPopulate(teacherId) {
    var loading = document.getElementById(
        "editModalLoading"
    );
    var form = document.getElementById(
        "editTeacherForm"
    );

    try {
        var response = await fetch(
            "/admin/teachers/detail/" +
                encodeURIComponent(teacherId),
            {
                method: "GET",
                headers: {
                    Accept: "application/json"
                }
            }
        );

        if (!response.ok) {
            throw new Error(
                "Unable to fetch teacher details"
            );
        }

        var data = await response.json();

        var idInput = document.getElementById(
            "editTeacherId"
        );
        var usernameDisplay = document.getElementById(
            "editTeacherUsernameDisplay"
        );
        var nameInput = document.getElementById(
            "editTeacherName"
        );
        var phoneInput = document.getElementById(
            "editTeacherPhone"
        );
        var emailInput = document.getElementById(
            "editTeacherEmail"
        );

        if (idInput) {
            idInput.value = data.id;
        }

        if (usernameDisplay) {
            usernameDisplay.textContent = data.username;
        }

        if (nameInput) {
            nameInput.value = data.name;
        }

        if (phoneInput) {
            phoneInput.value = data.phone;
        }

        if (emailInput) {
            emailInput.value = data.email || "";
        }

        var deptCheckboxes = document.querySelectorAll(
            ".edit-dept-checkbox"
        );

        deptCheckboxes.forEach(function (cb) {
            cb.checked =
                data.dept_ids.indexOf(cb.value) !== -1;
        });

        updateEditDeptTriggerText();

        editSelectedSubjectsByDept = {};

        var teacherSubjIds = (data.subject_ids || []).map(
            String
        );

        for (var i = 0; i < data.dept_ids.length; i++) {
            var deptId = String(data.dept_ids[i]);
            var deptData =
                await loadDeptSubjects(deptId);

            var fyDeptSubjs = deptData.subjects
                .filter(function (s) {
                    return (
                        String(s.year_id) === "1" &&
                        teacherSubjIds.indexOf(
                            String(s.id)
                        ) !== -1
                    );
                })
                .map(function (s) {
                    return String(s.id);
                });

            var syDeptSubjs = deptData.subjects
                .filter(function (s) {
                    return (
                        String(s.year_id) === "2" &&
                        teacherSubjIds.indexOf(
                            String(s.id)
                        ) !== -1
                    );
                })
                .map(function (s) {
                    return String(s.id);
                });

            var tyDeptSubjs = deptData.subjects
                .filter(function (s) {
                    return (
                        String(s.year_id) === "3" &&
                        teacherSubjIds.indexOf(
                            String(s.id)
                        ) !== -1
                    );
                })
                .map(function (s) {
                    return String(s.id);
                });

            editSelectedSubjectsByDept[deptId] = {
                fy: fyDeptSubjs,
                sy: syDeptSubjs,
                ty: tyDeptSubjs
            };
        }

        updateEditDeptSavedBadges();

        editActiveDeptId =
            data.primary_dept_id ||
            (data.dept_ids.length > 0
                ? String(data.dept_ids[0])
                : null);

        if (editActiveDeptId) {
            var activeDeptData =
                await loadDeptSubjects(editActiveDeptId);

            renderEditSubjectsForYear(
                "FY",
                editActiveDeptId,
                activeDeptData.deptName,
                activeDeptData.subjects
            );

            renderEditSubjectsForYear(
                "SY",
                editActiveDeptId,
                activeDeptData.deptName,
                activeDeptData.subjects
            );

            renderEditSubjectsForYear(
                "TY",
                editActiveDeptId,
                activeDeptData.deptName,
                activeDeptData.subjects
            );
        } else {
            resetAllEditSubjectContainers(
                "Select Department First"
            );

            resetAllEditSubjectCounters();
        }

        if (loading) {
            loading.hidden = true;
            loading.style.display = "none";
        }

        if (form) {
            form.hidden = false;
            form.style.display = "block";
        }
    } catch (err) {
        console.error("fetchTeacherDetails error:", err);

        if (loading) {
            loading.hidden = false;
            loading.style.display = "flex";
            loading.innerHTML =
                '<i class="fa-solid fa-triangle-exclamation" style="color:#ef4444;font-size:32px;"></i>' +
                '<p style="color:#ef4444;">' +
                escapeHtml(
                    err.message ||
                        "Failed to load teacher data"
                ) +
                "</p>";
        }

        if (form) {
            form.hidden = true;
            form.style.display = "none";
        }
    }
}

function validateEditTeacherForm() {
    hideEditFormError();

    var nameInput = document.getElementById(
        "editTeacherName"
    );
    var phoneInput = document.getElementById(
        "editTeacherPhone"
    );
    var emailInput = document.getElementById(
        "editTeacherEmail"
    );

    if (!nameInput || !phoneInput) {
        return false;
    }

    var name = nameInput.value.trim();

    if (name.length < 2) {
        showEditFormError(
            "Please enter a valid teacher name."
        );
        nameInput.focus();
        return false;
    }

    nameInput.value = name;

    var phone = phoneInput.value.trim();

    if (!/^[0-9]{10}$/.test(phone)) {
        showEditFormError(
            "Please enter a valid 10-digit phone number."
        );
        phoneInput.focus();
        return false;
    }

    phoneInput.value = phone;

    var email = emailInput ? emailInput.value.trim() : "";

    if (
        email &&
        !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)
    ) {
        showEditFormError(
            "Please enter a valid email address."
        );
        emailInput.focus();
        return false;
    }

    if (emailInput) {
        emailInput.value = email.toLowerCase();
    }

    var selectedDepts = getEditSelectedDeptIds();

    if (selectedDepts.length === 0) {
        showEditFormError(
            "Please select at least one department."
        );
        return false;
    }

    var years = ["FY", "SY", "TY"];

    for (var i = 0; i < years.length; i++) {
        var y = years[i];
        var total = getAllEditDeptCheckedCount(y);

        if (total === 0) {
            showEditFormError(
                "Please select at least 1 subject for " +
                    y +
                    "."
            );

            var container = getEditSubjectContainer(y);

            if (container) {
                container.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });
            }

            return false;
        }

        if (total > 6) {
            showEditFormError(
                "You can select maximum 6 subjects for " +
                    y +
                    " (across all departments)."
            );

            return false;
        }
    }

    return true;
}

async function handleEditTeacherFormSubmit(event) {
    event.preventDefault();

    saveCurrentEditDeptSelections();

    if (!validateEditTeacherForm()) {
        return;
    }

    var saveBtn = document.getElementById(
        "saveTeacherEditButton"
    );
    var originalBtnHtml = saveBtn ? saveBtn.innerHTML : "";

    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.innerHTML =
            '<i class="fa-solid fa-spinner fa-spin"></i> <span>Saving Changes...</span>';
    }

    var formData = new FormData();

    formData.append("csrf_token", getCsrfToken());
    formData.append(
        "teacher_id",
        document.getElementById("editTeacherId").value
    );
    formData.append(
        "name",
        document.getElementById("editTeacherName").value.trim()
    );
    formData.append(
        "phone",
        document.getElementById("editTeacherPhone").value.trim()
    );

    var emailEl = document.getElementById("editTeacherEmail");
    formData.append(
        "email",
        emailEl ? emailEl.value.trim() : ""
    );

    var deptIds = Object.keys(editSelectedSubjectsByDept);

    deptIds.forEach(function (deptId) {
        formData.append("dept_ids", deptId);
    });

    ["fy", "sy", "ty"].forEach(function (yearKey) {
        var allIds = [];

        deptIds.forEach(function (deptId) {
            var saved =
                editSelectedSubjectsByDept[deptId];

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

        unique.forEach(function (subjId) {
            formData.append(
                yearKey + "_subject_ids",
                subjId
            );
        });
    });

    try {
        var response = await fetch("/admin/teachers/edit", {
            method: "POST",
            headers: {
                "X-Requested-With": "XMLHttpRequest",
                Accept: "application/json"
            },
            body: formData
        });

        var result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(
                result.message || "Failed to update teacher"
            );
        }

        closeEditTeacherModal();

        await loadTeachers();

        var flashContainer = document.querySelector(
            ".flash-messages"
        );

        if (!flashContainer) {
            flashContainer = document.createElement("div");
            flashContainer.className = "flash-messages";
            flashContainer.setAttribute(
                "aria-live",
                "polite"
            );

            var mainTitle = document.querySelector(
                ".page-title"
            );

            if (mainTitle && mainTitle.parentNode) {
                mainTitle.parentNode.insertBefore(
                    flashContainer,
                    mainTitle.nextSibling
                );
            }
        }

        if (flashContainer) {
            var msg = document.createElement("div");
            msg.className = "flash-message flash-success";
            msg.setAttribute("role", "alert");
            msg.innerHTML =
                '<i class="fa-solid fa-circle-check"></i> <span>' +
                escapeHtml(result.message) +
                "</span>";

            flashContainer.appendChild(msg);

            setTimeout(function () {
                msg.remove();
            }, 5000);
        }
    } catch (error) {
        console.error("Save teacher error:", error);
        showEditFormError(
            error.message ||
                "Unable to save changes. Please try again."
        );
    } finally {
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.innerHTML = originalBtnHtml;
        }
    }
}

function attachEditTeacherEvents() {
    var editBtns = document.querySelectorAll(".edit-btn");

    editBtns.forEach(function (btn) {
        btn.addEventListener("click", function () {
            var teacherId = btn.getAttribute(
                "data-teacher-id"
            );

            if (teacherId) {
                openEditTeacherModal(teacherId);
            }
        });
    });
}
