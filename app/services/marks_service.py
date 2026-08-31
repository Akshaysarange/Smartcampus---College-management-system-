from app.models import Marks, Subject
from app.utils import db


def submit_marks(subject_id, marks):
    """Persist a list of {student_id, internal, theory} marks."""
    year_name = Subject.year_name(subject_id)
    if not year_name:
        raise ValueError("subject-not-found")

    for item in marks:
        Marks.upsert(
            item["student_id"],
            subject_id,
            item["internal"],
            item["theory"],
            year_name,
        )

    db.commit()

    return {
        "updated": len(marks),
        "year": year_name,
    }
