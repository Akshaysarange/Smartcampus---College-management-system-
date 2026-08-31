from functools import wraps

from flask import redirect, session, url_for


def login_required(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        if "user_id" not in session:
            return redirect(url_for("auth.login"))
        return view(*args, **kwargs)

    return wrapped


def role_required(role):
    def decorator(view):
        @wraps(view)
        def wrapped(*args, **kwargs):
            if "user_id" not in session:
                return redirect(url_for("auth.login"))
            if session.get("role") != role:
                return redirect(url_for("auth.login"))
            return view(*args, **kwargs)

        return wrapped

    return decorator


def is_logged_in(role=None):
    if "user_id" not in session:
        return False
    if role and session.get("role") != role:
        return False
    return True
