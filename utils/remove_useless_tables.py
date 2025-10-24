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
    """Drop useless duplicate tables with no dependencies"""

    # Initialize Flask app
    app = Flask(__name__)
    app.config.from_object(config['development'])
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db = SQLAlchemy(app)

    with app.app_context():
        try:
            # Tables that are safe to drop (no foreign key dependencies)
            tables_to_drop = [
                'exam',      # 1 record, incompatible with exams
                'role',      # 2 records, incompatible with roles
                'room_assignment',  # 1 record, incompatible with room_assignments
                'student',   # 3 records, incompatible with students
                'user'       # 1 record, incompatible with users
            ]

            print("🗑️ SmartRoomAssigner - Removing Useless Duplicate Tables")
            print("=" * 70)

            # Show current status
            print("\n📋 Tables to be dropped:")
            for table in tables_to_drop:
                try:
                    count_result = db.session.execute(text(f"SELECT COUNT(*) FROM {table}"))
                    count = count_result.fetchone()[0]
                    print(f"  - {table}: {count} records")

                    # Check for dependencies
                    constraint_result = db.session.execute(text(f"""
                        SELECT tc.table_name, tc.constraint_name
                        FROM information_schema.table_constraints tc
                        WHERE tc.table_name = '{table}'
                        AND tc.constraint_type = 'FOREIGN KEY'
                    """))
                    dependencies = constraint_result.fetchall()

                    if dependencies:
                        print(f"    ⚠️  Has {len(dependencies)} foreign key constraints - may cause issues")
                except Exception as e:
                    print(f"  - {table}: error checking ({e})")

            print("\n🗑️  Starting table drops...")
            dropped_count = 0

            for table in tables_to_drop:
                try:
                    print(f"\n🗑️  Dropping table: {table}")

                    # Check current count
                    count_result = db.session.execute(text(f"SELECT COUNT(*) FROM {table}"))
                    count = count_result.fetchone()[0]
                    print(f"  📊 Contains {count} records")

                    # Drop the table
                    db.session.execute(text(f"DROP TABLE IF EXISTS {table} CASCADE"))
                    db.session.commit()

                    print(f"  ✅ Successfully dropped {table}")
                    dropped_count += 1

                except Exception as e:
                    print(f"  ❌ Failed to drop {table}: {e}")
                    db.session.rollback()

            print("\n" + "=" * 70)
            print("🗑️ Cleanup Summary:"            print(f"  ✅ Tables successfully dropped: {dropped_count}")
            print(f"  ❌ Failed drops: {len(tables_to_drop) - dropped_count}")

            # Final verification
            print("\n📊 Remaining Table Status:")
            remaining_tables = ['exam', 'role', 'room_assignment', 'student', 'user', 'building', 'room']

            for table in remaining_tables:
                try:
                    # Check if table still exists
                    exists_result = db.session.execute(text(f"""
                        SELECT EXISTS (
                            SELECT 1
                            FROM information_schema.tables
                            WHERE table_schema = 'public'
                            AND table_name = '{table}'
                        )
                    """))
                    exists = exists_result.fetchone()[0]

                    if exists:
                        count_result = db.session.execute(text(f"SELECT COUNT(*) FROM {table}"))
                        count = count_result.fetchone()[0]
                        print(f"  ✅ {table:15} EXISTS: {count:8} records")
                    else:
                        print(f"  ✅ {table:15} REMOVED: successfully deleted")
                except Exception as e:
                    print(f"  ❌ {table:15} ERROR: {e}")
            # Check that important tables still exist
            print("\n✅ Important tables still intact:")
            important_tables = ['buildings', 'rooms', 'users', 'students', 'roles', 'exams', 'room_assignments']

            for table in important_tables:
                try:
                    exists_result = db.session.execute(text(f"""
                        SELECT EXISTS (
                            SELECT 1
                            FROM information_schema.tables
                            WHERE table_schema = 'public'
                            AND table_name = '{table}'
                        )
                    """))
                    exists = exists_result.fetchone()[0]

                    if exists:
                        count_result = db.session.execute(text(f"SELECT COUNT(*) FROM {table}"))
                        count = count_result.fetchone()[0]
                        print(f"  ✅ {table:20} EXISTS: {count:8} records")
                    else:
                        print(f"  ❌ MISSING: {table}")
                except Exception as e:
                    print(f"  ❌ ERROR: {table} ({e})")

            print("
🎉 Database cleanup completed! Useless duplicate tables removed."            print("💡 Your SmartRoomAssigner database is now cleaner and more consistent.")

        except Exception as e:
            print(f"❌ Error during cleanup: {e}")
            import traceback
            traceback.print_exc()
            return 1

    return 0

if __name__ == '__main__'>
    sys.exit(main())
