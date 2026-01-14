# server/auth.py

from functools import wraps
from flask import session
from models import User, UserAccount

def login_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if not session.get("user_id"):
            return {"error": "Unauthorized"}, 401
        return fn(*args, **kwargs)
    return wrapper


def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        user_id = session.get("user_id")
        if not user_id:
            return {"error": "Unauthorized"}, 401

        user = User.query.get(user_id)
        if not user or not user.is_admin:
            return {"error": "Forbidden — Admins only"}, 403

        return fn(*args, **kwargs)
    return wrapper


def owner_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        user_id = session.get("user_id")
        if not user_id:
            return {"error": "Unauthorized"}, 401

        account_id = kwargs.get("id")

        link = UserAccount.query.filter_by(
            user_id=user_id,
            account_id=account_id
        ).first()

        if not link:
            return {"error": "Forbidden — Not your account"}, 403

        return fn(*args, **kwargs)
    return wrapper
