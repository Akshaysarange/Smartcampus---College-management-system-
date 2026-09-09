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
from app.models import ResetOtp, User
from app.services.email_service import send_recovery_email

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


def _mask_email(email):
    """Mask an email address for display, e.g. ra***@gmail.com."""
    if not email or "@" not in email:
        return ""
    name, domain = email.split("@", 1)
    if len(name) <= 2:
        masked = name[:1] + "***"
    else:
        masked = name[:2] + "***"
    return f"{masked}@{domain}"


@auth_bp.route("/forgot", methods=["GET", "POST"])
def forgot():
    """Step 1: enter email -> sends username reminder + 6-digit OTP."""
    error = None

    if request.method == "POST":
        email = (request.form.get("email") or "").strip().lower()
        user = User.find_by_email(email) if email else None

        if not user:
            error = "No account found with that email address."
        elif user["role"] == "admin":
            error = "Admin accounts cannot be recovered online. Contact IT support."
        else:
            otp = ResetOtp.create(user["id"])
            send_recovery_email(
                user["email"],
                user["username"],
                otp,
                ResetOtp.EXPIRY_MINUTES,
            )
            session["recovery_user_id"] = user["id"]
            session["recovery_email"] = user["email"]
            flash("Recovery code sent to your email.", "success")
            return redirect(url_for("auth.forgot_verify"))

    return render_template("forgot.html", error=error)


@auth_bp.route("/forgot/verify", methods=["GET", "POST"])
def forgot_verify():
    """Step 2: enter the 6-digit OTP to unlock password reset."""
    user_id = session.get("recovery_user_id")
    if not user_id:
        return redirect(url_for("auth.forgot"))

    if request.method == "POST":
        code = request.form.get("otp", "").strip()
        if ResetOtp.validate(user_id, code):
            session["reset_user_id"] = user_id
            session.pop("recovery_user_id", None)
            return redirect(url_for("auth.reset_password"))
        error = "Invalid or expired code. Please try again."
    else:
        error = None

    return render_template(
        "forgot_verify.html",
        error=error,
        masked_email=_mask_email(session.get("recovery_email")),
    )


@auth_bp.route("/reset-password", methods=["GET", "POST"])
def reset_password():
    """Step 3: choose a new password (recovery is already verified)."""
    user_id = session.get("reset_user_id")
    if not user_id:
        return redirect(url_for("auth.forgot"))

    error = None

    if request.method == "POST":
        new_password = request.form.get("new_password", "")
        confirm_password = request.form.get("confirm_password", "")

        if len(new_password) < 4:
            error = "Password must be at least 4 characters long."
        elif new_password != confirm_password:
            error = "Passwords do not match."
        else:
            User.update_password(user_id, new_password)
            User.mark_first_login_complete(user_id)
            session.pop("reset_user_id", None)
            flash("Password reset successful. Please log in.", "success")
            return redirect(url_for("auth.login"))

    return render_template("reset_password.html", error=error)


@auth_bp.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("auth.login"))
