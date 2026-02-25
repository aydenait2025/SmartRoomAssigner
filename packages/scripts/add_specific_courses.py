#!/usr/bin/env python3
"""
Add specific CS courses with target enrollments:
- CSCC73: 130 students (Software Tools and Systems Programming)
- CSCD84: 150 students (Programming Languages)
- CSCD70: 80 students (Compiler Optimization)
- CSCC63: 80 students (Compiler Construction)
- CSCD18: 100 students (Discrete Mathematics for Computer Science)
- CSCD58: 140 students (Database Systems)
- CSCB58: 130 students (Operational System Principles)
"""

import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()
conn = psycopg2.connect(os.getenv('DATABASE_URL'))
cursor = conn.cursor()

print("🔍 Adding specific CS courses...")

# Get Computer Science department ID
cursor.execute("SELECT id FROM academic_departments WHERE department_name = 'Computer Science' LIMIT 1")
dept_result = cursor.fetchone()
if not dept_result:
    print("❌ Computer Science department not found. Please create it first.")
    cursor.execute("SELECT id FROM academic_departments WHERE department_name LIKE '%Computer%' OR department_name LIKE '%Science%' LIMIT 1")
    dept_result = cursor.fetchone()
    if not dept_result:
        print("Using first available department...")
        cursor.execute("SELECT id FROM academic_departments LIMIT 1")
        dept_result = cursor.fetchone()

if dept_result:
    dept_id = dept_result[0]
    print(f"✅ Using department ID: {dept_id}")

    courses_to_add = [
        ("CSCC73", "Software Tools and Systems Programming"),
        ("CSCD84", "Programming Languages"),
        ("CSCD70", "Compiler Optimization"),
        ("CSCC63", "Compiler Construction"),
        ("CSCD18", "Discrete Mathematics for Computer Science"),
        ("CSCD58", "Database Systems"),
        ("CSCB58", "Operational System Principles")
    ]

    for course_code, course_name in courses_to_add:
        # Check if course already exists
        cursor.execute("SELECT id FROM courses WHERE course_code = %s", (course_code,))
        existing = cursor.fetchone()

        if existing:
            print(f"⚠️  Course {course_code} already exists")
        else:
            # Insert course
            cursor.execute("""
                INSERT INTO courses (course_code, course_name, department_id, is_active, typical_enrollment)
                VALUES (%s, %s, %s, true, 50)
            """, (course_code, course_name, dept_id))
            print(f"✅ Added course: {course_code} - {course_name}")

    conn.commit()
    print("\n✅ All target courses are now available!")

else:
    print("❌ No academic departments found. Please create departments first.")

# Now assign specific enrollments
print("\n👥 Assigning specific enrollments...")

# Get course IDs
course_enrollments = {
    'CSCC73': 130,
    'CSCD84': 150,
    'CSCD70': 80,
    'CSCC63': 80,
    'CSCD18': 100,
    'CSCD58': 140,
    'CSCB58': 130
}

# Get current academic term
cursor.execute("""
    SELECT id FROM academic_terms
    WHERE is_current = true
    ORDER BY start_date DESC
    LIMIT 1
""")
term_result = cursor.fetchone()
if not term_result:
    # Create a term if none exists
    cursor.execute("""
        INSERT INTO academic_terms (academic_year, term_code, start_date, end_date, is_current)
        VALUES (2025, 'Fall 2025', CURRENT_DATE, CURRENT_DATE + INTERVAL '4 months', true)
        RETURNING id
    """)
    term_result = [cursor.fetchone()[0]]

term_id = term_result[0]
print(f"📅 Using academic term ID: {term_id}")

# Get students who are not already enrolled in these courses
for course_code, target_count in course_enrollments.items():
    cursor.execute("SELECT id FROM courses WHERE course_code = %s", (course_code,))
    course_result = cursor.fetchone()

    if not course_result:
        print(f"❌ Course {course_code} not found, skipping enrollment")
        continue

    course_id = course_result[0]

    # Get current enrollments for this course this term
    cursor.execute("""
        SELECT COUNT(*) FROM course_enrollments
        WHERE course_id = %s AND term_id = %s
    """, (course_id, term_id))
    current_count = cursor.fetchone()[0]

    students_needed = target_count - current_count

    if students_needed <= 0:
        print(f"🎯 {course_code}: Already has {current_count}/{target_count} students (target met)")
        continue

    print(f"📝 {course_code}: Currently {current_count} students, need {students_needed} more to reach {target_count}")

    # Get students who are active but not enrolled in this course
    cursor.execute("""
        SELECT s.id
        FROM students s
        WHERE s.enrollment_status = 'active'
        AND s.id NOT IN (
            SELECT student_id FROM course_enrollments
            WHERE course_id = %s AND term_id = %s
        )
        ORDER BY s.id
        LIMIT %s
    """, (course_id, term_id, students_needed))

    available_students = [row[0] for row in cursor.fetchall()]

    if len(available_students) < students_needed:
        print(f"⚠️  Warning: Only {len(available_students)} available students found for {course_code}")

    # Enroll students
    enrolled = 0
    for student_id in available_students:
        cursor.execute("""
            INSERT INTO course_enrollments
            (student_id, course_id, term_id, enrollment_status, enrollment_date, credit_hours)
            VALUES (%s, %s, %s, 'enrolled', CURRENT_TIMESTAMP, 3)
        """, (student_id, course_id, term_id))
        enrolled += 1

    print(f"✅ Enrolled {enrolled} students in {course_code} (now at {current_count + enrolled}/{target_count})")

conn.commit()

# Final verification
print("\n🎯 FINAL ENROLLMENT VERIFICATION:")
total_assigned = 0
for course_code, target_count in course_enrollments.items():
    cursor.execute("""
        SELECT COUNT(*) FROM course_enrollments ce
        JOIN courses c ON ce.course_id = c.id
        WHERE c.course_code = %s AND ce.term_id = %s
    """, (course_code, term_id))
    actual_count = cursor.fetchone()[0]
    status = "✅" if actual_count >= target_count else "⚠️"
    print(f"  {status} {course_code}: {actual_count}/{target_count} students")
    total_assigned += actual_count

print(f"\n📊 Total students assigned across target courses: {total_assigned}")

conn.close()
print("\n🎉 Course enrollment assignment complete!")
