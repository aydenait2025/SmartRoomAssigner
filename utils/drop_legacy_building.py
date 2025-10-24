#!/usr/bin/env python3
"""Drop the legacy building table after migration"""

import sys
import os

# Add backend directory to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app.config import config
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text

def main():
    """Drop legacy building table"""

    # Initialize Flask app
    app = Flask(__name__)
    app.config.from_object(config['development'])
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db = SQLAlchemy(app)

    with app.app_context():
        try:
            print("🗑️ Dropping Legacy Building Table...")
            print("⚠️  Warning: This will use CASCADE and drop dependent objects!")

            # Use CASCADE because there are dependencies we need to remove
            # from room table foreign keys referencing building
            db.session.execute(text('DROP TABLE IF EXISTS building CASCADE'))
            db.session.commit()
            print("✅ Legacy building table dropped successfully")
            return 0

        except Exception as e:
            db.session.rollback()
            print(f"❌ Failed to drop legacy building table: {e}")
            return 1

if __name__ == '__main__':
    sys.exit(main())
