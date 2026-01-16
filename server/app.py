# server/app.py


from auth import login_required, admin_required, owner_required
from flask import request, session

from flask_restful import Resource

from config import app, db, api
from models import User, Account, Transaction, Branch, Loan, UserAccount


# OPTIONAL
app.secret_key = "change-me-in-production"

def require_role(user_id, account_id, allowed_roles):
    link = UserAccount.query.filter_by(
        user_id=user_id,
        account_id=account_id
    ).first()

    if not link or link.role not in allowed_roles:
        return False
    return True



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
    
class CheckSession(Resource):
    def get(self):
        user_id = session.get('user_id')
        if not user_id:
            return {"error": "Not logged in"}, 401

        user = db.session.get(User, user_id)
        if not user:
            return {"error": "User not found"}, 404

        return user.to_dict(), 200


class Logout(Resource):
    def delete(self):
        session['user_id'] = None
        return {}, 204

# -------------------------
# User resources
# -------------------------

class Users(Resource):
    def get(self):
        users = db.session.get(User, id)
        return [u.to_dict() for u in users], 200

    def post(self):
        data = request.get_json() or {}
        try:
            user = User(
                username=data['username'],
                email=data['email'],
                first_name=data.get('first_name'),
                last_name=data.get('last_name'),
            )
            user.password_hash = data['password']
            db.session.add(user)
            db.session.commit()
            return user.to_dict(), 201
        except Exception as e:
            db.session.rollback()
            return {"error": str(e)}, 400


class UserById(Resource):
    def get(self, id):
        if not session.get("user_id"):
            return {"error": "Unauthorized"}, 401

        user = db.session.get(User, id)
        if not user:
            return {"error": "User not found"}, 404
        return user.to_dict(max_depth=2), 200


    def patch(self, id):
        user = db.session.get(User, id)
        if not user:
            return {"error": "User not found"}, 404

        data = request.get_json() or {}
        try:
            for attr in ['username', 'email', 'first_name', 'last_name']:
                if attr in data:
                    setattr(user, attr, data[attr])

            if 'password' in data:
                user.password_hash = data['password']

            db.session.commit()
            return user.to_dict(), 200
        except Exception as e:
            db.session.rollback()
            return {"error": str(e)}, 400

    def delete(self, id):
        user = db.session.get(User, id)
        if not user:
            return {"error": "User not found"}, 404

        db.session.delete(user)
        db.session.commit()
        return {}, 204

# -------------------------
# Account resources
# -------------------------

class Accounts(Resource):
    @login_required
    def get(self):
        if not session.get("user_id"):
            return {"error": "Unauthorized"}, 401

        accounts = Account.query.all()
        return [a.to_dict(rules=('-user_accounts.user.user_accounts', '-user_accounts.account')) for a in accounts], 200

    @admin_required
    def post(self):
        data = request.get_json() or {}
        try:
            account = Account(
                account_number=data['account_number'],
                account_type=data['account_type'],
                current_balance=data.get('current_balance', 0),
                status=data.get('status', 'active'),
                user_id=data.get('user_id'),
                branch_id=data['branch_id'],
            )
            db.session.add(account)
            db.session.commit()
            return account.to_dict(), 201
        except Exception as e:
            db.session.rollback()
            return {"error": str(e)}, 400


