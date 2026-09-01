"""Apply pending database migrations to keep every teammate's DB in sync.

The project keeps its base schema in `database.sql` (run once for a fresh
install). Schema changes after that live as small, ordered .sql files in the
`migrations/` folder, one change per file:

    migrations/0002_add_student_phone.sql
    migrations/0003_create_timetable.sql

Each file is numbered (NNNN_) and only ever applied once per database. This
script applies every not-yet-applied migration in order and records it in a
`schema_migrations` table so reruns are safe and idempotent.

Usage (from the project root, with the DB running and .env configured):
    python run_migrations.py
    python run_migrations.py --dry-run   # preview without changing anything

When you add a new migration, commit its .sql file to git. Teammates just run
`git pull` and then `python run_migrations.py` — no manual changes needed.
"""

import os
import sys

from config import Config
from app.extensions import mysql

MIGRATIONS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "migrations")
BASELINE_VERSION = "0001_baseline"
_BASE_TABLES = ("departments", "years", "subjects", "users", "teachers",
                "students", "attendance", "marks")


def _db_has_base_schema(cur):
    """True if the base tables from database.sql already exist."""
    cur.execute(
        """
        SELECT COUNT(*) FROM information_schema.tables
        WHERE table_schema = %s AND table_name IN (%s, %s, %s)
        """,
        (Config.MYSQL_DB, "departments", "users", "students"),
    )
    return cur.fetchone()[0] == 3


def _is_sql_file(name):
    return name.lower().endswith(".sql")


def _migration_files():
    files = [name for name in os.listdir(MIGRATIONS_DIR) if _is_sql_file(name)]
    return sorted(files)


def _applied_versions(cur):
    cur.execute("SELECT version FROM schema_migrations")
    return {row[0] for row in cur.fetchall()}


def _apply_migration(cur, filename):
    path = os.path.join(MIGRATIONS_DIR, filename)
    with open(path, "r", encoding="utf-8") as handle:
        statements = handle.read()

    version = filename.split("_", 1)[0]
    print(f"  {filename}")
    for statement in statements.split(";"):
        clean = statement.strip().rstrip(";").strip()
        if clean and not clean.startswith("--"):
            cur.execute(clean)


def main():
    dry_run = "--dry-run" in sys.argv

    if not os.path.isdir(MIGRATIONS_DIR):
        raise SystemExit(f"Migrations folder not found: {MIGRATIONS_DIR}")

    app = __import__("app").create_app()
    with app.app_context():
        cur = mysql.connection.cursor()
        try:
            if not _db_has_base_schema(cur):
                raise SystemExit(
                    "Base schema not found. Run `database.sql` first, "
                    "then `python run_migrations.py`."
                )

            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS schema_migrations (
                    version VARCHAR(64) PRIMARY KEY,
                    applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
                """
            )
            mysql.connection.commit()

            applied = _applied_versions(cur)
            if BASELINE_VERSION not in applied:
                cur.execute(
                    "INSERT INTO schema_migrations (version) VALUES (%s)",
                    (BASELINE_VERSION,),
                )
                applied.add(BASELINE_VERSION)
                mysql.connection.commit()

            pending = [f for f in _migration_files()
                       if f.split("_", 1)[0] not in applied]

            if not pending:
                print("No pending migrations. Up to date.")
                return

            print(f"Applying {len(pending)} migration(s):")
            for filename in pending:
                if dry_run:
                    print(f"  [dry-run] would apply {filename}")
                    continue
                version = filename.split("_", 1)[0]
                _apply_migration(cur, filename)
                cur.execute(
                    "INSERT INTO schema_migrations (version) VALUES (%s)",
                    (version,),
                )
                mysql.connection.commit()

            print("Done.")
        except Exception as error:
            mysql.connection.rollback()
            raise SystemExit(f"Migration failed: {error}")
        finally:
            cur.close()


if __name__ == "__main__":
    main()
