from flask import (
    Blueprint,
    flash,
    jsonify,
    redirect,
    render_template,
    request,
    session,
    url_for,
)

from app.decorators import login_required, role_required
from app.models import Student, Subject, Teacher, User, helpers

admin_bp = Blueprint("admin", __name__, url_prefix="/admin")

DEPT_CODES = {"1": "CS", "2": "IT", "3": "DSDA", "4": "AI"}
YEAR_CODES = {"1": "FY", "2": "SY", "3": "TY"}


@admin_bp.route("/find")
@login_required
@role_required('admin')
def find():
    return render_template("admin/find.html")


@admin_bp.route("/find-data/<type_name>/<dept_name>/<year_name>")
@login_required
@role_required('admin')
def find_data(type_name, dept_name, year_name):
    if type_name == "teacher":
        rows = Teacher.find_by_dept(dept_name)
        return jsonify(
            [
                {
                    "name": r["name"],
                    "phone": r["phone"] or "",
                    "username": r["username"],
                    "password": r["password"],
                }
                for r in rows
            ]
        )

    students = Student.list_by_dept_year_name(dept_name, year_name)
    return jsonify(
        [
            {
                "name": s["name"],
                "roll": s["roll_no"],
                "username": s["username"],
                "password": _password_for(s["username"]),
            }
            for s in students
        ]
    )


@admin_bp.route("/search/<keyword>")
@login_required
@role_required('admin')
def search(keyword):
    key = f"%{keyword}%"

    student_rows = _query(
        """
        SELECT 'Student' AS record_type, st.name, d.name AS department,
               y.name AS year_name, st.roll_no, st.username, u.phone,
               u.password, '' AS fy_subjects, '' AS sy_subjects,
               '' AS ty_subjects
        FROM students st
        JOIN users u ON u.id = st.user_id
        JOIN departments d ON d.id = st.dept_id
        JOIN years y ON y.id = st.year_id
        WHERE st.name LIKE %s OR st.roll_no LIKE %s
           OR st.username LIKE %s OR u.phone LIKE %s
        """,
        (key, key, key, key),
    )

    teacher_rows = _query(
        """
        SELECT 'Teacher' AS record_type, t.name, d.name AS department,
               '-' AS year_name, '-' AS roll_no, t.username, u.phone,
               u.password,
               GROUP_CONCAT(DISTINCT CASE WHEN s.year_id = 1 THEN s.name END
                   ORDER BY s.name SEPARATOR ', ') AS fy_subjects,
               GROUP_CONCAT(DISTINCT CASE WHEN s.year_id = 2 THEN s.name END
                   ORDER BY s.name SEPARATOR ', ') AS sy_subjects,
               GROUP_CONCAT(DISTINCT CASE WHEN s.year_id = 3 THEN s.name END
                   ORDER BY s.name SEPARATOR ', ') AS ty_subjects
        FROM teachers t
        JOIN users u ON u.id = t.user_id
        JOIN departments d ON d.id = t.dept_id
        LEFT JOIN teacher_subjects ts ON ts.teacher_id = t.id
        LEFT JOIN subjects s ON s.id = ts.subject_id
        WHERE t.name LIKE %s OR t.username LIKE %s OR u.phone LIKE %s
           OR s.name LIKE %s
        GROUP BY t.id, t.name, d.name, t.username, u.phone, u.password
        ORDER BY t.id
        """,
        (key, key, key, key),
    )

    result = []
    for row in student_rows + teacher_rows:
        result.append(
            {
                "type": row["record_type"],
                "name": row["name"],
                "department": row["department"],
                "year": row["year_name"],
                "roll": row["roll_no"],
                "username": row["username"],
                "phone": row["phone"],
                "password": row["password"],
                "fy_subjects": row["fy_subjects"] or "",
                "sy_subjects": row["sy_subjects"] or "",
                "ty_subjects": row["ty_subjects"] or "",
            }
        )

    return jsonify(result)


