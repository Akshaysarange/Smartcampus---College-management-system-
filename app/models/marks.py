from app.utils import db


class Marks:
    @staticmethod
    def upsert(student_id, subject_id, internal, theory, year_name):
        return db.execute(
            """
            INSERT INTO marks (
                student_id, subject_id, internal_marks, theory_marks,
                total_marks, year_name
            )
            VALUES (%s, %s, %s, %s, 100, %s)
            ON DUPLICATE KEY UPDATE
                internal_marks = VALUES(internal_marks),
                theory_marks = VALUES(theory_marks),
                total_marks = 100,
                year_name = VALUES(year_name)
            """,
            (student_id, subject_id, internal, theory, year_name),
        )

    @staticmethod
    def for_student_year(student_id, year_name):
        return db.query(
            """
            SELECT s.name, m.internal_marks, m.theory_marks, m.total_marks
            FROM marks m
            JOIN subjects s ON m.subject_id = s.id
            JOIN years y ON y.id = s.year_id
            WHERE m.student_id = %s AND y.name = %s
            ORDER BY s.id
            """,
            (student_id, year_name),
        )

    @staticmethod
    def students_with_marks(dept_id, year_name, subject_id):
        return db.query(
            """
            SELECT st.id, st.name, st.roll_no,
                   IFNULL(m.internal_marks, 0) AS internal,
                   IFNULL(m.theory_marks, 0) AS theory
            FROM students st
            JOIN years y ON st.year_id = y.id
            LEFT JOIN marks m
                ON st.id = m.student_id
                AND m.subject_id = %s
            WHERE st.dept_id = %s AND y.name = %s
            ORDER BY st.roll_no
            """,
            (subject_id, dept_id, year_name),
        )

    @staticmethod
    def delete_for_student(student_id):
        return db.execute(
            "DELETE FROM marks WHERE student_id = %s",
            (student_id,),
        )
