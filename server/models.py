
from flask import request, session
from flask_restful import Resource

from config import app, db, api
from models import User, Account, Transaction, Branch, Loan, UserAccount


# OPTIONAL: session secret (you can also set this in config.py)
app.secret_key = "change-me-in-production"


# -------------------------
# Error handlers
# -------------------------

@app.errorhandler(404)
def handle_404(e):
    return {"error": "Resource not found"}, 404


@app.errorhandler(400)
def handle_400(e):
    return {"error": "Bad request"}, 400


@app.errorhandler(500)
def handle_500(e):
    return {"error": "Internal server error"}, 500

# -------------------------
# Auth resources
# -------------------------

class Signup(Resource):
    def post(self):
        data = request.get_json() or {}

        required = ['username', 'email', 'password']
        if not all(field in data for field in required):
            return {"error": "Missing required fields"}, 400

        if User.query.filter((User.username == data['username']) | (User.email == data['email'])).first():
            return {"error": "User with that username or email already exists"}, 400

        new_user = User(
            username=data['username'],
            email=data['email'],
            first_name=data.get('first_name'),
            last_name=data.get('last_name'),
        )
        new_user.password_hash = data['password']

        db.session.add(new_user)
        db.session.commit()

        session['user_id'] = new_user.id

        return new_user.to_dict(), 201


class Login(Resource):
    def post(self):
        data = request.get_json() or {}
        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return {"error": "Username and password required"}, 400

        user = User.query.filter_by(username=username).first()
        if not user or not user.authenticate(password):
            return {"error": "Invalid username or password"}, 401

        session['user_id'] = user.id
        return user.to_dict(), 200