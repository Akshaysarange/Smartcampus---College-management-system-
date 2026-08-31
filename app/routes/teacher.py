from datetime import datetime

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
from app.models import Attendance, Marks, Student, Subject, Teacher, User
from app.services import attendance_service, marks_service
from app.utils import db

teacher_bp = Blueprint("teacher", __name__, url_prefix="/teacher")


def _current_teacher():
    """Return the logged-in teacher row or None."""
    return Teacher.by_user_id(session["user_id"])


@teacher_bp.route("/find")
@login_required
@role_required('teacher')
def find():
    teacher = Teacher.by_user_id_with_dept(session["user_id"])

    dept_id = teacher["dept_id"]
    counts = Teacher.dept_student_counts(dept_id)

    return render_template(
        "teacher/find.html",
        teacher_name=teacher["name"],
        department=teacher["dept_name"],
        fy_count=counts["fy"],
        sy_count=counts["sy"],
        ty_count=counts["ty"],
    )


@teacher_bp.route("/subjects/<year_name>")
@login_required
@role_required('teacher')
def subjects(year_name):
    teacher = _current_teacher()
    if not teacher:
        return jsonify([])

    rows = Teacher.subjects_for_year(
        teacher["id"],
        teacher["dept_id"],
        year_name,
    )
    return jsonify([{"id": r["id"], "name": r["name"]} for r in rows])


@teacher_bp.route("/students/<year_name>")
@login_required
@role_required('teacher')
def students(year_name):
    teacher = _current_teacher()
    if not teacher:
        return jsonify([])

    rows = db.query(
        """
        SELECT st.id, st.name, st.roll_no, st.username, u.phone
        FROM students st
        JOIN users u ON st.user_id = u.id
        JOIN years y ON st.year_id = y.id
        WHERE st.dept_id = %s AND y.name = %s
        ORDER BY st.roll_no
        """,
        (teacher["dept_id"], year_name),
    )
    return jsonify(
        [
            {
                "id": r["id"],
                "name": r["name"],
                "roll": r["roll_no"],
                "username": r["username"],
                "phone": r["phone"],
            }
            for r in rows
        ]
    )


@teacher_bp.route("/search/<keyword>")
@login_required
@role_required('teacher')
def search_students(keyword):
    keyword = str(keyword).strip()
    if not keyword:
        return jsonify([])

    teacher = _current_teacher()
    if not teacher:
        return jsonify({"success": False, "message": "Teacher not found"}), 404

    search_value = f"%{keyword}%"
    rows = db.query(
        """
        SELECT st.id, st.name, st.roll_no, st.username,
               d.name AS department, y.name AS year, u.phone
        FROM students st
        JOIN departments d ON d.id = st.dept_id
        JOIN years y ON y.id = st.year_id
        JOIN users u ON u.id = st.user_id
        WHERE st.dept_id = %s AND (
            st.name LIKE %s OR st.roll_no LIKE %s OR st.username LIKE %s
            OR u.phone LIKE %s OR y.name LIKE %s
        )
        ORDER BY y.id ASC, st.roll_no ASC
        """,
        (
            teacher["dept_id"],
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
                "department": r["department"],
                "year": r["year"],
                "phone": r["phone"] or "N/A",
            }
            for r in rows
        ]
    )


# --- Attendance --------------------------------------------------


@teacher_bp.route("/attendance")
@login_required
@role_required('teacher')
def attendance():
    teacher = Teacher.by_user_id_with_dept(session["user_id"])
    return render_template(
        "teacher/attendance.html",
        teacher_name=teacher["name"],
        dept_id=teacher["dept_id"],
        department=teacher["dept_name"],
    )


