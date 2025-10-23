#!/usr/bin/env python3
"""
Check current database table count
"""
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

# Load environment variables
load_dotenv()
DATABASE_URL = os.getenv('DATABASE_URL')

if not DATABASE_URL:
    print("❌ ERROR: DATABASE_URL not found in .env file")
    print("Make sure .env file exists and contains DATABASE_URL")
    exit(1)

try:
    print("🔌 Connecting to database...")
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
            ORDER BY table_name
        """))
        tables = [row[0] for row in result.fetchall()]

        print(f"\n📊 Current Database Tables: {len(tables)}")
        print("=" * 50)
        for i, table in enumerate(tables, 1):
            print(f"{i:2d}. {table}")

        print("\n✅ Database connection successful!")

except Exception as e:
    print(f"❌ Error: {e}")
