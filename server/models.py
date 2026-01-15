# server/models.py

from datetime import datetime, timezone
from sqlalchemy_serializer import SerializerMixin
from werkzeug.security import generate_password_hash, check_password_hash


from config import db 


class UserAccount(db.Model, SerializerMixin):
    __tablename__ = 'user_accounts'

    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), primary_key=True)
    account_id = db.Column(db.Integer, db.ForeignKey('accounts.id'), primary_key=True)
    role = db.Column(db.String, nullable=False)

    # Relationships
    user = db.relationship('User', back_populates='user_accounts')
    account = db.relationship('Account', back_populates='user_accounts')

    serialize_rules = ('-user.user_accounts', '-account.user_accounts',)


class User(db.Model, SerializerMixin):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, nullable=False, unique=True)
    email = db.Column(db.String, nullable=False, unique=True)
    _password_hash = db.Column(db.String, nullable=False)
    first_name = db.Column(db.String)
    last_name = db.Column(db.String)
    date_of_birth = db.Column(db.DateTime)
    is_admin = db.Column(db.Boolean, default=False)

    # Relationships
    user_accounts = db.relationship('UserAccount', back_populates='user', cascade='all, delete-orphan')
    loans = db.relationship('Loan', back_populates='user', cascade='all, delete-orphan')

    serialize_rules = ('-_password_hash', '-user_accounts.user', '-loans.user')

    # Password helpers
    @property
    def password_hash(self):
        return self._password_hash

    @password_hash.setter
    def password_hash(self, plain_password):
        self._password_hash = generate_password_hash(plain_password)

    def authenticate(self, plain_password):
        return check_password_hash(self._password_hash, plain_password)


class Branch(db.Model, SerializerMixin):
    __tablename__ = 'branches'

    id = db.Column(db.Integer, primary_key=True)
    branch_name = db.Column(db.String, nullable=False)
    branch_code = db.Column(db.String, nullable=False, unique=True)
    address = db.Column(db.String)
    phone_number = db.Column(db.Integer)

    accounts = db.relationship('Account', back_populates='branch', cascade='all, delete-orphan')
    loans = db.relationship('Loan', back_populates='branch', cascade='all, delete-orphan')

    serialize_rules = ('-accounts.branch', '-loans.branch')


class Account(db.Model, SerializerMixin):
    __tablename__ = 'accounts'

    id = db.Column(db.Integer, primary_key=True)
    account_number = db.Column(db.Integer, unique=True, nullable=False)
    account_type = db.Column(db.String, nullable=False)
    current_balance = db.Column(db.Integer, default=0)
    status = db.Column(db.String, default='active')
    user_id = db.Column(db.Integer)  # optional direct link if you want
    branch_id = db.Column(db.Integer, db.ForeignKey('branches.id'), nullable=False)

    transactions = db.relationship('Transaction', back_populates='account', cascade='all, delete-orphan')
    user_accounts = db.relationship('UserAccount', back_populates='account', cascade='all, delete-orphan')
    branch = db.relationship('Branch', back_populates='accounts')

    serialize_rules = ('-transactions.account', '-user_accounts.account', '-branch.accounts')


class Transaction(db.Model, SerializerMixin):
    __tablename__ = 'transactions'

    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Integer, nullable=False)
    transaction_type = db.Column(db.String, nullable=False)
    transaction_date = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))  # ✅ use timezone-aware
    account_id = db.Column(db.Integer, db.ForeignKey('accounts.id'), nullable=False)

    account = db.relationship('Account', back_populates='transactions')

    serialize_rules = ('-account.transactions',)


class Loan(db.Model, SerializerMixin):
    __tablename__ = 'loans'

    id = db.Column(db.Integer, primary_key=True)
    loan_type = db.Column(db.String, nullable=False)
    loan_amount = db.Column(db.Integer, nullable=False)
    start_date = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))  # ✅ timezone-aware
    end_date = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))    # ✅ timezone-aware
    status = db.Column(db.String, default='pending')
    branch_id = db.Column(db.Integer, db.ForeignKey('branches.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    branch = db.relationship('Branch', back_populates='loans')
    user = db.relationship('User', back_populates='loans')

    serialize_rules = ('-branch.loans', '-user.loans')
