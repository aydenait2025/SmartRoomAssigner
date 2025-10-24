#!/usr/bin/env python3
"""Add basic roles to the roles table before user migration"""

import sys
import os

# Add backend directory to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app.config import config
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text

def main():
    """Add basic roles to enterprise roles table"""

    # Initialize Flask app
    app = Flask(__name__)
    app.config.from_object(config['development'])
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db = SQLAlchemy(app)

    with app.app_context():
        try:
            print("👥 Adding Basic Roles to Enterprise Roles Table")
            print("=" * 50)

            # Insert basic roles that match legacy user data - using integers for hierarchy_level
            # and simpler permissions (JSON array format)
            roles_to_add = [
                (1, "Administrator", "Full system access and management", '[]', 100, True),
                (2, "Student", "Student access to exam scheduling and booking", '[]', 10, False)
            ]

            print("Inserting roles:")
            for role_id, name, desc, permissions, hierarchy, is_system in roles_to_add:
                # Check if role already exists
                existing = db.session.execute(text("SELECT COUNT(*) FROM roles WHERE id = :id"), {"id": role_id}).fetchone()[0]

                if existing > 0:
                    print(f"  - Role {role_id} ({name}) already exists")
                else:
                    # Insert role with basic required fields only
                    insert_sql = """
                    INSERT INTO roles (id, name, description, permissions, hierarchy_level, is_system_role, created_at)
                    VALUES (:id, :name, :desc, :permissions, :hierarchy, :is_system, CURRENT_TIMESTAMP)
                    """
                    db.session.execute(text(insert_sql), {
                        "id": role_id,
                        "name": name,
                        "desc": desc,
                        "permissions": permissions,  # Empty JSON array for now
                        "hierarchy": hierarchy,  # Integer: 100 for admin, 10 for student
                        "is_system": is_system
                    })
                    print(f"  ✅ Added role {role_id}: {name}")

            db.session.commit()

            # Verify roles were added
            count_result = db.session.execute(text("SELECT COUNT(*) FROM roles")).fetchone()[0]
            print(f"\n✅ Roles table now has {count_result} records")

            # Show the roles
            roles_result = db.session.execute(text("SELECT id, name, hierarchy_level FROM roles"))
            roles = roles_result.fetchall()

            print("\n📋 Current Roles:")
            for role in roles:
                print(f"  - ID {role[0]}: {role[1]} ({role[2]} level)")

            return 0

        except Exception as e:
            db.session.rollback()
            print(f"❌ Error adding roles: {e}")
            import traceback
            traceback.print_exc()
            return 1

if __name__ == '__main__':
    sys.exit(main())
