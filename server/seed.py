from datetime import datetime

from server.config import app, db
from server.models import Branch, User, Account, UserAccount, Transaction, Loan


def seed_data():
    with app.app_context():
        # ---------------------------
        # CREATE TABLES
        # ---------------------------
        db.create_all()
        print("Tables ensured")

        # ---------------------------
        # BRANCHES
        # ---------------------------
        if Branch.query.count() == 0:
            branch1 = Branch(
                branch_name="Central Branch",
                branch_code="BR001",
                address="123 Main St",
                phone_number=1234567890,
            )
            branch2 = Branch(
                branch_name="North Branch",
                branch_code="BR002",
                address="456 North St",
                phone_number=1234567891,
            )
            db.session.add_all([branch1, branch2])
            db.session.commit()
            print("Added branches")

        # ---------------------------
        # ADMIN USER
        # ---------------------------
        if User.query.filter_by(is_admin=True).count() == 0:
            admin = User(
                username="admin",
                email="admin@example.com",
                first_name="Admin",
                last_name="User",
                is_admin=True,
            )
            admin.password_hash = "admin123"
            db.session.add(admin)
            db.session.commit()
            print(" Added admin user")

        # ---------------------------
        # NORMAL USERS
        # ---------------------------
        if User.query.filter_by(is_admin=False).count() == 0:
            user1 = User(
                username="john_doe",
                email="john@example.com",
                first_name="John",
                last_name="Doe",
            )
            user1.password_hash = "password1"

            user2 = User(
                username="jane_smith",
                email="jane@example.com",
                first_name="Jane",
                last_name="Smith",
            )
            user2.password_hash = "password2"

            db.session.add_all([user1, user2])
            db.session.commit()
            print("Added normal users")

        # ---------------------------
        # ACCOUNTS & USER ACCOUNTS
        # ---------------------------
        if Account.query.count() == 0:
            central_branch = Branch.query.filter_by(branch_code="BR001").first()
            north_branch = Branch.query.filter_by(branch_code="BR002").first()

            john_acc = Account(
                account_number=1001,
                account_type="savings",
                current_balance=5000,
                branch_id=central_branch.id,
            )

            jane_acc = Account(
                account_number=1002,
                account_type="checking",
                current_balance=3000,
                branch_id=north_branch.id,
            )

            db.session.add_all([john_acc, jane_acc])
            db.session.commit()

            ua1 = UserAccount(
                user_id=User.query.filter_by(username="john_doe").first().id,
                account_id=john_acc.id,
                role="owner",
            )
            ua2 = UserAccount(
                user_id=User.query.filter_by(username="jane_smith").first().id,
                account_id=jane_acc.id,
                role="owner",
            )

            db.session.add_all([ua1, ua2])
            db.session.commit()
            print("Added accounts and linked users")

        # ---------------------------
        # TRANSACTIONS
        # ---------------------------
        if Transaction.query.count() == 0:
            tx1 = Transaction(
                amount=1000,
                transaction_type="deposit",
                transaction_date=datetime.utcnow(),
                account_id=Account.query.filter_by(account_number=1001).first().id,
            )

            tx2 = Transaction(
                amount=500,
                transaction_type="withdrawal",
                transaction_date=datetime.utcnow(),
                account_id=Account.query.filter_by(account_number=1002).first().id,
            )

            db.session.add_all([tx1, tx2])
            db.session.commit()
            print("Added transactions")

        # ---------------------------
        # LOANS
        # ---------------------------
        if Loan.query.count() == 0:
            loan1 = Loan(
                loan_type="personal",
                loan_amount=2000,
                start_date=datetime.utcnow(),
                end_date=datetime.utcnow(),
                status="pending",
                branch_id=Branch.query.first().id,
                user_id=User.query.filter_by(username="john_doe").first().id,
            )

            db.session.add(loan1)
            db.session.commit()
            print("Added loans")

        print("Database seeding complete!")


if __name__ == "__main__":
    seed_data()
