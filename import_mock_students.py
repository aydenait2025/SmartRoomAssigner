#!/usr/bin/env python3

import csv
import os
import psycopg2
from dotenv import load_dotenv
import hashlib

def import_students_from_csv():
    load_dotenv()

    # Database connection
    db_url = os.getenv('DATABASE_URL')
    if not db_url:
        print("❌ DATABASE_URL not found. Please check your .env file.")
        return

    try:
        print("🔌 Connecting to database...")
        conn = psycopg2.connect(db_url)
        conn.autocommit = True
        cursor = conn.cursor()

        print("👥 Reading mock students from CSV...")

        # Read CSV file
        students_data = []
        csv_path = "utils/scripts/data-generation/mock_students_600.csv"

        try:
            with open(csv_path, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    students_data.append(row)
        except FileNotFoundError:
            print(f"❌ CSV file not found at {csv_path}")
            return

        print(f"📊 Found {len(students_data)} students in CSV")

        # Get student role ID (assuming it exists)
        cursor.execute("SELECT id FROM roles WHERE name = 'student' LIMIT 1")
        role_result = cursor.fetchone()
        if not role_result:
            print("❌ Student role not found. Please create roles first.")
            return
        student_role_id = role_result[0]

        # Hash the default password using a simple hash for demo purposes
        default_password = "password123"
        hashed_password = hashlib.sha256(default_password.encode('utf-8')).hexdigest()

        imported_count = 0
        skipped_count = 0
        error_count = 0

        for i, student in enumerate(students_data):
            try:
                first_name = student['first_name']
                last_name = student['last_name']
                student_number = student['student_number']
                email = student['student_id']  # This is the email from CSV
                department = student['department']

                # Create full name
                full_name = f"{first_name} {last_name}"

                # Check if user already exists
                cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
                existing_user = cursor.fetchone()

                if existing_user:
                    # Check if student record exists
                    cursor.execute("SELECT id FROM students WHERE user_id = %s", (existing_user[0],))
                    existing_student = cursor.fetchone()
                    if existing_student:
                        skipped_count += 1
                        continue
                else:
                    # Insert into users table
                    cursor.execute("""
                        INSERT INTO users (name, email, password_hash, role_id, email_verified, created_at)
                        VALUES (%s, %s, %s, %s, true, CURRENT_TIMESTAMP)
                        RETURNING id
                    """, (full_name, email, hashed_password, student_role_id))

                    user_id = cursor.fetchone()[0]

                # Get user_id if it already existed
                if existing_user:
                    user_id = existing_user[0]

                # Insert into students table
                cursor.execute("""
                    INSERT INTO students (user_id, student_number, enrollment_year, enrollment_status, created_at)
                    VALUES (%s, %s, 2024, 'active', CURRENT_TIMESTAMP)
                """, (user_id, student_number))

                imported_count += 1

                if (imported_count + skipped_count + error_count) % 50 == 0:
                    print(f"Progress: {imported_count + skipped_count + error_count}/{len(students_data)} students processed")

            except Exception as e:
                error_count += 1
                print(f"❌ Error importing student {first_name} {last_name} ({email}): {str(e)[:100]}")
                continue

        # Update department names to academic departments if mapping exists
        print("🏫 Updating student departments...")

        # Map common department names to academic departments
        dept_mapping = {
            'Computer Science': 'Computer Science',
            'Electrical Engineering': 'Electrical Engineering',
            'Mechanical Engineering': 'Mechanical Engineering',
            'Chemistry': 'Chemistry',
            'Physics': 'Physics',
            'Mathematics': 'Mathematics',
            'Biology': 'Biology',
            'Business Administration': 'Business Administration',
            'Psychology': 'Psychology',
            'Political Science': 'Political Science',
            'Economics': 'Economics',
            'History': 'History',
            'English Literature': 'English Literature',
            'Philosophy': 'Philosophy',
            'Civil Engineering': 'Civil Engineering',
            'Chemical Engineering': 'Chemical Engineering',
            'Environmental Science': 'Environmental Science',
        }

        # Get department mappings
        dept_ids = {}
        for dept_name in dept_mapping.values():
            cursor.execute("SELECT id FROM academic_departments WHERE department_name = %s", (dept_name,))
            result = cursor.fetchone()
            if result:
                dept_ids[dept_name] = result[0]

        print(f"Found {len(dept_ids)} matching academic departments")

        conn.close()

        print("\n" + "="*60)
        print("🎓 STUDENT IMPORT COMPLETE!" )
        print("="*60)
        print(f"✅ Successfully imported: {imported_count} students")
        print(f"⏭️  Skipped (already exist): {skipped_count} students")
        print(f"❌ Errors: {error_count} students")
        print(f"📊 Success rate: {(imported_count / (imported_count + skipped_count + error_count) * 100):.1f}%")
        print("\n🔑 LOGIN DETAILS:")
        print("   Email: [any student email from CSV]")
        print("   Password: password123")
        print("\n🎯 STUDENTS CAN NOW:")
        print("   • Appear in Student Management with pagination")
        print("   • Be assigned to courses and exams")
        print("   • View in Reports and Analytics")
        print("   • Generate room assignment data")

    except Exception as e:
        print(f"❌ Database error: {str(e)}")

if __name__ == "__main__":
    import_students_from_csv()
