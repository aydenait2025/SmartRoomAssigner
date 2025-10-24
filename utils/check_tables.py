#!/usr/bin/env python3
"""Script to check what tables exist in the database"""

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
            # Get all table names
            result = db.session.execute(text("SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename"))
            tables = result.fetchall()

            print("📋 Tables in SmartRoomAssigner database:")
            print("=" * 50)

            for table in tables:
                table_name = table[0]

                # Get record count for each table
                try:
                    count_result = db.session.execute(text(f"SELECT COUNT(*) FROM {table_name}"))
                    count = count_result.fetchone()[0]
                    print(f"  - {table_name:25} {count:8} records")
                except Exception as e:
                    print(f"  - {table_name:25} (error counting)")

            print("=" * 50)
            print(f"Total tables found: {len(tables)}")

            # Identify duplicates
            print("\n🔍 Potential Duplicate Tables:")
            table_names = [t[0] for t in tables]
            seen = set()
            duplicates = []

            for table in table_names:
                # Check for duplicates (singular/plural, case variations)
                variations = [
                    table,
                    table.replace('_', ''),
                    table + 's' if not table.endswith('s') else table[:-1],
                    ''.join(c for c in table.title() if not c.isupper())
                ]

                for var in variations:
                    if var in table_names and var != table:
                        duplicates.append((table, var))

            if duplicates:
                for dup in duplicates:
                    print(f"  - {dup[0]} ↔ {dup[1]}")
            else:
                print("  No obvious duplicates found")

        except Exception as e:
            print(f"❌ Error checking tables: {e}")
            import traceback
            traceback.print_exc()
            return 1

    return 0

if __name__ == '__main__':
    sys.exit(main())
