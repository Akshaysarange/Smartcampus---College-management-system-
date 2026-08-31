from app.utils import db


def next_username(role, start_number):
    """Generate the next email-style username for teacher/student.

    Picks the first free integer ID (>= start_number) rather than
    max(id) + 1, so it does not collide after deletions.
    """
    domain = "@college.ac.in"

    rows = db.query(
        "SELECT username FROM users WHERE role = %s",
        (role,),
    )

    used_ids = set()
    for row in rows:
        try:
            used_ids.add(int(row["username"].split("@")[0]))
        except (ValueError, AttributeError):
            continue

    candidate = start_number
    while candidate in used_ids:
        candidate += 1

    return f"{candidate}{domain}"


def get_attendance_summary(student_id, year_name=None):
    """Return present/absent/leave/total/percent for a student."""
    if year_name:
        rows = db.query(
            """
            SELECT a.status, COUNT(*) AS count
            FROM attendance a
            JOIN subjects s ON a.subject_id = s.id
            JOIN years y ON s.year_id = y.id
            WHERE a.student_id = %s AND y.name = %s
            GROUP BY a.status
            """,
            (student_id, year_name),
        )
    else:
        rows = db.query(
            """
            SELECT status, COUNT(*) AS count
            FROM attendance
            WHERE student_id = %s
            GROUP BY status
            """,
            (student_id,),
        )

    present = absent = leave = 0

    for row in rows:
        status = row["status"]
        count = row["count"]
        if status == "P":
            present = count
        elif status == "A":
            absent = count
        elif status == "L":
            leave = count

    total = present + absent + leave
    percent = round((present / total) * 100, 2) if total > 0 else 0

    return {
        "present": present,
        "absent": absent,
        "leave": leave,
        "total": total,
        "percent": percent,
    }
