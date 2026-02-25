#!/usr/bin/env python3

import os
import psycopg2
from dotenv import load_dotenv

def run_sql_file():
    load_dotenv()

    # Database connection parameters (assuming Neon/PostgreSQL setup)
    db_url = os.getenv('DATABASE_URL')
    if not db_url:
        print("❌ DATABASE_URL not found. Please check your .env file.")
        return

    try:
        print("🔌 Connecting to database...")
        conn = psycopg2.connect(db_url)
        conn.autocommit = True
        cursor = conn.cursor()

        print("📢 Running notification seeding SQL...")

        # Read and execute the SQL file
        with open('seed_notifications.sql', 'r') as f:
            sql_content = f.read()

        # Execute the entire SQL file
        cursor.execute(sql_content)
        print("✅ Successfully executed notification seeding SQL")

        # Check results
        cursor.execute("SELECT COUNT(*) FROM system_notifications")
        notification_count = cursor.fetchone()[0]
        print(f"📊 Total notifications in database: {notification_count}")

        # Show details of the inserted notifications
        cursor.execute("""
            SELECT id, notification_title, priority_level, read_by_user,
                   CASE WHEN recipient_role_id IS NOT NULL THEN 'Role-based' ELSE 'User-specific' END as type,
                   created_at
            FROM system_notifications
            ORDER BY created_at DESC
            LIMIT 5
        """)
        print("\n📋 Recent notifications:")
        for row in cursor.fetchall():
            print(f"  • {row[1]} ({row[2]}) - {row[3] and 'Read' or 'Unread'}")

        conn.close()

        print("\n🎉 Notification seeding completed successfully!")

    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    run_sql_file()
