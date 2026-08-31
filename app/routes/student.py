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
from app.models import Marks, Student, User, helpers
from app.services import attendance_service
from app.utils import db

student_bp = Blueprint("student", __name__, url_prefix="/student")



@student_bp.route("/dashboard")
@login_required
@role_required('student')
def dashboard():
    return redirect(url_for("student.attendance"))


@student_bp.route("/attendance")
@login_required
@role_required('student')
def attendance():
    student = Student.by_user_id_with_names(session["user_id"])
    if not student:
        flash("Student profile not found!", "error")
        return redirect(url_for("auth.login"))

    student_id = student["id"]
    year = student["year"]

    current_summary = helpers.get_attendance_summary(student_id, year)
    fy_summary = helpers.get_attendance_summary(student_id, "FY")
    sy_summary = helpers.get_attendance_summary(student_id, "SY")
    ty_summary = helpers.get_attendance_summary(student_id, "TY")

    total = current_summary["total"]
    present = current_summary["present"]
    absent = current_summary["absent"]
    leave = current_summary["leave"]
    attendance_percent = current_summary["percent"]

    if total > 0:
        present_degree = round((present / total) * 360, 2)
        absent_degree = round(((present + absent) / total) * 360, 2)
    else:
        present_degree = 0
        absent_degree = 0

    history_rows = db.query(
        """
        SELECT a.date, s.name AS subject_name, y.name AS year_name, a.status
        FROM attendance a
        JOIN subjects s ON s.id = a.subject_id
        JOIN years y ON y.id = s.year_id
        WHERE a.student_id = %s
        ORDER BY a.date DESC LIMIT 10
        """,
        (student_id,),
    )

    attendance_history = [
        {
            "date": row["date"].strftime("%d-%m-%Y") if row["date"] else "-",
            "subject": row["subject_name"] or "-",
            "year": row["year_name"] or "-",
            "status": row["status"] or "-",
        }
        for row in history_rows
    ]

    return render_template(
        "student/attendance.html",
        student_name=student["name"],
        department=student["department"],
        year=year,
        present=present,
        absent=absent,
        leave=leave,
        total=total,
        attendance_percent=attendance_percent,
        present_degree=present_degree,
        absent_degree=absent_degree,
        fy_percent=fy_summary["percent"],
        sy_percent=sy_summary["percent"],
        ty_percent=ty_summary["percent"],
        attendance_history=attendance_history,
    )


@student_bp.route("/attendance/verify-otp", methods=["POST"])
@login_required
@role_required('student')
def verify_otp():
    data = request.get_json(silent=True)
    if not data:
        return jsonify(
            {"success": False, "message": "Invalid request data."}
        ), 400

    otp_code = str(data.get("otp_code", "")).strip()
    latitude = data.get("latitude")
    longitude = data.get("longitude")

    if not otp_code.isdigit() or len(otp_code) != 6:
        return jsonify(
            {"success": False, "message": "Please enter a valid 6-digit OTP."}
        ), 400

    try:
        student_latitude = float(latitude)
        student_longitude = float(longitude)
    except (TypeError, ValueError):
        return jsonify(
            {"success": False, "message": "Invalid student location."}
        ), 400

    if not -90 <= student_latitude <= 90:
        return jsonify({"success": False, "message": "Invalid latitude."}), 400
    if not -180 <= student_longitude <= 180:
        return jsonify({"success": False, "message": "Invalid longitude."}), 400

    student = Student.by_user_id(session["user_id"])
    if not student:
        return jsonify({"success": False, "message": "Student not found."}), 404

    try:
        result = attendance_service.verify_otp(
            student["id"],
            student["dept_id"],
            student["year_id"],
            otp_code,
            student_latitude,
            student_longitude,
        )
        return jsonify(
            {
                "success": True,
                "message": f"Attendance marked successfully for {result['subject']}.",
                **result,
            }
        )
    except PermissionError as error:
        msg = str(error)
        if msg == "wrong-department":
            message = "This OTP is not for your department."
        elif msg == "wrong-year":
            message = "This OTP is not for your year."
        elif msg.startswith("outside-radius:"):
            _, distance, allowed = msg.split(":")
            message = (
                "You are outside the allowed attendance area. "
                f"Distance: {distance} metres. Allowed: {allowed} metres."
            )
            return jsonify(
                {
                    "success": False,
                    "message": message,
                    "distance": round(float(distance), 2),
                    "allowed_radius": int(allowed),
                }
            ), 403
        else:
            message = "Unable to mark attendance. Please try again."
        return jsonify({"success": False, "message": message}), 403
    except ValueError:
        return jsonify(
            {"success": False, "message": "OTP is invalid or expired."}
        ), 400
    except Exception:
        return jsonify(
            {"success": False, "message": "Unable to mark attendance. Please try again."}
        ), 500