@teacher_bp.route("/attendance/students/<year_name>/<int:subject_id>/<attendance_date>")
@login_required
@role_required('teacher')
def attendance_students(year_name, subject_id, attendance_date):
    # Validate date
    try:
        selected_date = datetime.strptime(attendance_date, "%Y-%m-%d").date()
    except (ValueError, TypeError):
        return jsonify(
            {"success": False, "message": "Invalid date format"}
        ), 400

    if selected_date > datetime.now().date():
        return jsonify(
            {"success": False, "message": "Future date attendance is not allowed"}
        ), 400

    teacher = _current_teacher()
    if not teacher:
        return jsonify({"success": False, "message": "Teacher not found"}), 404

    assigned = Teacher.has_subject_for_year(
        teacher["id"],
        subject_id,
        teacher["dept_id"],
        year_name,
    )
    if not assigned:
        return jsonify(
            {"success": False, "message": "This subject is not assigned to you"}
        ), 403

    rows = Attendance.students_with_attendance(
        teacher["dept_id"],
        year_name,
        subject_id,
        attendance_date,
    )
    return jsonify(
        [
            {
                "id": r["id"],
                "name": r["name"],
                "roll": r["roll_no"],
                "status": r["status"],
            }
            for r in rows
        ]
    )


@teacher_bp.route("/attendance/generate-otp", methods=["POST"])
@login_required
@role_required('teacher')
def generate_otp():
    data = request.get_json(silent=True)
    if not data:
        return jsonify(
            {"success": False, "message": "Invalid request data."}
        ), 400

    year_name = str(data.get("year", "")).strip().upper()
    subject_id = data.get("subject_id")
    latitude = data.get("latitude")
    longitude = data.get("longitude")
    allowed_radius = data.get("allowed_radius", 100)

    if year_name not in ("FY", "SY", "TY"):
        return jsonify(
            {"success": False, "message": "Please select a valid year."}
        ), 400

    try:
        subject_id = int(subject_id)
        latitude = float(latitude)
        longitude = float(longitude)
        allowed_radius = int(allowed_radius)
    except (TypeError, ValueError):
        return jsonify(
            {"success": False, "message": "Invalid subject, location or radius."}
        ), 400

    if not -90 <= latitude <= 90:
        return jsonify({"success": False, "message": "Invalid latitude."}), 400
    if not -180 <= longitude <= 180:
        return jsonify({"success": False, "message": "Invalid longitude."}), 400
    if allowed_radius not in attendance_service.ALLOWED_RADII:
        return jsonify(
            {"success": False, "message": "Invalid attendance radius."}
        ), 400

    teacher = _current_teacher()
    if not teacher:
        return jsonify({"success": False, "message": "Teacher not found."}), 404

    try:
        result = attendance_service.generate_otp(
            teacher["id"],
            teacher["dept_id"],
            subject_id,
            year_name,
            latitude,
            longitude,
            allowed_radius,
        )
        return jsonify(
            {
                "success": True,
                "message": "Attendance OTP generated successfully.",
                **result,
            }
        )
    except PermissionError:
        return jsonify(
            {
                "success": False,
                "message": "This subject is not assigned to you for the selected year.",
            }
        ), 403
    except ValueError as error:
        message = "Unable to generate OTP. Please try again."
        if str(error) == "year-not-found":
            message = "Selected year was not found."
        elif str(error) == "subject-not-found":
            message = "Subject information not found."
        return jsonify({"success": False, "message": message}), 404
    except Exception:
        return jsonify(
            {"success": False, "message": "Unable to generate OTP. Please try again."}
        ), 500


@teacher_bp.route("/attendance/stop-otp", methods=["POST"])
@login_required
@role_required('teacher')
def stop_otp():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"success": False, "message": "Invalid request."}), 400

    try:
        session_id = int(data.get("session_id"))
    except (TypeError, ValueError):
        return jsonify(
            {"success": False, "message": "Valid OTP session ID is required."}
        ), 400

    teacher = _current_teacher()
    if not teacher:
        return jsonify({"success": False, "message": "Teacher not found."}), 404

    try:
        result = attendance_service.stop_otp(
            teacher["id"],
            teacher["dept_id"],
            session_id,
        )
        return jsonify(
            {
                "success": True,
                "message": "OTP attendance completed successfully.",
                **result,
            }
        )
    except ValueError:
        return jsonify({"success": False, "message": "OTP session not found."}), 404
    except Exception:
        return jsonify(
            {"success": False, "message": "Unable to complete OTP attendance."}
        ), 500


