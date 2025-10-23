#!/usr/bin/env python3
"""
Add the missing tables to complete database schema
"""
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

# Load environment variables
load_dotenv()
DATABASE_URL = os.getenv('DATABASE_URL')

if not DATABASE_URL:
    print("❌ ERROR: DATABASE_URL not found")
    exit(1)

try:
    print("🔧 Adding missing tables...")
    engine = create_engine(DATABASE_URL)

    # Read and execute each statement separately
    with engine.connect() as conn:
        with open('fix_missing_tables.sql', 'r') as f:
            sql_content = f.read()

        # Split by semicolons but handle comments
        statements = []
        current_statement = []
        in_comment = False

        for line in sql_content.split('\n'):
            line = line.strip()
            if not line or line.startswith('--'):
                continue

            if line.startswith('/*'):
                in_comment = True
                continue
            if line.endswith('*/'):
                in_comment = False
                continue

            if not in_comment and line.endswith(';'):
                current_statement.append(line)
                statements.append(' '.join(current_statement))
                current_statement = []
            elif not in_comment:
                current_statement.append(line)

        added_tables = []
        i = 0
        for stmt in statements:
            if stmt and not stmt.upper().startswith('COMMIT'):
                try:
                    conn.execute(text(stmt))
                    i += 1
                    print(f"✅ Executed statement {i}")
                    # Look for table creation
                    upper_stmt = stmt.upper()
                    if 'CREATE TABLE' in upper_stmt:
                        table_name = stmt.split('CREATE TABLE')[1].split('(')[0].strip()
                        added_tables.append(table_name)
                        print(f"   📋 Created table: {table_name}")
                except Exception as e:
                    print(f"⚠️  Skipped: {str(e)[:100]}...")

        conn.commit()

        print("\n🎉 Added tables:")
        for table in sorted(added_tables):
            print(f"   • {table}")
        print(f"\n📊 Total statements executed: {i}")

except Exception as e:
    print(f"❌ Error: {e}")
