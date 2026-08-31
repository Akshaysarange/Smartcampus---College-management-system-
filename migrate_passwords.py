"""One-time migration: hash any remaining plaintext passwords in the users table.

Idempotent — rows that are already hashed are left untouched. Rows that are
still plaintext are rehashed using Werkzeug's generate_password_hash().

Usage (from the project root, with the DB running and .env configured):
    python migrate_passwords.py
"""

from app import create_app
from app.extensions import mysql
from app.models import User

_HASH_PREFIXES = ("pbkdf2:", "scrypt:", "argon2:", "bcrypt:")


def _looks_hashed(value):
    return isinstance(value, str) and value.startswith(_HASH_PREFIXES)


def main():
    app = create_app()
    with app.app_context():
        cur = mysql.connection.cursor()
        try:
            cur.execute("SELECT id, username, password FROM users")
            rows = cur.fetchall()

            migrated = 0
            for user_id, username, stored in rows:
                if _looks_hashed(stored):
                    continue

                cur.execute(
                    "UPDATE users SET password = %s WHERE id = %s",
                    (User.make_hash(stored), user_id),
                )
                migrated += 1
                print(f"Hashed password for {username} (id={user_id})")

            mysql.connection.commit()
            print(f"\nDone. Migrated {migrated} passwords.")
        except Exception as error:
            mysql.connection.rollback()
            raise SystemExit(f"Migration failed: {error}")
        finally:
            cur.close()


if __name__ == "__main__":
    main()