@admin_bp.route("/teachers/search/<keyword>")
@login_required
@role_required('admin')
def teachers_search(keyword):
    keyword = str(keyword).strip()
    if not keyword:
        return jsonify([])

    search_value = f"%{keyword}%"
    rows = _query(
        """
        SELECT t.id, t.name, t.username, u.password, u.phone, d.name AS department,
            GROUP_CONCAT(DISTINCT CASE WHEN s.year_id = 1 THEN s.name END
                ORDER BY s.id SEPARATOR ', ') AS fy_subjects,
            GROUP_CONCAT(DISTINCT CASE WHEN s.year_id = 2 THEN s.name END
                ORDER BY s.id SEPARATOR ', ') AS sy_subjects,
            GROUP_CONCAT(DISTINCT CASE WHEN s.year_id = 3 THEN s.name END
                ORDER BY s.id SEPARATOR ', ') AS ty_subjects
        FROM teachers t
        JOIN users u ON u.id = t.user_id
        JOIN departments d ON d.id = t.dept_id
        LEFT JOIN teacher_subjects ts ON ts.teacher_id = t.id
        LEFT JOIN subjects s ON s.id = ts.subject_id
        WHERE t.name LIKE %s OR t.username LIKE %s OR u.phone LIKE %s
           OR d.name LIKE %s
        GROUP BY t.id, t.name, t.username, u.password, u.phone, d.name
        ORDER BY t.name ASC
        """,
        (search_value, search_value, search_value, search_value),
    )
    return jsonify(
        [
            {
                "id": r["id"],
                "name": r["name"],
                "username": r["username"],
                "password": r["password"],
                "phone": r["phone"] or "",
                "department": r["department"] or "",
                "fy_subjects": r["fy_subjects"] or "",
                "sy_subjects": r["sy_subjects"] or "",
                "ty_subjects": r["ty_subjects"] or "",
            }
            for r in rows
        ]
    )


@admin_bp.route("/students/search/<keyword>")
@login_required
@role_required('admin')
def students_search(keyword):
    keyword = str(keyword).strip()
    if not keyword:
        return jsonify([])

    search_value = f"%{keyword}%"
    rows = _query(
        """
        SELECT st.id, st.name, st.roll_no, st.username, u.phone,
               d.name AS department, y.name AS year
        FROM students st
        JOIN users u ON u.id = st.user_id
        JOIN departments d ON d.id = st.dept_id
        JOIN years y ON y.id = st.year_id
        WHERE st.name LIKE %s OR st.roll_no LIKE %s OR st.username LIKE %s
           OR u.phone LIKE %s OR d.name LIKE %s OR y.name LIKE %s
        ORDER BY st.name ASC
        """,
        (
            search_value,
            search_value,
            search_value,
            search_value,
            search_value,
            search_value,
        ),
    )
    return jsonify(
        [
            {
                "id": r["id"],
                "name": r["name"],
                "roll": r["roll_no"],
                "username": r["username"],
                "phone": r["phone"] or "",
                "department": r["department"] or "",
                "year": r["year"] or "",
            }
            for r in rows
        ]
    )


# --- Subjects -----------------------------------------------------


@admin_bp.route("/subjects/<int:dept_id>/<int:year_id>")
@login_required
@role_required('admin')
def subjects_by_dept_year(dept_id, year_id):
    subjects = Subject.by_dept_year(dept_id, year_id)
    return jsonify([{"id": s["id"], "name": s["name"]} for s in subjects])


@admin_bp.route("/subjects/list/<int:dept_id>/<int:year_id>")
@login_required
@role_required('admin')
def subjects_list(dept_id, year_id):
    subjects = Subject.by_dept_year(dept_id, year_id)
    return jsonify([{"id": s["id"], "name": s["name"]} for s in subjects])


# --- Teachers -----------------------------------------------------


@admin_bp.route("/teachers")
@login_required
@role_required('admin')
def teachers():
    counts = Teacher.dept_count()
    return render_template(
        "admin/teachers.html",
        total_teachers=counts["total"] or 0,
        cs_teachers=counts["cs"] or 0,
        it_teachers=counts["it"] or 0,
        dsda_teachers=counts["dsda"] or 0,
        ai_teachers=counts["ai"] or 0,
    )


