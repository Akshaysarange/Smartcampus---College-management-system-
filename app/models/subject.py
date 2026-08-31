from app.utils import db


class Subject:
    @staticmethod
    def by_dept_year(dept_id, year_id):
        return db.query(
            """
            SELECT id, name
            FROM subjects
            WHERE dept_id = %s AND year_id = %s
            ORDER BY id
            """,
            (dept_id, year_id),
        )

    @staticmethod
    def find_in_dept_year(subject_ids, dept_id, year_id):
        if not subject_ids:
            return set()
        placeholders = ", ".join(["%s"] * len(subject_ids))
        rows = db.query(
            f"""
            SELECT id
            FROM subjects
            WHERE dept_id = %s AND year_id = %s AND id IN ({placeholders})
            """,
            [dept_id, year_id] + subject_ids,
        )
        return {str(row["id"]) for row in rows}

    @staticmethod
    def info(subject_id):
        return db.query_one(
            """
            SELECT s.id, s.name, d.name AS department, y.name AS year
            FROM subjects s
            JOIN departments d ON d.id = s.dept_id
            JOIN years y ON y.id = s.year_id
            WHERE s.id = %s
            """,
            (subject_id,),
        )

    @staticmethod
    def year_name(subject_id):
        row = db.query_one(
            """
            SELECT y.name
            FROM subjects s
            JOIN years y ON y.id = s.year_id
            WHERE s.id = %s
            """,
            (subject_id,),
        )
        return row["name"] if row else None
