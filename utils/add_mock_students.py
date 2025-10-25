#!/usr/bin/env python3
"""
Add 100 mock students to the users table for testing
"""

import os
import sys
import json
import random
import string
from datetime import datetime

# Add the backend to the path so we can import models
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

# Import database and models
from app.extensions import db
from app.models.user import User
from app import create_app

# Mock student data with international names
MOCK_STUDENTS_DATA = [
    ("James", "Smith", "james.smith@university.edu"),
    ("Michael", "Johnson", "michael.johnson@university.edu"),
    ("Emma", "Davis", "emma.davis@university.edu"),
    ("Olivia", "Wilson", "olivia.wilson@university.edu"),
    ("Sophia", "Brown", "sophia.brown@university.edu"),
    ("Mason", "Jones", "mason.jones@university.edu"),
    ("Ava", "Garcia", "ava.garcia@university.edu"),
    ("William", "Miller", "william.miller@university.edu"),
    ("Isabella", "Martinez", "isabella.martinez@university.edu"),
    ("Ethan", "Anderson", "ethan.anderson@university.edu"),
    ("Charlotte", "Taylor", "charlotte.taylor@university.edu"),
    ("Alexander", "Thomas", "alexander.thomas@university.edu"),
    ("Amelia", "Jackson", "amelia.jackson@university.edu"),
    ("Benjamin", "White", "benjamin.white@university.edu"),
    ("Mia", "Harris", "mia.harris@university.edu"),
    ("Daniel", "Clark", "daniel.clark@university.edu"),
    ("Harper", "Rodriguez", "harper.rodriguez@university.edu"),
    ("Matthew", "Lewis", "matthew.lewis@university.edu"),
    ("Evelyn", "Robinson", "evelyn.robinson@university.edu"),
    ("Jack", "Walker", "jack.walker@university.edu"),
    ("Liam", "MacDonald", "liam.macdonald@university.edu"),
    ("Oliver", "Thompson", "oliver.thompson@university.edu"),
    ("Aiden", "MacKenzie", "aiden.mackenzie@university.edu"),
    ("Lucas", "Campbell", "lucas.campbell@university.edu"),
    ("Logan", "Stewart", "logan.stewart@university.edu"),
    ("Jacob", "Ross", "jacob.ross@university.edu"),
    ("William", "Graham", "william.graham@university.edu"),
    ("Noah", "MacGregor", "noah.macgregor@university.edu"),
    ("Mason", "Murray", "mason.murray@university.edu"),
    ("Jack", "Cameron", "jack.cameron@university.edu"),
    ("Wei", "Wang", "wei.wang@university.edu"),
    ("Li", "Zhang", "li.zhang@university.edu"),
    ("Ming", "Liu", "ming.liu@university.edu"),
    ("Tao", "Chen", "tao.chen@university.edu"),
    ("Fang", "Yang", "fang.yang@university.edu"),
    ("Hong", "Zhao", "hong.zhao@university.edu"),
    ("Xia", "Wu", "xia.wu@university.edu"),
    ("Gang", "Xu", "gang.xu@university.edu"),
    ("Haruto", "Sato", "haruto.sato@university.edu"),
    ("Sakura", "Tanaka", "sakura.tanaka@university.edu"),
    ("Yuki", "Suzuki", "yuki.suzuki@university.edu"),
    ("Ryoto", "Takahashi", "ryoto.takahashi@university.edu"),
    ("Ravi", "Patel", "ravi.patel@university.edu"),
    ("Priya", "Singh", "priya.singh@university.edu"),
    ("Arjun", "Sharma", "arjun.sharma@university.edu"),
    ("Aisha", "Kumar", "aisha.kumar@university.edu"),
    ("Rahul", "Verma", "rahul.verma@university.edu"),
    ("Carlos", "Silva", "carlos.silva@university.edu"),
    ("Maria", "Santos", "maria.santos@university.edu"),
    ("João", "Oliveira", "joao.oliveira@university.edu"),
    ("Ana", "Souza", "ana.souza@university.edu"),
    ("Hans", "Schneider", "hans.schneider@university.edu"),
    ("Anna", "Mueller", "anna.mueller@university.edu"),
    ("Thomas", "Fischer", "thomas.fischer@university.edu"),
    ("Sabine", "Weber", "sabine.weber@university.edu"),
    ("Pierre", "Dubois", "pierre.dubois@university.edu"),
    ("Marie", "Martin", "marie.martin@university.edu"),
    ("Jean", "Bernard", "jean.bernard@university.edu"),
    ("Sophie", "Durand", "sophie.durand@university.edu"),
    ("Carlos", "Garcia", "carlos.garcia@university.edu"),
    ("Maria", "Rodriguez", "maria.rodriguez@university.edu"),
    ("José", "Gonzalez", "jose.gonzalez@university.edu"),
    ("Ana", "Lopez", "ana.lopez@university.edu"),
    ("Liam", "Smith", "liam.smith@university.edu"),
    ("Oliver", "Brown", "oliver.brown@university.edu"),
    ("William", "Wilson", "william.wilson@university.edu"),
    ("Benjamin", "Taylor", "benjamin.taylor@university.edu"),
    ("Amelia", "Jones", "amelia.jones@university.edu"),
    ("Charlotte", "Williams", "charlotte.williams@university.edu"),
    ("Olivia", "Davis", "olivia.davis@university.edu"),
    ("Sophia", "Miller", "sophia.miller@university.edu"),
    ("Ethan", "Anderson", "ethan.anderson@university.edu"),
    ("Harry", "Wilson", "harry.wilson@university.edu"),
    ("Oliver", "Thompson", "oliver.thompson@university.edu"),
    ("Jack", "Brown", "jack.brown@university.edu"),
    ("George", "Jones", "george.jones@university.edu"),
    ("Amelia", "Taylor", "amelia.taylor@university.edu"),
    ("Isabella", "Williams", "isabella.williams@university.edu"),
    ("Poppy", "Davies", "poppy.davies@university.edu"),
    ("Freya", "Evans", "freya.evans@university.edu"),
    ("Florence", "Thomas", "florence.thomas@university.edu"),
    ("Daisy", "Roberts", "daisy.roberts@university.edu"),
    ("Charlotte", "Lewis", "charlotte.lewis@university.edu"),
    ("Lilly", "Evans", "lilly.evans@university.edu"),
    ("Michael", "Meyer", "michael.meyer@university.edu"),
    ("Julia", "Wagner", "julia.wagner@university.edu"),
    ("Peter", "Schulz", "peter.schulz@university.edu"),
    ("Maria", "Becker", "maria.becker@university.edu"),
    ("Michel", "Dubois", "michel.dubois@university.edu"),
    ("Anne", "Laurent", "anne.laurent@university.edu"),
    ("Pierre", "Michel", "pierre.michel@university.edu"),
    ("Marie", "Lefebvre", "marie.lefebvre@university.edu"),
    ("Henri", "Bertrand", "henri.bertrand@university.edu"),
    ("Catherine", "Rousseau", "catherine.rousseau@university.edu"),
    ("Aiko", "Sato", "aiko.sato@university.edu"),
]