class AccountById(Resource):
    
    @login_required
    def get(self, id):
        user_id = db.session.get("user_id")
        if not user_id:
            return {"error": "Unauthorized"}, 401

        account = db.session.get(Account, id)
        if not account:
            return {"error": "Account not found"}, 404

        # Role-based access
        if not require_role(user_id, id, ["owner", "admin"]):
            return {"error": "Forbidden"}, 403

        return account.to_dict(max_depth=2), 200


    @owner_required
    def patch(self, id):
        account = db.session.get(Account, id)
        if not account:
            return {"error": "Account not found"}, 404

        data = request.get_json() or {}
        try:
            for attr in [
                'account_number', 'account_type',
                'current_balance', 'status'
            ]:
                if attr in data:
                    setattr(account, attr, data[attr])

            db.session.commit()
            return account.to_dict(), 200
        except Exception as e:
            db.session.rollback()
            return {"error": str(e)}, 400
    @admin_required
    def delete(self, id):
        user_id = db.session.get("user_id")
        if not user_id:
            return {"error": "Unauthorized"}, 401

        if not require_role(user_id, id, ["admin"]):
            return {"error": "Forbidden"}, 403

        account = db.session.get(Account, id)
        if not account:
            return {"error": "Account not found"}, 404

        db.session.delete(account)
        db.session.commit()
        return {}, 204


# -------------------------
# Transaction resources
# -------------------------

class Transactions(Resource):
    @login_required
    def get(self):
        user_id = session.get("user_id")

        # Get all accounts owned by this user
        owned_accounts = [
            link.account_id
            for link in UserAccount.query.filter_by(user_id=user_id).all()
        ]

        # Filter transactions by owned accounts
        txs = Transaction.query.filter(
            Transaction.account_id.in_(owned_accounts)
        ).all()

        return [t.to_dict() for t in txs], 200


    @owner_required
    def post(self):
        data = request.get_json() or {}

        tx = Transaction(
            amount=data['amount'],
            transaction_type=data['transaction_type'],
            transaction_date=data.get('transaction_date'),
            account_id=data['account_id'],
        )
        db.session.add(tx)
        db.session.commit()
        return tx.to_dict(), 201



class TransactionById(Resource):
    @login_required
    def get(self, id):
        tx = Transaction.query.get(id)
        if not tx:
            return {"error": "Transaction not found"}, 404

        user_id = session.get("user_id")

        # Admins can view all
        user = db.session.get(User, id)
        if user.is_admin:
            return tx.to_dict(), 200

        # Owners only
        link = UserAccount.query.filter_by(
            user_id=user_id,
            account_id=tx.account_id
        ).first()

        if not link:
            return {"error": "Forbidden"}, 403

        return tx.to_dict(), 200
    @owner_required
    def delete(self, id):
        tx = db.session.get(Transaction, id)
        if not tx:
            return {"error": "Transaction not found"}, 404

        db.session.delete(tx)
        db.session.commit()
        return {}, 204
    
# -------------------------
# Branch resources
# -------------------------

class Branches(Resource):
    def get(self):
        branches = Branch.query.all()
        return [b.to_dict() for b in branches], 200

    def post(self):
        data = request.get_json() or {}
        try:
            branch = Branch(
                branch_name=data['branch_name'],
                branch_code=data['branch_code'],
                address=data.get('address'),
                phone_number=data.get('phone_number'),
            )
            db.session.add(branch)
            db.session.commit()
            return branch.to_dict(), 201
        except Exception as e:
            db.session.rollback()
            return {"error": str(e)}, 400


class BranchById(Resource):
    def get(self, id):
        branch = db.session.get(Branch, id)
        if not branch:
            return {"error": "Branch not found"}, 404
        return branch.to_dict(), 200

    def patch(self, id):
        branch = db.session.get(Branch, id)
        if not branch:
            return {"error": "Branch not found"}, 404

        data = request.get_json() or {}
        try:
            for attr in ['branch_name', 'branch_code', 'address', 'phone_number']:
                if attr in data:
                    setattr(branch, attr, data[attr])

            db.session.commit()
            return branch.to_dict(), 200
        except Exception as e:
            db.session.rollback()
            return {"error": str(e)}, 400

    def delete(self, id):
        branch = db.session.get(Branch, id)
        if not branch:
            return {"error": "Branch not found"}, 404

        db.session.delete(branch)
        db.session.commit()
        return {}, 204
    
# -------------------------
# Loan resources
# -------------------------

