#!/usr/bin/env python3
"""Migrate data from legacy user table to enterprise users table"""

import sys
import os

# Add backend directory to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app.config import config
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text

def main():
    """Migrate user data from legacy to enterprise table"""

    # Initialize Flask app
    app = Flask(__name__)
    app.config.from_object(config['development'])
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db = SQLAlchemy(app)

    with app.app_context():
        try:
            print("🔄 Migrating Legacy User Data to Enterprise Users Table")
            print("=" * 60)

            # Get column information for both tables
            print("\n📋 Table Schema Comparison:")

            # Legacy user table columns
            user_cols_result = db.session.execute(text("""
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = 'user'
                ORDER BY ordinal_position
            """))
            user_cols = user_cols_result.fetchall()
            print(f"Legacy 'user' table ({len(user_cols)} columns):")
            for col in user_cols:
                print(f"  - {col[0]}: {col[1]} {'NULL' if col[2] == 'YES' else 'NOT NULL'}")

            # Enterprise users table columns
            users_cols_result = db.session.execute(text("""
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = 'users'
                ORDER BY ordinal_position
            """))
            users_cols = users_cols_result.fetchall()
            print(f"\nEnterprise 'users' table ({len(users_cols)} columns):")
            for col in users_cols:
                print(f"  - {col[0]}: {col[1]} {'NULL' if col[2] == 'YES' else 'NOT NULL'}")

            # Check legacy data
            count_result = db.session.execute(text("SELECT COUNT(*) FROM \"user\""))
            user_count = count_result.fetchone()[0]
            print(f"\n📊 Records to migrate: {user_count}")

            if user_count == 0:
                print("⚠️  No data to migrate from legacy user table")
                return 0

            # Show sample data
            sample_result = db.session.execute(text("SELECT * FROM \"user\" LIMIT 5"))
            sample_data = sample_result.fetchall()
            print(f"\n🔍 Legacy user data sample:")
            for i, row in enumerate(sample_data):
                print(f"  Record {i+1}: {dict(zip([col[0] for col in user_cols], row))}")

            # Perform migration - map common fields
            print(f"\n📤 Starting migration...")
            # Find common columns for INSERT
            user_col_names = [col[0] for col in user_cols]
            users_col_names = [col[0] for col in users_cols]

            # Simple field mapping (assuming some names match or can be mapped)
            insert_cols = []
            select_cols = []

            for col in user_col_names:
                if col in users_col_names:
                    insert_cols.append(col)
                    select_cols.append(f'"{col}"')
                elif col == 'id':
                    insert_cols.append('id')
                    select_cols.append(f'"{col}"::bigint')
                elif col == 'name':
                    if 'name' in users_col_names:
                        insert_cols.append('name')
                        select_cols.append(f'"{col}"')
                elif col == 'email':
                    if 'email' in users_col_names:
                        insert_cols.append('email')
                        select_cols.append(f'"{col}"')
                elif col == 'password_hash':
                    if 'password_hash' in users_col_names:
                        insert_cols.append('password_hash')
                        select_cols.append(f'"{col}"')
                elif col == 'role_id':
                    if 'role_id' in users_col_names:
                        insert_cols.append('role_id')
                        select_cols.append(f'"{col}"::bigint')
                elif col == 'created_at':
                    if 'created_at' in users_col_names:
                        insert_cols.append('created_at')
                        select_cols.append(f'"{col}"::timestamp')

            print(f"Columns to migrate: {', '.join(insert_cols)}")

            if not insert_cols:
                print("❌ No compatible columns found for migration")
                return 1

            # Perform the INSERT
            insert_sql = f"INSERT INTO users ({', '.join(insert_cols)}) SELECT {', '.join(select_cols)} FROM \"user\""
            print(f"SQL: {insert_sql}")

            try:
                db.session.execute(text(insert_sql))
                db.session.commit()
                print("✅ Migration completed successfully")

                # Verify migration
                new_count = db.session.execute(text("SELECT COUNT(*) FROM users")).fetchone()[0]
                print(f"✅ Users table now has {new_count} records")

                # Show migrated data
                if new_count > 0:
                    migrated_result = db.session.execute(text("SELECT id, name, email FROM users LIMIT 5"))
                    migrated_data = migrated_result.fetchall()
                    print("📋 Migrated user data:")
                    for row in migrated_data:
                        print(f"  - ID: {row[0]}, Name: {row[1]}, Email: {row[2]}")

                return 0

            except Exception as mig_error:
                db.session.rollback()
                print(f"❌ Migration failed: {mig_error}")
                return 1

        except Exception as e:
            print(f"❌ Error during migration: {e}")
            import traceback
            traceback.print_exc()
            return 1

if __name__ == '__main__':
    sys.exit(main())
