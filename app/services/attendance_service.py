import secrets
from datetime import datetime, timedelta

from app.models import Attendance, OtpSession, Student, Subject, Teacher
from app.services.excel_service import update_attendance_excel
from app.utils import db
from app.utils.geolocation import haversine_distance_meters

ALLOWED_RADII = (50, 100, 150, 200)


def generate_otp(teacher_id, teacher_dept_id, subject_id, year_name,
                 latitude, longitude, allowed_radius):
    """Create an OTP attendance session and default students to absent."""
    year_id = OtpSession.year_id_by_name(year_name)
    if not year_id:
        raise ValueError("year-not-found")

    subject = Subject.info(subject_id)
    if not subject:
        raise ValueError("subject-not-found")

    assigned = Teacher.has_subject_for_year(
        teacher_id,
        subject_id,
        teacher_dept_id,
        year_name,
    )
    if not assigned:
        raise PermissionError("subject-not-assigned")

    # Close any previous active sessions for this teacher
    OtpSession.close_all_for_teacher(teacher_id)

    otp_code = str(secrets.randbelow(900000) + 100000)

    created_at = datetime.now()
    expires_at = created_at + timedelta(minutes=5)
    attendance_date = created_at.date()

    session_id = OtpSession.create(
        teacher_id,
        subject_id,
        year_id,
        otp_code,
        latitude,
        longitude,
        allowed_radius,
        expires_at,
    )

    # Default every student in the dept/year to Absent (only if missing)
    students = Student.by_dept_year_id(teacher_dept_id, year_id)
    for student_row in students:
        Attendance.insert_absent_if_missing(
            student_row["id"],
            subject_id,
            attendance_date,
        )

    attendance_rows = Attendance.rows_for_subject_date(
        subject_id,
        attendance_date,
    )

    db.commit()

    update_attendance_excel(
        subject["department"],
        subject["year"],
        subject["name"],
        attendance_date.strftime("%Y-%m-%d"),
        attendance_rows,
    )

    return {
        "session_id": session_id,
        "otp_code": otp_code,
        "year": year_name,
        "subject_id": subject_id,
        "subject_name": subject["name"],
        "allowed_radius": allowed_radius,
        "expires_at": expires_at.strftime("%Y-%m-%d %H:%M:%S"),
        "expires_in_seconds": 300,
        "total_students": len(students),
    }


def verify_otp(student_id, student_dept_id, student_year_id, otp_code,
               student_latitude, student_longitude):
    """Validate an OTP for a student and mark them present."""
    # Expire elapsed sessions
    OtpSession.expire_all_elapsed()

    session = OtpSession.find_active_by_code(otp_code)
    if not session:
        db.commit()
        raise ValueError("otp-invalid-or-expired")

    if student_dept_id != session["subject_dept_id"]:
        db.commit()
        raise PermissionError("wrong-department")

    if student_year_id != session["year_id"]:
        db.commit()
        raise PermissionError("wrong-year")

    distance = haversine_distance_meters(
        float(session["teacher_latitude"]),
        float(session["teacher_longitude"]),
        student_latitude,
        student_longitude,
    )

    allowed_radius = int(session["allowed_radius"])
    if distance > allowed_radius:
        db.commit()
        raise PermissionError(
            f"outside-radius:{round(distance)}:{allowed_radius}"
        )

    attendance_date = datetime.now().date()
    Attendance.upsert_present(student_id, session["subject_id"], attendance_date)

    subject = Subject.info(session["subject_id"])
    if not subject:
        db.rollback()
        raise ValueError("subject-not-found")

    attendance_rows = Attendance.rows_for_subject_date(
        session["subject_id"],
        attendance_date,
    )

    db.commit()

    update_attendance_excel(
        subject["department"],
        subject["year"],
        subject["name"],
        attendance_date.strftime("%Y-%m-%d"),
        attendance_rows,
    )

    return {
        "subject": subject["name"],
        "year": subject["year"],
        "status": "P",
        "distance": round(distance, 2),
        "allowed_radius": allowed_radius,
        "otp_session_id": session["id"],
    }


def stop_otp(teacher_id, teacher_dept_id, session_id):
    """Close an OTP session and return final present/absent counts."""
    session = OtpSession.find_for_teacher(session_id, teacher_id)
    if not session:
        raise ValueError("session-not-found")

    OtpSession.deactivate(session_id, teacher_id)

    counts = Attendance.counts_for_subject_date(
        teacher_dept_id,
        session["year_id"],
        session["subject_id"],
        session["attendance_date"],
    )

    attendance_rows = Attendance.rows_for_subject_date(
        session["subject_id"],
        session["attendance_date"],
    )

    db.commit()

    update_attendance_excel(
        session["department_name"],
        session["year_name"],
        session["subject_name"],
        session["attendance_date"].strftime("%Y-%m-%d"),
        attendance_rows,
    )

    present = int(counts["present"] or 0)
    absent = int(counts["absent"] or 0)

    return {
        "present": present,
        "absent": absent,
        "total": present + absent,
        "subject": session["subject_name"],
        "year": session["year_name"],
    }


def status(teacher_id, teacher_dept_id, session_id):
    """Return live present/absent counts for an OTP session."""
    session = OtpSession.find_status_for_teacher(session_id, teacher_id)
    if not session:
        raise ValueError("session-not-found")

    is_active = bool(session["is_active"])

    if session["expires_at"] <= datetime.now():
        OtpSession.deactivate_by_id(session_id)
        db.commit()
        is_active = False

    counts = Attendance.counts_for_subject_date(
        teacher_dept_id,
        session["year_id"],
        session["subject_id"],
        session["attendance_date"],
    )

    return {
        "session_id": session_id,
        "subject": session["subject_name"],
        "year": session["year_name"],
        "present": int(counts["present"] or 0),
        "absent": int(counts["absent"] or 0),
        "total": int(counts["total"] or 0),
        "is_active": is_active,
    }
