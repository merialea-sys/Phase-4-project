# server/app.py

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