class Loans(Resource):
    @login_required
    def get(self):
        user_id = session.get("user_id")
        if user_id:
            user = db.session.get(User, user_id)
        if user.is_admin:
            loans = Loan.query.all()
        else:
            loans = Loan.query.filter_by(user_id=user_id).all()

        return [l.to_dict() for l in loans], 200



    def post(self):
        data = request.get_json() or {}
        try:
            loan = Loan(
                loan_type=data['loan_type'],
                loan_amount=data['loan_amount'],
                start_date=data.get('start_date'),
                end_date=data.get('end_date'),
                status=data.get('status', 'pending'),
                branch_id=data['branch_id'],
                user_id=data['user_id'],
            )
            db.session.add(loan)
            db.session.commit()
            return loan.to_dict(), 201
        except Exception as e:
            db.session.rollback()
            return {"error": str(e)}, 400


class LoanById(Resource):
    @login_required
    def get(self, id):
        loan = db.session.get(Loan, id)
        if not loan:
            return {"error": "Loan not found"}, 404

        user_id = session.get("user_id")
        user = User.query.get(user_id)

        if user.is_admin or loan.user_id == user_id:
            return loan.to_dict(), 200

        return {"error": "Forbidden"}, 403
    @owner_required
    def patch(self, id):
        loan = db.session.get(Loan, id)
        if not loan:
            return {"error": "Loan not found"}, 404

        data = request.get_json() or {}
        try:
            for attr in [
                'loan_type', 'loan_amount',
                'start_date', 'end_date',
                'status', 'branch_id', 'user_id'
            ]:
                if attr in data:
                    setattr(loan, attr, data[attr])

            db.session.commit()
            return loan.to_dict(), 200
        except Exception as e:
            db.session.rollback()
            return {"error": str(e)}, 400
    
    @admin_required
    def delete(self, id):
        loan = db.session.get(Loan, id)
        if not loan:
            return {"error": "Loan not found"}, 404

        db.session.delete(loan)
        db.session.commit()
        return {}, 204
    
# -------------------------
# UserAccount (many-to-many link)
# -------------------------

class UserAccounts(Resource):
    def get(self):
        if not session.get("user_id"):
            return {"error": "Unauthorized"}, 401

        links = UserAccount.query.all()
        return [ua.to_dict() for ua in links], 200


    def post(self):
        data = request.get_json() or {}
        try:
            link = UserAccount(
                user_id=data['user_id'],
                account_id=data['account_id'],
                role=data['role'],
            )
            db.session.add(link)
            db.session.commit()
            return link.to_dict(), 201
        except Exception as e:
            db.session.rollback()
            return {"error": str(e)}, 400
        
class ApproveLoan(Resource):
    @admin_required
    def patch(self, id):
        loan = db.session.get(Loan, id)
        if not loan:
            return {"error": "Loan not found"}, 404

        data = request.get_json()
        new_status = data.get("status")

        if new_status not in ["approved", "rejected"]:
            return {"error": "Invalid status"}, 400

        loan.status = new_status
        db.session.commit()

        return loan.to_dict(), 200


# -------------------------
# Route registration
# -------------------------

api.add_resource(Signup, '/signup')
api.add_resource(Login, '/login')
api.add_resource(CheckSession, '/check_session')
api.add_resource(Logout, '/logout')

api.add_resource(Users, '/users')
api.add_resource(UserById, '/users/<int:id>')

api.add_resource(Accounts, '/accounts')
api.add_resource(AccountById, '/accounts/<int:id>')

api.add_resource(Transactions, '/transactions')
api.add_resource(TransactionById, '/transactions/<int:id>')

api.add_resource(Branches, '/branches')
api.add_resource(BranchById, '/branches/<int:id>')

api.add_resource(Loans, '/loans')
api.add_resource(LoanById, '/loans/<int:id>')

api.add_resource(UserAccounts, '/user_accounts')

api.add_resource(ApproveLoan, "/loans/<int:id>/approve")



# -------------------------
# Entry point
# -------------------------

if __name__ == '__main__':
    app.run(port=5555, debug=True)




