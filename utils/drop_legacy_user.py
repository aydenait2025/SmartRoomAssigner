#!/usr/bin/env python3
"""Drop the legacy user table after migration"""

import sys
import os

# Add backend directory to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app.config import config
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text

def main():
    """Drop legacy user table"""

    # Initialize Flask app
    app = Flask(__name__)
    app.config.from_object(config['development'])
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db = SQLAlchemy(app)

    with app.app_context():
        try:
            print("🗑️ Dropping Legacy User Table...")
            # Use double quotes to escape the reserved word
            db.session.execute(text('DROP TABLE IF EXISTS "user" CASCADE'))
            db.session.commit()
            print("✅ Legacy user table dropped successfully")
            return 0

        except Exception as e:
            db.session.rollback()
            print(f"❌ Failed to drop legacy user table: {e}")
            return 1

if __name__ == '__main__':
    sys.exit(main())
