import os

from dotenv import load_dotenv

basedir = os.path.abspath(os.path.dirname(__file__))

load_dotenv(os.path.join(basedir, ".env"))


class Config:
    """Application configuration loaded from environment variables."""

    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-insecure-key")

    DEBUG = os.environ.get("DEBUG", "True").lower() in (
        "1",
        "true",
        "yes",
        "on",
    )

    # MySQL
    MYSQL_HOST = os.environ.get("MYSQL_HOST", "localhost")
    MYSQL_USER = os.environ.get("MYSQL_USER", "root")
    MYSQL_PASSWORD = os.environ.get("MYSQL_PASSWORD", "root")
    MYSQL_DB = os.environ.get("MYSQL_DB", "smartcampus")

    # Email (Gmail SMTP) for "forgot username/password"
    MAIL_ENABLED = os.environ.get("MAIL_ENABLED", "false").lower() in (
        "1",
        "true",
        "yes",
        "on",
    )
    MAIL_SERVER = os.environ.get("MAIL_SERVER", "smtp.gmail.com")
    MAIL_PORT = int(os.environ.get("MAIL_PORT", "587"))
    MAIL_USE_TLS = os.environ.get("MAIL_USE_TLS", "true").lower() in (
        "1",
        "true",
        "yes",
        "on",
    )
    MAIL_USER = os.environ.get("MAIL_USER", "")
    MAIL_PASS = os.environ.get("MAIL_PASS", "")
    MAIL_FROM = os.environ.get("MAIL_FROM", os.environ.get("MAIL_USER", ""))
