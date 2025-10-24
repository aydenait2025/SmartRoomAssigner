#!/usr/bin/env python3
"""Script to cleanup duplicate tables in SmartRoomAssigner database"""

import sys
import os

# Add backend directory to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app.config import config
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text

def main():
    """Clean up duplicate tables, keeping plural versions"""

    # Initialize Flask app
    app = Flask(__name__)
    app.config.from_object(config['development'])
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db = SQLAlchemy(app)

    with app.app_context():
        try:
            # Get current table counts
            tables_to_check = [
                ('building', 'buildings'),
                ('exam', 'exams'),
                ('role', 'roles'),
                ('room', 'rooms'),
                ('room_assignment', 'room_assignments'),
                ('student', 'students'),
                ('user', 'users')
            ]

            print("🧹 SmartRoomAssigner Database Cleanup")
            print("=" * 60)

            # Process each duplicate pair
            for singular, plural in tables_to_check:
                try:
                    # Check record counts
                    singular_result = db.session.execute(text(f"SELECT COUNT(*) FROM {singular}"))
                    singular_count = singular_result.fetchone()[0]

                    plural_result = db.session.execute(text(f"SELECT COUNT(*) FROM {plural}"))
                    plural_count = plural_result.fetchone()[0]

                    print(f"\n📋 {singular} ({singular_count} records) ↔ {plural} ({plural_count} records)")

                    if singular_count > 0 and plural_count == 0:
                        print(f"  ✅ Moving {singular_count} records from {singular} to {plural}")

                        # Check table structure - get column names
                        columns_result = db.session.execute(text(f"""
                            SELECT column_name
                            FROM information_schema.columns
                            WHERE table_name = '{singular}'
                            AND table_schema = 'public'
                            ORDER BY ordinal_position
                        """))
                        singular_columns = [row[0] for row in columns_result.fetchall()]

                        columns_result = db.session.execute(text(f"""
                            SELECT column_name
                            FROM information_schema.columns
                            WHERE table_name = '{plural}'
                            AND table_schema = 'public'
                            ORDER BY ordinal_position
                        """))
                        plural_columns = [row[0] for row in columns_result.fetchall()]

                        print(f"  📋 {singular} columns: {singular_columns}")
                        print(f"  📋 {plural} columns: {plural_columns}")

                        # If columns match, we can migrate data
                        if singular_columns == plural_columns:
                            # Copy data from singular to plural
                            columns_str = ', '.join(singular_columns)
                            db.session.execute(text(f"INSERT INTO {plural} ({columns_str}) SELECT {columns_str} FROM {singular}"))
                            db.session.commit()
                            print(f"  ✅ Successfully migrated {singular_count} records")

                            # Verify migration
                            new_plural_result = db.session.execute(text(f"SELECT COUNT(*) FROM {plural}"))
                            new_plural_count = new_plural_result.fetchone()[0]
                            if new_plural_count == singular_count:
                                print(f"  ✅ Migration verified: {plural} now has {new_plural_count} records")
                            else:
                                print(f"  ⚠️  Migration verification failed. Expected {singular_count}, got {new_plural_count}")
                        else:
                            print(f"  ❌ Column mismatch between {singular} and {plural}")
                            print("  ⚠️  Cannot safely migrate data - skipping")
                            continue

                    # Drop the singular table (use CASCADE for dependencies)
                    print(f"  🗑️  Dropping table: {singular}")
                    try:
                        db.session.execute(text(f"DROP TABLE IF EXISTS {singular}"))
                        db.session.commit()
                        print(f"  ✅ {singular} table dropped successfully")
                    except Exception as drop_error:
                        # Try with CASCADE to drop dependent constraints
                        print(f"  ↻ Retrying with CASCADE...")
                        try:
                            db.session.execute(text(f"DROP TABLE IF EXISTS {singular} CASCADE"))
                            db.session.commit()
                            print(f"  ✅ {singular} table dropped successfully with CASCADE")
                        except Exception as cascade_error:
                            print(f"  ❌ Failed to drop {singular} even with CASCADE: {cascade_error}")
                            db.session.rollback()

                except Exception as e:
                    print(f"  ❌ Error processing {singular} ↔ {plural}: {e}")
                    db.session.rollback()

            print("\n" + "=" * 60)
            print("🧹 Database cleanup completed!")

            # Final verification
            print("\n📊 Final Table Status:")
            final_result = db.session.execute(text("SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename IN ('buildings', 'exams', 'roles', 'rooms', 'room_assignments', 'students', 'users') ORDER BY tablename"))
            final_tables = final_result.fetchall()

            for table_row in final_tables:
                table_name = table_row[0]
                count_result = db.session.execute(text(f"SELECT COUNT(*) FROM {table_name}"))
                count = count_result.fetchone()[0]
                print(f"  ✅ {table_name:20} {count:8} records")

            print("\n🎉 All duplicate tables cleaned up! Database now has consistent plural table naming.")

        except Exception as e:
            print(f"❌ Error during cleanup: {e}")
            import traceback
            traceback.print_exc()
            return 1

    return 0

if __name__ == '__main__':
    sys.exit(main())
