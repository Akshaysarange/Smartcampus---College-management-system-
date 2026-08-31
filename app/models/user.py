from werkzeug.security import (
    check_password_hash,
    generate_password_hash,
)

from app.utils import db

_HASH_PREFIXES = ("pbkdf2:", "scrypt:", "argon2:", "bcrypt:")


def _looks_hashed(stored):
    """Return True if the stored value is a Werkzeug password hash."""
    if not isinstance(stored, str):
        return False
    return stored.startswith(_HASH_PREFIXES)


class User:
    @staticmethod
    def find_by_username(username):
        return db.query_one(
            "SELECT * FROM users WHERE BINARY username = %s",
            (username,),
        )

    @staticmethod
    def find_by_id(user_id):
        return db.query_one(
            "SELECT * FROM users WHERE id = %s",
            (user_id,),
        )

    @staticmethod
    def get_phone(user_id):
        user = db.query_one(
            "SELECT phone FROM users WHERE id = %s",
            (user_id,),
        )
        return user["phone"] if user else None

    @staticmethod
    def verify_password(stored, provided):
        """Check a password against a stored hash or legacy plaintext."""
        if _looks_hashed(stored):
            return check_password_hash(stored, provided)
        return stored == provided

    @staticmethod
    def is_hashed(password):
        return _looks_hashed(password)

    @staticmethod
    def make_hash(password):
        return generate_password_hash(password)

    @staticmethod
    def update_password(user_id, new_password):
        return db.execute(
            "UPDATE users SET password = %s WHERE id = %s",
            (User.make_hash(new_password), user_id),
        )

    @staticmethod
    def upgrade_password_to_hash(user_id, plaintext):
        """Store a hash for a user still on plaintext (lazy migration)."""
        return db.execute(
            "UPDATE users SET password = %s WHERE id = %s",
            (User.make_hash(plaintext), user_id),
        )

    @staticmethod
    def mark_first_login_complete(user_id):
        return db.execute(
            "UPDATE users SET first_login = 0 WHERE id = %s",
            (user_id,),
        )

    @staticmethod
    def create(username, password, role, phone=None):
        return db.insert_and_get_id(
            """
            INSERT INTO users (username, password, role, first_login, phone)
            VALUES (%s, %s, %s, 1, %s)
            """,
            (username, User.make_hash(password), role, phone),
        )

    @staticmethod
    def delete(user_id):
        return db.execute("DELETE FROM users WHERE id = %s", (user_id,))
