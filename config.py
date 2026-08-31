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
