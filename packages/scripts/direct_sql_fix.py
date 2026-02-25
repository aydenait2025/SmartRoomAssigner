#!/usr/bin/env python3
"""
Direct SQL approach to fix the assignments table
"""
import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

def fix_assignments_table_direct_sql():
    """Direct SQL approach to fix assignments table schema"""

    # Get database connection details
    db_url = os.getenv('DATABASE_URL')
    if not db_url:
        # Extract from individual environment variables (as shown in app.py)
        db_host = os.getenv('DB_HOST', 'ep-cool-boat-a4gkok47.us-east-1.aws.neon.tech')
        db_name = os.getenv('DB_NAME', 'neondb')
        db_user = os.getenv('DB_USER', 'neondb_owner')
        db_password = os.getenv('DB_PASSWORD', 'something_secret')
        db_sslmode = os.getenv('DB_SSLMODE', 'require')

        # Construct connection string
        db_url = f"postgresql://{db_user}:{db_password}@{db_host}/{db_name}?sslmode={db_sslmode}"

    print(f"Connecting to database...")

    conn = None
    try:
        # Connect to the database
        conn = psycopg2.connect(db_url)
        conn.autocommit = True  # Enable auto-commit for DDL statements

        with conn.cursor() as cursor:
            # Drop the table if it exists
            print("Dropping existing assignments table...")
            cursor.execute("DROP TABLE IF EXISTS assignments CASCADE")

            # Create the new assignments table with the correct schema
            print("Creating new assignments table...")
            cursor.execute("""
                CREATE TABLE assignments (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER NOT NULL REFERENCES users(id),
                    room_id INTEGER NOT NULL REFERENCES rooms(id),
                    exam_id INTEGER REFERENCES exams(id),
                    course VARCHAR(100),
                    exam_date TIMESTAMP,
                    assigned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    special_accommodations TEXT,
                    notes TEXT,
                    seat_number VARCHAR(10)
                )
            """)

            # Add indexes for performance
            print("Adding indexes...")
            cursor.execute("CREATE INDEX idx_assignments_user_id ON assignments(user_id)")
            cursor.execute("CREATE INDEX idx_assignments_room_id ON assignments(room_id)")
            cursor.execute("CREATE INDEX idx_assignments_exam_id ON assignments(exam_id)")
            cursor.execute("CREATE INDEX idx_assignments_exam_date ON assignments(exam_date)")

            # Verify the table was created correctly
            print("Verifying table creation...")
            cursor.execute("""
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns
                WHERE table_name = 'assignments'
                ORDER BY ordinal_position
            """)

            columns = cursor.fetchall()
            print("\n📋 Assignments table columns:")
            for col in columns:
                nullable = "NULL" if col[2] == 'YES' else "NOT NULL"
                print(f"  - {col[0]} ({col[1]}) {nullable}")

            print("\n✅ Assignments table fixed successfully!")

    except Exception as e:
        print(f"❌ Error: {e}")
        if conn:
            conn.rollback()
        return False

    finally:
        if conn:
            conn.close()

    return True

if __name__ == "__main__":
    success = fix_assignments_table_direct_sql()
    if success:
        print("\n🎯 Database fix complete! Restart Flask if needed.")
    else:
        print("\n❌ Database fix failed!")
