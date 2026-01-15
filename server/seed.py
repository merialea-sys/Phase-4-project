from config import app, db
from models import Branch

with app.app_context():
    if Branch.query.count() == 0:
        branch1 = Branch(branch_name="Central Branch", branch_code="BR001", address="123 Main St", phone_number=1234567890)
        branch2 = Branch(branch_name="North Branch", branch_code="BR002", address="456 North St", phone_number=1234567891)
        db.session.add_all([branch1, branch2])
        db.session.commit()
        print("✅ Added branches")
