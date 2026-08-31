from app.utils import db


class Teacher:
    @staticmethod
    def by_user_id(user_id):
        return db.query_one(
            """
            SELECT t.id, t.dept_id, t.name, t.username
            FROM teachers t
            WHERE t.user_id = %s
            """,
            (user_id,),
        )

    @staticmethod
    def by_user_id_with_dept(user_id):
        return db.query_one(
            """
            SELECT t.id, t.dept_id, d.name AS dept_name, t.name
            FROM teachers t
            JOIN departments d ON t.dept_id = d.id
            WHERE t.user_id = %s
            """,
            (user_id,),
        )

    @staticmethod
    def dept_count():
        return db.query_one(
            """
            SELECT
                COUNT(*) AS total,
                SUM(CASE WHEN dept_id = 1 THEN 1 ELSE 0 END) AS cs,
                SUM(CASE WHEN dept_id = 2 THEN 1 ELSE 0 END) AS it,
                SUM(CASE WHEN dept_id = 3 THEN 1 ELSE 0 END) AS dsda,
                SUM(CASE WHEN dept_id = 4 THEN 1 ELSE 0 END) AS ai
            FROM teachers
            """
        )

    @staticmethod
    def subjects_for_year(teacher_id, dept_id, year_name):
        return db.query(
            """
            SELECT s.id, s.name
            FROM subjects s
            JOIN teacher_subjects ts ON s.id = ts.subject_id
            JOIN years y ON s.year_id = y.id
            WHERE ts.teacher_id = %s
              AND s.dept_id = %s
              AND y.name = %s
            ORDER BY s.id
            """,
            (teacher_id, dept_id, year_name),
        )

    @staticmethod
    def has_subject_for_year(teacher_id, subject_id, dept_id, year_name):
        return db.query_one(
            """
            SELECT s.id
            FROM subjects s
            JOIN teacher_subjects ts ON ts.subject_id = s.id
            JOIN years y ON s.year_id = y.id
            WHERE ts.teacher_id = %s
              AND s.id = %s
              AND s.dept_id = %s
              AND y.name = %s
            """,
            (teacher_id, subject_id, dept_id, year_name),
        )

    @staticmethod
    def has_subject(teacher_id, subject_id):
        return db.query_one(
            """
            SELECT ts.teacher_id
            FROM teacher_subjects ts
            WHERE ts.teacher_id = %s AND ts.subject_id = %s
            """,
            (teacher_id, subject_id),
        )

    @staticmethod
    def dept_student_counts(dept_id):
        cur = db.get_connection().cursor()
        try:
            result = {}
            for year_id, key in ((1, "fy"), (2, "sy"), (3, "ty")):
                cur.execute(
                    "SELECT COUNT(*) FROM students WHERE dept_id=%s AND year_id=%s",
                    (dept_id, year_id),
                )
                result[key] = cur.fetchone()[0]
            return result
        finally:
            cur.close()

    @staticmethod
    def find_by_dept(dept_name):
        return db.query(
            """
            SELECT t.name, u.phone, t.username, u.password
            FROM teachers t
            JOIN users u ON t.user_id = u.id
            JOIN departments d ON t.dept_id = d.id
            WHERE d.name = %s
            ORDER BY t.id
            """,
            (dept_name,),
        )
