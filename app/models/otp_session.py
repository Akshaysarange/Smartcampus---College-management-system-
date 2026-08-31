from datetime import datetime

from app.utils import db


class OtpSession:
    @staticmethod
    def close_all_for_teacher(teacher_id):
        return db.execute(
            """
            UPDATE attendance_otp_sessions
            SET is_active = 0
            WHERE teacher_id = %s AND is_active = 1
            """,
            (teacher_id,),
        )

    @staticmethod
    def create(
        teacher_id,
        subject_id,
        year_id,
        otp_code,
        latitude,
        longitude,
        allowed_radius,
        expires_at,
    ):
        return db.insert_and_get_id(
            """
            INSERT INTO attendance_otp_sessions (
                teacher_id, subject_id, year_id, otp_code,
                teacher_latitude, teacher_longitude, allowed_radius,
                expires_at, is_active
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 1)
            """,
            (
                teacher_id,
                subject_id,
                year_id,
                otp_code,
                latitude,
                longitude,
                allowed_radius,
                expires_at,
            ),
        )

    @staticmethod
    def expire_all_elapsed():
        return db.execute(
            """
            UPDATE attendance_otp_sessions
            SET is_active = 0
            WHERE is_active = 1 AND expires_at <= NOW()
            """
        )

    @staticmethod
    def find_active_by_code(otp_code):
        return db.query_one(
            """
            SELECT
                aos.id, aos.teacher_id, aos.subject_id, aos.year_id,
                aos.teacher_latitude, aos.teacher_longitude,
                aos.allowed_radius, aos.expires_at,
                s.name AS subject_name, s.dept_id AS subject_dept_id,
                y.name AS year_name
            FROM attendance_otp_sessions aos
            JOIN subjects s ON s.id = aos.subject_id
            JOIN years y ON y.id = aos.year_id
            WHERE aos.otp_code = %s
              AND aos.is_active = 1
              AND aos.expires_at > NOW()
            ORDER BY aos.id DESC
            LIMIT 1
            """,
            (otp_code,),
        )

    @staticmethod
    def find_for_teacher(session_id, teacher_id):
        return db.query_one(
            """
            SELECT
                aos.subject_id, aos.year_id,
                DATE(aos.created_at) AS attendance_date,
                aos.is_active, aos.expires_at,
                s.name AS subject_name, y.name AS year_name,
                d.name AS department_name
            FROM attendance_otp_sessions aos
            JOIN subjects s ON s.id = aos.subject_id
            JOIN years y ON y.id = aos.year_id
            JOIN departments d ON d.id = s.dept_id
            WHERE aos.id = %s AND aos.teacher_id = %s
            LIMIT 1
            """,
            (session_id, teacher_id),
        )

    @staticmethod
    def find_status_for_teacher(session_id, teacher_id):
        return db.query_one(
            """
            SELECT
                aos.subject_id, aos.year_id,
                DATE(aos.created_at) AS attendance_date,
                aos.is_active, aos.expires_at,
                s.name AS subject_name, y.name AS year_name
            FROM attendance_otp_sessions aos
            JOIN subjects s ON s.id = aos.subject_id
            JOIN years y ON y.id = aos.year_id
            WHERE aos.id = %s AND aos.teacher_id = %s
            LIMIT 1
            """,
            (session_id, teacher_id),
        )

    @staticmethod
    def deactivate(session_id, teacher_id):
        return db.execute(
            """
            UPDATE attendance_otp_sessions
            SET is_active = 0
            WHERE id = %s AND teacher_id = %s
            """,
            (session_id, teacher_id),
        )

    @staticmethod
    def deactivate_by_id(session_id):
        return db.execute(
            "UPDATE attendance_otp_sessions SET is_active = 0 WHERE id = %s",
            (session_id,),
        )

    @staticmethod
    def year_id_by_name(year_name):
        row = db.query_one(
            "SELECT id FROM years WHERE name = %s",
            (year_name,),
        )
        return row["id"] if row else None