@teacher_bp.route("/attendance/otp-status/<int:session_id>")
@login_required
@role_required('teacher')
def otp_status(session_id):
    teacher = _current_teacher()
    if not teacher:
        return jsonify({"success": False, "message": "Unauthorized"}), 401

    try:
        result = attendance_service.status(
            teacher["id"],
            teacher["dept_id"],
            session_id,
        )
        return jsonify({"success": True, **result})
    except ValueError:
        return jsonify({"success": False, "message": "OTP session not found."}), 404
    except Exception:
        return jsonify(
            {"success": False, "message": "Unable to load OTP attendance status."}
        ), 500


@teacher_bp.route("/attendance/submit", methods=["POST"])
@login_required
@role_required('teacher')
def submit_attendance():
    data = request.get_json(silent=True)
    if not data:
        return jsonify(
            {"success": False, "message": "Invalid request data."}
        ), 400

    subject_id = data.get("subject_id")
    attendance_date = data.get("date")
    attendance = data.get("attendance", [])

    if not subject_id or not attendance_date or not attendance:
        return jsonify(
            {"success": False, "message": "Missing attendance data."}
        ), 400

    try:
        selected_date = datetime.strptime(attendance_date, "%Y-%m-%d").date()
    except (ValueError, TypeError):
        return jsonify(
            {"success": False, "message": "Invalid date format."}
        ), 400

    if selected_date > datetime.now().date():
        return jsonify(
            {"success": False, "message": "Future date attendance is not allowed!"}
        ), 400

    teacher = _current_teacher()
    if not teacher or not Teacher.has_subject(teacher["id"], subject_id):
        return jsonify(
            {"success": False, "message": "This subject is not assigned to you."}
        ), 403

    present_count = 0
    absent_count = 0

    try:
        for item in attendance:
            student_id = item.get("student_id")
            status = item.get("status")

            if not student_id or status not in ("P", "A"):
                db.rollback()
                return jsonify(
                    {
                        "success": False,
                        "message": "Invalid student attendance data.",
                    }
                ), 400

            if status == "P":
                present_count += 1
            else:
                absent_count += 1

            Attendance.upsert(student_id, subject_id, attendance_date, status)

        subject = Subject.info(subject_id)
        if not subject:
            db.rollback()
            return jsonify(
                {"success": False, "message": "Subject information not found."}
            ), 404

        rows = Attendance.rows_for_subject_date(subject_id, attendance_date)
        db.commit()

        from app.services.excel_service import update_attendance_excel

        update_attendance_excel(
            subject["department"],
            subject["year"],
            subject["name"],
            attendance_date,
            rows,
        )

        return jsonify(
            {
                "success": True,
                "message": "Attendance submitted successfully!",
                "present": present_count,
                "absent": absent_count,
            }
        )
    except Exception:
        db.rollback()
        return jsonify(
            {"success": False, "message": "Unable to submit attendance. Please try again."}
        ), 500


# --- Marks ----------------------------------------------------------


@teacher_bp.route("/marks")
@login_required
@role_required('teacher')
def marks():
    teacher = Teacher.by_user_id_with_dept(session["user_id"])
    return render_template(
        "teacher/marks.html",
        teacher_name=teacher["name"],
        department=teacher["dept_name"],
    )


@teacher_bp.route("/marks/students/<year_name>/<subject_id>")
@login_required
@role_required('teacher')
def marks_students(year_name, subject_id):
    teacher = _current_teacher()
    if not teacher:
        return jsonify([])

    rows = Marks.students_with_marks(
        teacher["dept_id"],
        year_name,
        subject_id,
    )
    return jsonify(
        [
            {
                "id": r["id"],
                "name": r["name"],
                "roll": r["roll_no"],
                "internal": r["internal"],
                "theory": r["theory"],
            }
            for r in rows
        ]
    )


