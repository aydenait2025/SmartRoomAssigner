#!/usr/bin/env python3
"""Check user tables status"""

import sys
import os

# Add backend directory to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app.config import config
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text

def main():
    # Initialize Flask app
    app = Flask(__name__)
    app.config.from_object(config['development'])
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db = SQLAlchemy(app)

    with app.app_context():
        try:
            # Check user tables
            tables = ['user', 'users']

            for table in tables:
                try:
                    # Check if exists
                    exists_result = db.session.execute(text(f"""
                        SELECT EXISTS (
                            SELECT 1 FROM information_schema.tables
                            WHERE table_schema = 'public' AND table_name = '{table}'
                        )
                    """))
                    exists = exists_result.fetchone()[0]

                    if exists:
                        # Get column count
                        col_result = db.session.execute(text(f"""
                            SELECT COUNT(*)
                            FROM information_schema.columns
                            WHERE table_schema = 'public' AND table_name = '{table}'
                        """))
                        cols = col_result.fetchone()[0]

                        # Get record count
                        count_result = db.session.execute(text(f"SELECT COUNT(*) FROM {table}"))
                        records = count_result.fetchone()[0]

                        print(f"{table}: EXISTS ({cols} columns, {records} records)")
                    else:
                        print(f"{table}: REMOVED")

                except Exception as e:
                    print(f"{table}: ERROR - {e}")

        except Exception as e:
            print(f"Error: {e}")
            return 1

    return 0

if __name__ == '__main__':
    sys.exit(main())
