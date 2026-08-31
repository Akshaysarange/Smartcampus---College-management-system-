from app.utils import db


class Attendance:
    @staticmethod
    def upsert(student_id, subject_id, date, status):
        """Insert or update a single attendance row."""
        return db.execute(
            """
            INSERT INTO attendance (student_id, subject_id, date, status)
            VALUES (%s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE status = VALUES(status)
            """,
            (student_id, subject_id, date, status),
        )

    @staticmethod
    def upsert_present(student_id, subject_id, date):
        """Mark a student present, creating the row if needed."""
        return db.execute(
            """
            INSERT INTO attendance (student_id, subject_id, date, status)
            VALUES (%s, %s, %s, 'P')
            ON DUPLICATE KEY UPDATE status = 'P'
            """,
            (student_id, subject_id, date),
        )

    @staticmethod
    def insert_absent_if_missing(student_id, subject_id, date):
        """Default a student to absent, without overriding existing rows."""
        return db.execute(
            """
            INSERT IGNORE INTO attendance (student_id, subject_id, date, status)
            VALUES (%s, %s, %s, 'A')
            """,
            (student_id, subject_id, date),
        )

    @staticmethod
    def rows_for_subject_date(subject_id, date):
        return db.query(
            """
            SELECT st.name, st.roll_no, a.status
            FROM attendance a
            JOIN students st ON st.id = a.student_id
            WHERE a.subject_id = %s AND a.date = %s
            ORDER BY st.roll_no
            """,
            (subject_id, date),
        )

    @staticmethod
    def students_with_attendance(dept_id, year_name, subject_id, date):
        return db.query(
            """
            SELECT st.id, st.name, st.roll_no,
                   IFNULL(a.status, 'P') AS status
            FROM students st
            JOIN years y ON st.year_id = y.id
            LEFT JOIN attendance a
                ON a.student_id = st.id
                AND a.subject_id = %s
                AND a.date = %s
            WHERE st.dept_id = %s AND y.name = %s
            ORDER BY st.roll_no
            """,
            (subject_id, date, dept_id, year_name),
        )

    @staticmethod
    def counts_for_subject_date(dept_id, year_id, subject_id, date):
        return db.query_one(
            """
            SELECT
                SUM(CASE WHEN COALESCE(a.status, 'A') = 'P' THEN 1 ELSE 0 END) AS present,
                SUM(CASE WHEN COALESCE(a.status, 'A') = 'A' THEN 1 ELSE 0 END) AS absent,
                COUNT(st.id) AS total
            FROM students st
            LEFT JOIN attendance a
                ON a.student_id = st.id
                AND a.subject_id = %s
                AND a.date = %s
            WHERE st.dept_id = %s AND st.year_id = %s
            """,
            (subject_id, date, dept_id, year_id),
        )

    @staticmethod
    def delete_for_student(student_id):
        return db.execute(
            "DELETE FROM attendance WHERE student_id = %s",
            (student_id,),
        )