@teacher_bp.route("/marks/submit", methods=["POST"])
@login_required
@role_required('teacher')
def submit_marks():
    data = request.get_json(silent=True)
    if not data:
        return jsonify(
            {"success": False, "message": "Invalid request data"}
        ), 400

    subject_id = data.get("subject_id")
    marks = data.get("marks", [])

    if not subject_id or not marks:
        return jsonify({"success": False, "message": "Missing marks data"}), 400

    try:
        result = marks_service.submit_marks(subject_id, marks)
        return jsonify(
            {"success": True, "message": "Marks uploaded successfully!", **result}
        )
    except ValueError:
        return jsonify({"success": False, "message": "Subject not found"}), 404
    except Exception:
        db.rollback()
        return jsonify(
            {"success": False, "message": "Unable to upload marks."}
        ), 500


# --- Defaulter ------------------------------------------------------


@teacher_bp.route("/defaulter")
@login_required
@role_required('teacher')
def defaulter():
    teacher = Teacher.by_user_id_with_dept(session["user_id"])
    return render_template(
        "teacher/defaulter.html",
        teacher_name=teacher["name"],
        department=teacher["dept_name"],
    )


@teacher_bp.route("/defaulters/<year_name>")
@login_required
@role_required('teacher')
def defaulters_list(year_name):
    teacher = _current_teacher()
    if not teacher:
        return jsonify([])

    rows = db.query(
        """
        SELECT st.id, st.name, st.roll_no, y.name AS year, u.phone,
            ROUND(
                (SUM(CASE WHEN a.status = 'P' THEN 1 ELSE 0 END)
                 / COUNT(a.id)) * 100, 2
            ) AS attendance_percent
        FROM students st
        JOIN users u ON st.user_id = u.id
        JOIN years y ON st.year_id = y.id
        JOIN attendance a ON st.id = a.student_id
        JOIN subjects s ON a.subject_id = s.id
        WHERE st.dept_id = %s AND y.name = %s AND s.year_id = y.id
        GROUP BY st.id, st.name, st.roll_no, y.name, u.phone
        HAVING attendance_percent < 75
        ORDER BY attendance_percent ASC
        """,
        (teacher["dept_id"], year_name),
    )
    return jsonify(
        [
            {
                "id": r["id"],
                "name": r["name"],
                "roll": r["roll_no"],
                "year": r["year"],
                "phone": r["phone"],
                "percent": r["attendance_percent"],
            }
            for r in rows
        ]
    )


# --- Profile --------------------------------------------------------


@teacher_bp.route("/profile")
@login_required
@role_required('teacher')
def profile():
    teacher = _current_teacher_with_names()
    return render_template(
        "teacher/profile.html",
        name=teacher["name"],
        username=teacher["username"],
        phone=teacher["phone"],
        department=teacher["department"],
    )


@teacher_bp.route("/change-password", methods=["GET", "POST"])
@login_required
@role_required('teacher')
def change_password():
    if request.method == "POST":
        current_password = request.form["current_password"]
        new_password = request.form["new_password"]

        user = User.find_by_id(session["user_id"])

        if not user:
            flash("User not found.", "error")
            return redirect(url_for("teacher.change_password"))

        if not User.verify_password(user["password"], current_password):
            flash("Old password is incorrect.", "error")
            return redirect(url_for("teacher.change_password"))

        if current_password == new_password:
            flash("New password cannot be same as old password.", "error")
            return redirect(url_for("teacher.change_password"))

        User.update_password(session["user_id"], new_password)
        db.commit()
        flash("Password changed successfully.", "success")
        return redirect(url_for("teacher.change_password"))

    return render_template("teacher/change_password.html")


def _current_teacher_with_names():
    return db.query_one(
        """
        SELECT t.name, t.username, u.phone, d.name AS department
        FROM teachers t
        JOIN users u ON t.user_id = u.id
        JOIN departments d ON t.dept_id = d.id
        WHERE t.user_id = %s
        """,
        (session["user_id"],),
    )