@admin_bp.route("/teachers/add", methods=["POST"])
@login_required
@role_required('admin')
def teachers_add():
    name = request.form.get("name", "").strip()
    phone = request.form.get("phone", "").strip()
    dept_id = request.form.get("dept_id", "").strip()

    fy_subject_ids = list(
        dict.fromkeys(s for s in request.form.getlist("fy_subject_ids") if s)
    )
    sy_subject_ids = list(
        dict.fromkeys(s for s in request.form.getlist("sy_subject_ids") if s)
    )
    ty_subject_ids = list(
        dict.fromkeys(s for s in request.form.getlist("ty_subject_ids") if s)
    )

    if len(name) < 2:
        flash("Please enter a valid teacher name.", "error")
        return redirect(url_for("admin.teachers"))

    if not phone.isdigit() or len(phone) != 10:
        flash("Please enter a valid 10-digit phone number.", "error")
        return redirect(url_for("admin.teachers"))

    if not dept_id.isdigit():
        flash("Please select a valid department.", "error")
        return redirect(url_for("admin.teachers"))

    if not 1 <= len(fy_subject_ids) <= 6:
        flash("Please select between 1 and 6 FY subjects.", "error")
        return redirect(url_for("admin.teachers"))
    if not 1 <= len(sy_subject_ids) <= 6:
        flash("Please select between 1 and 6 SY subjects.", "error")
        return redirect(url_for("admin.teachers"))
    if not 1 <= len(ty_subject_ids) <= 6:
        flash("Please select between 1 and 6 TY subjects.", "error")
        return redirect(url_for("admin.teachers"))

    check = _validate_subjects(fy_subject_ids, dept_id, 1, "FY")
    if check:
        return check
    check = _validate_subjects(sy_subject_ids, dept_id, 2, "SY")
    if check:
        return check
    check = _validate_subjects(ty_subject_ids, dept_id, 3, "TY")
    if check:
        return check

    username = helpers.next_username("teacher", 1000001)

    try:
        user_id = User.create(username, "teacher", "teacher", phone)
        teacher_id = _insert(
            "INSERT INTO teachers (user_id, name, username, dept_id) "
            "VALUES (%s, %s, %s, %s)",
            (user_id, name, username, dept_id),
        )

        assignments = [
            (teacher_id, subj)
            for subj in fy_subject_ids + sy_subject_ids + ty_subject_ids
        ]
        _executemany(
            "INSERT INTO teacher_subjects (teacher_id, subject_id) VALUES (%s, %s)",
            assignments,
        )

        _commit()
        flash(f"Teacher added successfully! Username: {username}", "success")

    except Exception as error:
        from app.utils import db

        db.rollback()
        flash("Unable to add teacher. Please try again.", "error")

    return redirect(url_for("admin.teachers"))


@admin_bp.route("/teachers/remove", methods=["POST"])
@login_required
@role_required('admin')
def teachers_remove():
    teacher_id = request.form.get("teacher_id", "").strip()

    if not teacher_id:
        flash("Teacher ID is required!", "error")
        return redirect(url_for("admin.teachers"))

    row = _query_one("SELECT user_id FROM teachers WHERE id = %s", (teacher_id,))
    if not row:
        flash("Teacher not found!", "error")
        return redirect(url_for("admin.teachers"))

    user_id = row["user_id"]

    try:
        _execute(
            "DELETE FROM teacher_subjects WHERE teacher_id = %s",
            (teacher_id,),
        )
        _execute("DELETE FROM teachers WHERE id = %s", (teacher_id,))
        User.delete(user_id)
        _commit()
        flash("Teacher removed successfully!", "success")

    except Exception:
        from app.utils import db

        db.rollback()
        flash("Unable to remove teacher. Please try again.", "error")

    return redirect(url_for("admin.teachers"))


@admin_bp.route("/teachers/list/<dept_name>")
@login_required
@role_required('admin')
def teachers_list(dept_name):
    rows = _query(
        """
        SELECT t.id, t.name, t.username, u.password,
            GROUP_CONCAT(DISTINCT CASE WHEN s.year_id = 1 THEN s.name END
                ORDER BY s.id SEPARATOR ', ') AS fy_subjects,
            GROUP_CONCAT(DISTINCT CASE WHEN s.year_id = 2 THEN s.name END
                ORDER BY s.id SEPARATOR ', ') AS sy_subjects,
            GROUP_CONCAT(DISTINCT CASE WHEN s.year_id = 3 THEN s.name END
                ORDER BY s.id SEPARATOR ', ') AS ty_subjects
        FROM teachers t
        JOIN users u ON u.id = t.user_id
        JOIN departments d ON d.id = t.dept_id
        LEFT JOIN teacher_subjects ts ON ts.teacher_id = t.id
        LEFT JOIN subjects s ON s.id = ts.subject_id
        WHERE d.name = %s
        GROUP BY t.id, t.name, t.username, u.password
        ORDER BY t.id ASC
        """,
        (dept_name,),
    )
    return jsonify(
        [
            {
                "id": r["id"],
                "name": r["name"],
                "username": r["username"],
                "password": r["password"],
                "fy_subjects": r["fy_subjects"] or "",
                "sy_subjects": r["sy_subjects"] or "",
                "ty_subjects": r["ty_subjects"] or "",
            }
            for r in rows
        ]
    )


# --- Students -----------------------------------------------------


