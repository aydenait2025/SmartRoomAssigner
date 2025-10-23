#!/usr/bin/env python3
"""
Check which tables are defined in the schema but not present in the database
"""
import os
import re
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

# Load environment variables
load_dotenv()
DATABASE_URL = os.getenv('DATABASE_URL')

if not DATABASE_URL:
    print("❌ ERROR: DATABASE_URL not found")
    exit(1)

try:
    print("🔍 Analyzing schema file...")
    engine = create_engine(DATABASE_URL)

    # Read the full schema file
    with open('db/ultimate_enterprise_schema.sql', 'r') as f:
        schema_content = f.read()

    # Extract all CREATE TABLE statements
    table_pattern = r'CREATE TABLE (\w+)\s*\('
    defined_tables = set(re.findall(table_pattern, schema_content))

    print(f"📋 Schema defines {len(defined_tables)} tables")

    # Get actual database tables
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
            ORDER BY table_name
        """))
        actual_tables = set(row[0] for row in result.fetchall())

    print(f"💾 Database has {len(actual_tables)} tables")

    # Find missing tables
    missing_tables = defined_tables - actual_tables
    extra_tables = actual_tables - defined_tables

    print("\n" + "="*60)
    print("📊 MISSING TABLES FROM SCHEMA:")
    print("="*60)

    if missing_tables:
        for i, table in enumerate(sorted(missing_tables), 1):
            print(f"{i:2d}. {table}")
    else:
        print("✅ All defined tables are present in database!")

    if extra_tables:
        print(f"\n📋 EXTRA TABLES IN DATABASE (from MFA script): {len(extra_tables)}")
        for table in sorted(extra_tables):
            print(f"   • {table}")

    print(f"\n🎯 SUMMARY:")
    print(f"   Schema defines: {len(defined_tables)} tables")
    print(f"   Database has: {len(actual_tables)} tables")
    print(f"   Missing: {len(missing_tables)} tables")
    print(f"   Extra (MFA): {len(extra_tables)} tables")

except Exception as e:
    print(f"❌ Error: {e}")
