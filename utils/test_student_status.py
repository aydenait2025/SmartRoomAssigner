#!/usr/bin/env python3
"""Script to randomly set student account status for testing"""

import os
import sys
import random

def main():
    # Try to connect to the database directly using environment variables
    try:
        import psycopg2
        from dotenv import load_dotenv
        load_dotenv()

        db_url = os.getenv('DATABASE_URL')
        if not db_url:
            print("No DATABASE_URL found in environment. Cannot proceed.")
            return

        # Connect to database
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor()

        # Get all students (role_id=2)
        cursor.execute("SELECT id, name FROM users WHERE role_id = 2 ORDER BY id")
        students = cursor.fetchall()

        if not students:
            print("No students found")
            cursor.close()
            conn.close()
            return

        print(f"Found {len(students)} students")

        # Reset all students to active and not locked
        cursor.execute("UPDATE users SET is_active = true, is_locked = false WHERE role_id = 2")
        conn.commit()
        print("Reset all students to active status")

        student_ids = [row[0] for row in students]

        # Randomly select 4 students to make inactive
        inactive_ids = random.sample(student_ids, min(4, len(student_ids)))

        # Update inactive students
        for student_id in inactive_ids:
            cursor.execute("UPDATE users SET is_active = false WHERE id = %s", (student_id,))
            student_name = next(row[1] for row in students if row[0] == student_id)
            print(f"Set student {student_name} (ID: {student_id}) to INACTIVE")

        # Randomly select 2 students to make locked (from remaining active)
        remaining_ids = [sid for sid in student_ids if sid not in inactive_ids]
        locked_ids = random.sample(remaining_ids, min(2, len(remaining_ids)))

        # Update locked students
        for student_id in locked_ids:
            cursor.execute("UPDATE users SET is_locked = true WHERE id = %s", (student_id,))
            student_name = next(row[1] for row in students if row[0] == student_id)
            print(f"Set student {student_name} (ID: {student_id}) to LOCKED")

        # Commit changes
        conn.commit()

        # Get final counts
        cursor.execute("SELECT COUNT(*) FROM users WHERE role_id = 2")
        total_count = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM users WHERE role_id = 2 AND is_active = true AND is_locked = false")
        active_count = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM users WHERE role_id = 2 AND is_active = false")
        inactive_count = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM users WHERE role_id = 2 AND is_locked = true")
        locked_count = cursor.fetchone()[0]

        cursor.close()
        conn.close()

        print("\nFinal Statistics:")
        print(f"   Total students: {total_count}")
        print(f"   Active students: {active_count}")
        print(f"   Inactive students: {inactive_count}")
        print(f"   Locked students: {locked_count}")

        print("\nModified student IDs:")
        print(f"   Inactive: {inactive_ids}")
        print(f"   Locked: {locked_ids}")

    except ImportError:
        print("psycopg2 not available. Please install with: pip install psycopg2-binary")
    except Exception as e:
        print(f"Database connection failed: {e}")

if __name__ == "__main__":
    main()
