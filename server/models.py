# server/models.py

from datetime import datetime

from sqlalchemy_serializer import SerializerMixin

from config import db
from werkzeug.security import generate_password_hash, check_password_hash


class UserAccount(db.Model, SerializerMixin):
    __tablename__ = 'user_accounts'

    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), primary_key=True)
    account_id = db.Column(db.Integer, db.ForeignKey('accounts.id'), primary_key=True)
    role = db.Column(db.String, nullable=False)

    # Relationships
    user = db.relationship('User', back_populates='user_accounts')
    account = db.relationship('Account', back_populates='user_accounts')

    # Avoid deep recursion
    serialize_rules = ('-user.user_accounts', '-account.user_accounts',)


