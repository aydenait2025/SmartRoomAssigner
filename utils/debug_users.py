#!/usr/bin/env python3
"""
Debug script to check users and their roles
"""

import os
import sys
from datetime import datetime

# Add the backend to the path so we can import models
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

# Import database and models
from app.extensions import db
from app.models.user import User, Role
from app import create_app

def debug_users():
    """Check users and their roles"""

    # Create Flask app context
    app = create_app()

    with app.app_context():
        print("🔍 Checking Users and Roles...")

        # Check roles
        roles = Role.query.all()
        print(f"\n📋 Roles in database: {len(roles)}")
        for role in roles:
            print(f"  ID {role.id}: {role.name}")

        # Check users with different role_ids
        print("
👤 Users by role:"        for role_id in [1, 2, 3]:
            users = User.query.filter_by(role_id=role_id).all()
            print(f"  Role {role_id}: {len(users)} users")

        # Check last 10 users
        print("
🔚 Last 10 users:"        recent_users = User.query.order_by(User.id.desc()).limit(10).all()
        for user in recent_users:
            role_name = "Unknown"
            if user.role:
                role_name = user.role.name
            print(f"  ID {user.id}: {user.name} ({user.email}) - Role: {role_name} ({user.role_id})")

        # Check how many have role_id=2
        students = User.query.filter_by(role_id=2).join(User.role).all()
        print(f"\n🎓 Total students (role_id=2 with joined roles): {len(students)}")
        if students:
            print("Sample students:")
            for student in students[:3]:  # Show first 3
                print(f"  {student.name} ({student.email}) - Role: {student.role.name if student.role else 'None'}")

if __name__ == "__main__":
    debug_users()
