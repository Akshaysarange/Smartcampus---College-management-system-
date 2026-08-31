from flask import (
    Blueprint,
    flash,
    redirect,
    render_template,
    request,
    session,
    url_for,
)

from app.decorators import is_logged_in
from app.models import User

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/", methods=["GET", "POST"])
@auth_bp.route("/login", methods=["GET", "POST"])
def login():
    error = None

    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]

        user = User.find_by_username(username)

        if user and User.verify_password(user["password"], password):
            # Lazy password migration: upgrade plaintext to hash on login
            if not User.is_hashed(user["password"]):
                User.upgrade_password_to_hash(user["id"], password)

            session["user_id"] = user["id"]
            session["username"] = user["username"]
            session["role"] = user["role"]
            session["first_login"] = user["first_login"]

            if user["first_login"] == 1:
                return redirect(url_for("auth.change_password"))

            if user["role"] == "admin":
                return redirect(url_for("admin.find"))
            if user["role"] == "teacher":
                return redirect(url_for("teacher.find"))
            if user["role"] == "student":
                return redirect(url_for("student.attendance"))
        else:
            error = "Invalid username or password!"

    return render_template("login.html", error=error)


@auth_bp.route("/change-password", methods=["GET", "POST"])
def change_password():
    """First-login password change/skip page for all roles."""
    if "user_id" not in session:
        return redirect(url_for("auth.login"))

    if request.method == "POST":
        action = request.form.get("action")

        if action == "skip":
            User.mark_first_login_complete(session["user_id"])
            session["first_login"] = 0

        elif action == "change":
            new_password = request.form["new_password"]
            User.update_password(session["user_id"], new_password)
            User.mark_first_login_complete(session["user_id"])
            session["first_login"] = 0

        if session["role"] == "admin":
            return redirect(url_for("admin.find"))
        if session["role"] == "teacher":
            return redirect(url_for("teacher.find"))
        if session["role"] == "student":
            return redirect(url_for("student.attendance"))

    return render_template("change_password.html")


@auth_bp.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("auth.login"))
