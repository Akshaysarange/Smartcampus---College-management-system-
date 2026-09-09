import hashlib
import secrets
from datetime import datetime, timedelta

from app.utils import db


class ResetOtp:
    EXPIRY_MINUTES = 10

    @staticmethod
    def _hash(code):
        return hashlib.sha256(code.encode("utf-8")).hexdigest()

    @staticmethod
    def _invalidate_pending(user_id):
        ResetOtp._touch(
            "UPDATE password_reset_otp SET used = 1 WHERE user_id = %s AND used = 0",
            (user_id,),
        )

    @staticmethod
    def _touch(sql, params=None):
        db.execute(sql, params)
        db.commit()

    @staticmethod
    def create(user_id):
        """Generate a fresh 6-digit OTP and invalidate any pending ones."""
        code = f"{secrets.randbelow(1000000):06d}"
        expires_at = datetime.now() + timedelta(minutes=ResetOtp.EXPIRY_MINUTES)

        ResetOtp._invalidate_pending(user_id)
        ResetOtp._touch(
            """
            INSERT INTO password_reset_otp (user_id, otp_hash, expires_at, used)
            VALUES (%s, %s, %s, 0)
            """,
            (user_id, ResetOtp._hash(code), expires_at),
        )
        return code

    @staticmethod
    def validate(user_id, code):
        """Return True and consume the code if valid, else False."""
        pending = db.query_one(
            """
            SELECT id, otp_hash, expires_at, used
            FROM password_reset_otp
            WHERE user_id = %s AND used = 0
            ORDER BY id DESC
            LIMIT 1
            """,
            (user_id,),
        )
        if not pending:
            return False

        if pending["expires_at"] < datetime.now():
            ResetOtp._invalidate_pending(user_id)
            return False

        if not secrets.compare_digest(pending["otp_hash"], ResetOtp._hash(code)):
            return False

        ResetOtp._touch(
            "UPDATE password_reset_otp SET used = 1 WHERE id = %s",
            (pending["id"],),
        )
        return True