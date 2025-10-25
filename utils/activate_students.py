#!/usr/bin/env python3
"""Script to activate all student users"""

import os
import sys
import subprocess

# Check if we're in the right directory
current_dir = os.getcwd()
if not current_dir.endswith('SmartRoomAssigner'):
    print(f"Error: Must run from SmartRoomAssigner directory. Currently in: {current_dir}")
    sys.exit(1)

# Try to connect to the database directly using environment variables
try:
    import psycopg2
    from dotenv import load_dotenv
    load_dotenv()

    db_url = os.getenv('DATABASE_URL')
    if not db_url:
        print("No DATABASE_URL found in environment. Falling back to local database script.")

        # Run a simple SQL file if we can
        sql_file = 'activate_students.sql'
        sql_content = '''
        UPDATE users SET is_active = true WHERE role_id = 2;
        SELECT COUNT(*) as total_students from users where role_id = 2;
        SELECT COUNT(*) as active_students from users where role_id = 2 AND is_active = true;
        '''

        with open(sql_file, 'w') as f:
            f.write(sql_content)

        print("Created activate_students.sql - manually run this against your database")
        print("SQL content:")
        print(sql_content)

    else:
        # Try direct database connection
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor()

        # Update all students to be active
        cursor.execute("UPDATE users SET is_active = true WHERE role_id = 2")

        # Get counts
        cursor.execute("SELECT COUNT(*) as total_students FROM users WHERE role_id = 2")
        total_students = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) as active_students FROM users WHERE role_id = 2 AND is_active = true")
        active_students = cursor.fetchone()[0]

        conn.commit()
        cursor.close()
        conn.close()

        print(f"✅ Successfully activated all students!")
        print(f"   Total students: {total_students}")
        print(f"   Active students: {active_students}")

except ImportError:
    print("psycopg2 not available. Please install with: pip install psycopg2-binary")
    print("Or manually run this SQL query on your database:")
    print("UPDATE users SET is_active = true WHERE role_id = 2;")
except Exception as e:
    print(f"Database connection failed: {e}")
    print("Please manually run this SQL query on your database:")
    print("UPDATE users SET is_active = true WHERE role_id = 2;")
