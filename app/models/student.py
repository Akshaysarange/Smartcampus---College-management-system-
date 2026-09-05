from app.utils import db


class Student:
    @staticmethod
    def by_user_id(user_id):
        return db.query_one(
            """
            SELECT st.id, st.name, st.username, st.roll_no,
                   st.dept_id, st.year_id
            FROM students st
            WHERE st.user_id = %s
            """,
            (user_id,),
        )

    @staticmethod
    def by_user_id_with_names(user_id):
        return db.query_one(
            """
            SELECT st.id, st.name, st.roll_no, st.username,
                   d.name AS department, y.name AS year,
                   y.id AS year_id
            FROM students st
            JOIN departments d ON st.dept_id = d.id
            JOIN years y ON st.year_id = y.id
            WHERE st.user_id = %s
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
            FROM students
            """
        )

    @staticmethod
    def next_roll(dept_id, year_id):
        row = db.query_one(
            """
            SELECT COALESCE(MAX(CAST(roll_no AS UNSIGNED)), 0) AS max_roll
            FROM students
            WHERE dept_id = %s AND year_id = %s
            """,
            (dept_id, year_id),
        )
        return row["max_roll"] + 1

    @staticmethod
    def create(user_id, name, username, roll_no, dept_id, year_id):
        return db.insert_and_get_id(
            """
            INSERT INTO students (user_id, name, username, roll_no, dept_id, year_id)
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (user_id, name, username, roll_no, dept_id, year_id),
        )

    @staticmethod
    def by_dept_year_id(dept_id, year_id):
        return db.query(
            """
            SELECT st.id
            FROM students st
            WHERE st.dept_id = %s AND st.year_id = %s
            ORDER BY st.id
            """,
            (dept_id, year_id),
        )

    @staticmethod
    def by_dept_year_name(dept_id, year_name):
        return db.query(
            """
            SELECT st.id
            FROM students st
            JOIN years y ON st.year_id = y.id
            WHERE st.dept_id = %s AND y.name = %s
            ORDER BY st.id
            """,
            (dept_id, year_name),
        )

    @staticmethod
    def list_by_dept_year_name(dept_name, year_name):
        return db.query(
            """
            SELECT st.id, st.name, st.roll_no, st.username
            FROM students st
            JOIN departments d ON st.dept_id = d.id
            JOIN years y ON st.year_id = y.id
            WHERE d.name = %s AND y.name = %s
            ORDER BY st.id
            """,
            (dept_name, year_name),
        )

    @staticmethod
    def user_id_by_student_id(student_id):
        row = db.query_one(
            "SELECT user_id FROM students WHERE id = %s",
            (student_id,),
        )
        return row["user_id"] if row else None

    @staticmethod
    def delete(student_id):
        return db.execute(
            "DELETE FROM students WHERE id = %s",
            (student_id,),
        )