@admin_bp.route("/students")
@login_required
@role_required('admin')
def students():
    counts = Student.dept_count()
    return render_template(
        "admin/students.html",
        total_students=counts["total"] or 0,
        cs_students=counts["cs"] or 0,
        it_students=counts["it"] or 0,
        dsda_students=counts["dsda"] or 0,
        ai_students=counts["ai"] or 0,
    )


@admin_bp.route("/students/add", methods=["POST"])
@login_required
@role_required('admin')
def students_add():
    name = request.form["name"]
    phone = request.form["phone"]
    dept_id = request.form["dept_id"]
    year_id = request.form["year_id"]

    username = helpers.next_username("student", 2000001)

    next_roll = Student.count_next_roll(dept_id, year_id)
    roll_no = (
        f"{DEPT_CODES[dept_id]}-{YEAR_CODES[year_id]}-{next_roll:03d}"
    )

    try:
        user_id = User.create(username, "student", "student", phone)
        Student.create(user_id, name, username, roll_no, dept_id, year_id)
        _commit()
        flash(f"Student added successfully! Username: {username}", "success")

    except Exception:
        from app.utils import db

        db.rollback()
        flash("Unable to add student. Please try again.", "error")

    return redirect(url_for("admin.students"))


@admin_bp.route("/students/list/<dept_name>/<year_name>")
@login_required
@role_required('admin')
def students_list(dept_name, year_name):
    students = Student.list_by_dept_year_name(dept_name, year_name)
    return jsonify(
        [
            {
                "id": s["id"],
                "name": s["name"],
                "roll": s["roll_no"],
                "username": s["username"],
            }
            for s in students
        ]
    )


@admin_bp.route("/students/remove", methods=["POST"])
@login_required
@role_required('admin')
def students_remove():
    student_id = request.form["student_id"]
    user_id = Student.user_id_by_student_id(student_id)

    if user_id:
        from app.models import Attendance, Marks

        try:
            Attendance.delete_for_student(student_id)
            Marks.delete_for_student(student_id)
            Student.delete(student_id)
            User.delete(user_id)
            _commit()
            flash("Student removed successfully!", "success")
        except Exception:
            from app.utils import db

            db.rollback()
            flash("Unable to remove student. Please try again.", "error")
    else:
        flash("Student not found!", "error")

    return redirect(url_for("admin.students"))


# --- Profile ------------------------------------------------------


@admin_bp.route("/profile")
@role_required("admin")
def profile():
    admin = User.find_by_id(session["user_id"])
    hour = _current_hour()
    return render_template(
        "admin/profile.html",
        greeting=_greeting(hour),
        name=admin["username"],
        admin_id=admin["id"],
        username=admin["username"],
        phone=admin["phone"] or "Not Available",
    )


@admin_bp.route("/change-password", methods=["GET", "POST"])
@role_required("admin")
def change_password():
    if request.method == "POST":
        old_password = request.form["old_password"]
        new_password = request.form["new_password"]

        user = User.find_by_id(session["user_id"])

        if user and User.verify_password(user["password"], old_password):
            User.update_password(session["user_id"], new_password)
            _commit()
            flash("Password changed successfully!", "success")
        else:
            flash("Old password is incorrect!", "error")

        return redirect(url_for("admin.change_password"))

    return render_template("admin/password.html")


# --- internal helpers ----------------------------------------------
# These wrap direct cursor access to keep route bodies thin.


def _query(sql, params=None):
    from app.utils import db

    return db.query(sql, params)


def _query_one(sql, params=None):
    from app.utils import db

    return db.query_one(sql, params)


def _execute(sql, params=None):
    from app.utils import db

    return db.execute(sql, params)


def _insert(sql, params=None):
    from app.utils import db

    return db.insert_and_get_id(sql, params)


def _executemany(sql, params_list):
    from app.utils import db

    return db.execute_many(sql, params_list)


def _commit():
    from app.utils import db

    db.commit()


def _password_for(username):
    row = _query_one(
        "SELECT password FROM users WHERE username = %s",
        (username,),
    )
    return row["password"] if row else ""


def _validate_subjects(subject_ids, dept_id, year_id, year_name):
    valid = Subject.find_in_dept_year(subject_ids, dept_id, year_id)
    if valid != set(subject_ids):
        flash(f"One or more selected {year_name} subjects are invalid.", "error")
        return redirect(url_for("admin.teachers"))
    return None


def _current_hour():
    from datetime import datetime

    return datetime.now().hour


def _greeting(hour):
    if hour < 12:
        return "Good Morning"
    if hour < 17:
        return "Good Afternoon"
    return "Good Evening"
