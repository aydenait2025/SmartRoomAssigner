#!/usr/bin/env python3
"""
Remove specified CS courses and transfer enrollments to CSCA08 and CSCA48
"""

import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()
conn = psycopg2.connect(os.getenv('DATABASE_URL'))
cursor = conn.cursor()

# Courses to remove and transfer enrollments
courses_to_remove = ['CSCC63', 'CSCD70', 'CSCD58', 'CSCD18', 'CSCB58', 'CSCD84', 'CSCC73']
target_courses = ['CSCA08', 'CSCA48']

print(f"🗑️  Removing {len(courses_to_remove)} CS courses and transferring enrollments...")

# Check if target courses exist, create them if not
print("\n📚 Checking/creating target courses...")

for course_code in target_courses:
    cursor.execute("SELECT id FROM courses WHERE course_code = %s", (course_code,))
    if not cursor.fetchone():
        # Create course with default name based on code
        course_names = {
            'CSCA08': 'Introduction to Computer Science I',
            'CSCA48': 'Introduction to Computer Science II'
        }
        course_name = course_names.get(course_code, f'Course {course_code}')

        # Get Computer Science department
        cursor.execute("SELECT id FROM academic_departments WHERE department_name LIKE '%Computer%' LIMIT 1")
        dept_result = cursor.fetchone()
        dept_id = dept_result[0] if dept_result else 1

        cursor.execute("""
            INSERT INTO courses (course_code, course_name, department_id, typical_enrollment, is_active)
            VALUES (%s, %s, %s, 150, true)
        """, (course_code, course_name, dept_id))

        print(f"  ✅ Created course: {course_code} - {course_name}")
    else:
        print(f"  ✅ Course already exists: {course_code}")

conn.commit()

# Get target course IDs for enrollment transfer
target_course_ids = {}
for course_code in target_courses:
    cursor.execute("SELECT id FROM courses WHERE course_code = %s", (course_code,))
    result = cursor.fetchone()
    if result:
        target_course_ids[course_code] = result[0]
        print(f"  📍 Target course {course_code} has ID: {result[0]}")

print(f"\n📊 Preparing to transfer enrollments from {len(courses_to_remove)} courses...")

total_enrollments_transferred = 0
total_removed_courses = 0

# Process each course to remove
for i, course_code in enumerate(courses_to_remove):
    print(f"\n[{i+1}/{len(courses_to_remove)}] Processing {course_code}...")

    # Check current enrollments
    cursor.execute("""
        SELECT COUNT(*) FROM course_enrollments ce
        JOIN courses c ON ce.course_id = c.id
        WHERE c.course_code = %s
    """, (course_code,))
    enrollment_count = cursor.fetchone()[0]

    if enrollment_count == 0:
        print(f"  📝 {course_code}: No enrollments to transfer")
    else:
        # Transfer enrollments - distribute between CSCA08 and CSCA48
        target_course_index = i % 2  # Alternate between the two target courses
        target_course_code = target_courses[target_course_index]
        target_course_id = target_course_ids[target_course_code]

        print(f"  🔄 Transferring {enrollment_count} enrollments from {course_code} to {target_course_code}")

        # Get term ID
        cursor.execute("SELECT id FROM academic_terms WHERE is_current = true LIMIT 1")
        term_result = cursor.fetchone()
        term_id = term_result[0] if term_result else 1

        # Get students enrolled in this course
        cursor.execute("""
            SELECT student_id FROM course_enrollments ce
            JOIN courses c ON ce.course_id = c.id
            WHERE c.course_code = %s
        """, (course_code,))

        enrolled_students = [row[0] for row in cursor.fetchall()]

        # Transfer enrollments to target course (only if not already enrolled)
        transferred = 0
        for student_id in enrolled_students:
            try:
                cursor.execute("""
                    INSERT INTO course_enrollments
                    (student_id, course_id, term_id, enrollment_status, enrollment_date, credit_hours)
                    VALUES (%s, %s, %s, 'enrolled', CURRENT_TIMESTAMP, 3)
                    ON CONFLICT (student_id, course_id, term_id) DO NOTHING
                """, (student_id, target_course_id, term_id))

                transferred += cursor.rowcount
            except Exception as e:
                print(f"    ⚠️  Error transferring student {student_id}: {e}")

        print(f"  ✅ Transferred {transferred} enrollments to {target_course_code}")
        total_enrollments_transferred += transferred

    # Remove enrollments from the course being deleted
    cursor.execute("""
        DELETE FROM course_enrollments WHERE course_id IN (
            SELECT id FROM courses WHERE course_code = %s
        )
    """, (course_code,))
    print(f"  🗑️  Removed {cursor.rowcount} enrollment records from {course_code}")

    # Delete the course
    cursor.execute("DELETE FROM courses WHERE course_code = %s", (course_code,))
    if cursor.rowcount > 0:
        print(f"  🗑️  Deleted course: {course_code}")
        total_removed_courses += 1

conn.commit()

# Final verification
print("\n🎯 FINAL VERIFICATION:")
print(f"  📊 Courses removed: {total_removed_courses}/7")
print(f"  👥 Enrollments transferred: {total_enrollments_transferred}")

# Check remaining courses
cursor.execute("SELECT COUNT(*) FROM courses")
remaining_courses = cursor.fetchone()[0]
print(f"  📚 Remaining courses: {remaining_courses}")

# Check target course enrollments
print(f"\n📊 Target courses enrollment:")
for course_code, course_id in target_course_ids.items():
    cursor.execute("SELECT COUNT(*) FROM course_enrollments WHERE course_id = %s", (course_id,))
    enrollment_count = cursor.fetchone()[0]
    print(f"  • {course_code}: {enrollment_count} students")

conn.close()

print(f"\n🎉 Course cleanup and enrollment transfer complete!")
print(f"   Removed {total_removed_courses} courses and transferred {total_enrollments_transferred} enrollments.")