@student_bp.route("/result")
@login_required
@role_required('student')
def result():
    selected_year = request.args.get("year", "FY")

    student = db.query_one(
        """
        SELECT st.id, st.name, st.roll_no, d.name, y.name
        FROM students st
        JOIN departments d ON st.dept_id = d.id
        JOIN years y ON st.year_id = y.id
        WHERE st.user_id = %s
        """,
        (session["user_id"],),
    )

    rows = Marks.for_student_year(student["id"], selected_year)

    results = []
    obtained_total = 0
    max_total = 0
    fail = False

    for r in rows:
        subject_total = r["internal_marks"] + r["theory_marks"]
        percent = round((subject_total / r["total_marks"]) * 100, 2)

        if percent < 40:
            fail = True

        obtained_total += subject_total
        max_total += r["total_marks"]

        results.append(
            {
                "subject": r["name"],
                "internal": r["internal_marks"],
                "theory": r["theory_marks"],
                "total": subject_total,
                "max": r["total_marks"],
                "percent": percent,
            }
        )

    if max_total > 0:
        overall_percent = round((obtained_total / max_total) * 100, 2)
        sgpa = round(overall_percent / 10, 2)
        cgpa = sgpa
        status = "FAIL" if fail else "PASS"
    else:
        overall_percent = 0
        sgpa = 0
        cgpa = 0
        status = "NOT AVAILABLE"

    return render_template(
        "student/result.html",
        student=student,
        selected_year=selected_year,
        results=results,
        obtained_total=obtained_total,
        max_total=max_total,
        overall_percent=overall_percent,
        sgpa=sgpa,
        cgpa=cgpa,
        status=status,
    )


@student_bp.route("/profile")
@login_required
@role_required('student')
def profile():
    student = db.query_one(
        """
        SELECT st.name, st.roll_no, st.username, u.phone,
               d.name AS department, y.name AS year
        FROM students st
        JOIN users u ON st.user_id = u.id
        JOIN departments d ON st.dept_id = d.id
        JOIN years y ON st.year_id = y.id
        WHERE st.user_id = %s
        """,
        (session["user_id"],),
    )

    if not student:
        flash("Student profile not found!", "error")
        return redirect(url_for("student.attendance"))

    hour = datetime.now().hour
    return render_template(
        "student/profile.html",
        greeting=_greeting(hour),
        name=student["name"],
        roll_no=student["roll_no"],
        username=student["username"],
        phone=student["phone"],
        department=student["department"],
        year=student["year"],
    )


@student_bp.route("/change-password", methods=["GET", "POST"])
@login_required
@role_required('student')
def change_password():
    if request.method == "POST":
        old_password = request.form["old_password"]
        new_password = request.form["new_password"]

        user = User.find_by_id(session["user_id"])

        if user and User.verify_password(user["password"], old_password):
            User.update_password(session["user_id"], new_password)
            db.commit()
            flash("Password changed successfully!", "success")
        else:
            flash("Old password is incorrect!", "error")

        return redirect(url_for("student.change_password"))

    return render_template("student/password.html")


def _greeting(hour):
    if hour < 12:
        return "Good Morning"
    if hour < 17:
        return "Good Afternoon"
    return "Good Evening"
