import smtplib
import ssl
from email.message import EmailMessage

from config import Config


def send_email(to, subject, body):
    """Send a plain-text email.

    Falls back to logging the message to the console when SMTP is not
    configured (MAIL_ENABLED=false or missing credentials), so the
    reset flow stays testable in development.
    """
    message = EmailMessage()
    message["From"] = Config.MAIL_FROM or "SmartCampus"
    message["To"] = to
    message["Subject"] = subject
    message.set_content(body)

    if not (Config.MAIL_ENABLED and Config.MAIL_USER and Config.MAIL_PASS):
        print(f"[MAIL-FALLBACK] To: {to}\nSubject: {subject}\n\n{body}\n")
        return True

    with smtplib.SMTP(Config.MAIL_SERVER, Config.MAIL_PORT, timeout=30) as server:
        if Config.MAIL_USE_TLS:
            server.starttls(context=ssl.create_default_context())
        server.login(Config.MAIL_USER, Config.MAIL_PASS)
        server.send_message(message)

    return True


def send_recovery_email(to, username, otp, expiry_minutes):
    """Send username reminder + one-time recovery code."""
    subject = "SmartCampus - Recover your account"
    body = (
        f"Hello,\n\n"
        f"You requested to recover your SmartCampus account.\n\n"
        f"Your username is: {username}\n"
        f"Your one-time recovery code is: {otp}\n\n"
        f"This code is valid for {expiry_minutes} minutes.\n\n"
        f"If you did not request this, you can ignore this email.\n\n"
        f"Regards,\nSmartCampus Team"
    )
    return send_email(to, subject, body)