def generate_password(length=12):
    """Generate a random password"""
    characters = string.ascii_letters + string.digits + "!@#$%^&*"
    password = ''.join(random.choice(characters) for i in range(length))
    return password

def add_mock_students():
    """Add 100 mock students to the users table"""

    # Create Flask app context
    app = create_app()

    with app.app_context():
        print("Adding 100 mock students to users table...")

        added_count = 0
        # Get next available ID to avoid sequence issues
        max_id = db.session.query(db.func.max(User.id)).scalar() or 0
        next_id = max_id + 1

        for first_name, last_name, email in MOCK_STUDENTS_DATA:
            try:
                # Check if user already exists
                existing_user = db.session.query(User).filter_by(email=email).first()
                if existing_user:
                    print(f"✓ User {email} already exists, skipping...")
                    continue

                # Create new user
                name = f"{first_name} {last_name}"
                password_plain = "TempPassword123!"  # Use same temp password for all

                # Hash the password using werkzeug
                from werkzeug.security import generate_password_hash
                password_hash = generate_password_hash(password_plain)

                # Use raw SQL to insert with explicit ID to avoid sequence issues
                db.session.execute(
                    db.text("""
                        INSERT INTO users (id, name, email, password_hash, role_id, is_active, email_verified, created_at, updated_at)
                        VALUES (:id, :name, :email, :password_hash, :role_id, :is_active, :email_verified, :created_at, :updated_at)
                    """),
                    {
                        'id': next_id,
                        'name': name,
                        'email': email,
                        'password_hash': password_hash,
                        'role_id': 2,  # Student role
                        'is_active': True,
                        'email_verified': True,
                        'created_at': datetime.utcnow(),
                        'updated_at': datetime.utcnow()
                    }
                )

                next_id += 1
                added_count += 1

                if added_count % 10 == 0:
                    print(f"Added {added_count} users...")

            except Exception as e:
                print(f"Error adding user {email}: {e}")
                continue

        try:
            db.session.commit()
            print(f"✅ Successfully added {added_count} mock students!")
            print("Each student has login credentials:")
            print("- Password: TempPassword123!")
            print("- Role: Student (role_id=2)")
            print("- Account: Active with verified email")
        except Exception as e:
            print(f"❌ Error committing changes: {e}")
            db.session.rollback()

if __name__ == "__main__":
    add_mock_students()
