#!/usr/bin/env python3
"""Script to remove useless duplicate tables in SmartRoomAssigner database"""

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
            # Drop tables that are safe to remove
            drop_queries = [
                "DROP TABLE IF EXISTS exam CASCADE",
                "DROP TABLE IF EXISTS role CASCADE",
                "DROP TABLE IF EXISTS room_assignment CASCADE",
                "DROP TABLE IF EXISTS student CASCADE",
                "DROP TABLE IF EXISTS user CASCADE"
            ]

            print("Dropping useless duplicate tables...")

            for query in drop_queries:
                try:
                    db.session.execute(text(query))
                    db.session.commit()
                    table_name = query.split()[4]  # Extract table name
                    print(f"Successfully dropped: {table_name}")

                except Exception as e:
                    print(f"Error dropping table: {e}")
                    db.session.rollback()

            # Check final status
            check_query = """
            SELECT tablename, (SELECT COUNT(*) FROM information_schema.columns c WHERE c.table_name = t.tablename) as columns
            FROM pg_tables t
            WHERE schemaname='public' AND tablename IN ('exam', 'role', 'room_assignment', 'student', 'user', 'building', 'room', 'buildings', 'rooms')
            ORDER BY tablename
            """

            print("\nFinal table status:")
            result = db.session.execute(text(check_query))
            for row in result.fetchall():
                print(f"  {row[0]}: {row[1]} columns")

            print("\nCleanup complete!")

        except Exception as e:
            print(f"Error: {e}")
            import traceback
            traceback.print_exc()
            return 1

    return 0

if __name__ == '__main__':
    sys.exit(main())
