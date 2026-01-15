from config import app, db
from models import Branch , User

with app.app_context():
    if Branch.query.count() == 0:
        branch1 = Branch(branch_name="Central Branch", branch_code="BR001", address="123 Main St", phone_number=1234567890)
        branch2 = Branch(branch_name="North Branch", branch_code="BR002", address="456 North St", phone_number=1234567891)
        db.session.add_all([branch1, branch2])
        db.session.commit()
        print("✅ Added branches")


with app.app_context():
    if User.query.filter_by(is_admin=True).count() == 0:
        admin = User(username="admin", email="admin@example.com", first_name="Admin", last_name="User", is_admin=True)
        admin.password_hash = "admin123"
        db.session.add(admin)
        db.session.commit()
        print("✅ Added admin user")
