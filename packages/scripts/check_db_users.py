#!/usr/bin/env python3
"""
Simple script to check users in the database
"""

import sys
import os

# Add backend directory to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from app.config import config
from flask import Flask
from flask_sqlalchemy import SQLAlchemy

# Initialize Flask app
app = Flask(__name__)
app.config.from_object(config['development'])
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

with app.app_context():
    try:
        # Check users table
        result = db.session.execute(db.text("SELECT id, name, email FROM users"))
        users = result.fetchall()  # Changed from result.fetchall()

        print("Users in database:")
        for user in users:
            print(f"  {user[0]}, {user[1]}, {user[2]}")

        if not users:
            print("No users found. Adding default user...")

            # Check if roles exist
            result = db.session.execute(db.text("SELECT id, name FROM roles"))
            roles = result.fetchall()

            if not roles:
                print("No roles found. Adding roles...")
                db.session.execute(db.text("INSERT INTO roles (name) VALUES ('admin'), ('student')"))
                db.session.commit()
                print("Roles added!")

            # Add default user
            from werkzeug.security import generate_password_hash
            db.session.execute(db.text("INSERT INTO users (name, email, password_hash, role_id) VALUES (%s, %s, %s, %s)"), ("Alice Admin", "alice@examspace.com", generate_password_hash("password"), 1))
            db.session.commit()
            print("Default user added: alice@examspace.com / password")

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
