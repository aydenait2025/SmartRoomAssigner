#!/usr/bin/env python3
"""
Enroll 80 students in CSCC63 (Compiler Construction)
"""

import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()
conn = psycopg2.connect(os.getenv('DATABASE_URL'))
cursor = conn.cursor()

print("🎓 Enrolling 80 students in CSCC63...")

# Get CSCC63 course details
cursor.execute('''
SELECT id, course_code, course_name, typical_enrollment
FROM courses
WHERE course_code = 'CSCC63'
''')

course = cursor.fetchone()
if not course:
    print("❌ CSCC63 course not found!")
    conn.close()
    exit(1)

course_id, course_code, course_name, typical_enrollment = course
print(f"📚 Course: {course_name} ({course_code})")
print(f"   ID: {course_id}, Capacity: {typical_enrollment}")

# Check current enrollments
cursor.execute('SELECT COUNT(*) FROM course_enrollments WHERE course_id = %s', (course_id,))
currently_enrolled = cursor.fetchone()[0]
print(f"   Currently enrolled: {currently_enrolled}")

# Get current academic term
cursor.execute('''
SELECT id FROM academic_terms
WHERE is_current = true
ORDER BY start_date DESC
LIMIT 1
''')
term_result = cursor.fetchone()
if not term_result:
    print("❌ No current academic term found!")
    conn.close()
    exit(1)

term_id = term_result[0]
print(f"📅 Using academic term ID: {term_id}")

target_enrollment = 80
need_to_enroll = target_enrollment - currently_enrolled

if need_to_enroll <= 0:
    print(f"✅ Already has {currently_enrolled}/{target_enrollment} students enrolled!")
    conn.close()
    exit(0)

print(f"🎯 Need to enroll {need_to_enroll} more students")

# Find available students not already enrolled in this course
cursor.execute('''
SELECT s.id, u.name
FROM students s
JOIN users u ON s.user_id = u.id
WHERE s.enrollment_status = 'active'
AND s.id NOT IN (
    SELECT student_id FROM course_enrollments
    WHERE course_id = %s
)
ORDER BY s.id
LIMIT %s
''', (course_id, need_to_enroll))

available_students = cursor.fetchall()
print(f"📝 Found {len(available_students)} available students")

if len(available_students) < need_to_enroll:
    print(f"⚠️  Warning: Only {len(available_students)} students available")
    need_to_enroll = len(available_students)

# Enroll students
enrolled_count = 0
successful_enrolls = 0

for student_id, student_name in available_students:
    try:
        cursor.execute('''
            INSERT INTO course_enrollments
            (student_id, course_id, term_id, enrollment_status, enrollment_date, credit_hours)
            VALUES (%s, %s, %s, 'enrolled', CURRENT_TIMESTAMP, 3)
        ''', (student_id, course_id, term_id))

        successful_enrolls += 1
        enrolled_count += 1

        if enrolled_count % 10 == 0:
            print(f"📝 Enrolled {enrolled_count} students...")

    except psycopg2.errors.UniqueViolation:
        print(f"⚠️  Student {student_name} ({student_id}) already enrolled - skipping")
        continue
    except Exception as e:
        print(f"❌ Error enrolling student {student_name}: {e}")
        continue

conn.commit()

# Verify final enrollment count
cursor.execute('SELECT COUNT(*) FROM course_enrollments WHERE course_id = %s', (course_id,))
final_count = cursor.fetchone()[0]

conn.close()

print("\n🎉 Enrollment Complete!")
print(f"✅ Successfully enrolled {successful_enrolls} students in {course_code}")
print(f"📊 Final enrollment: {final_count}/{target_enrollment} students")

if final_count >= target_enrollment:
    print(f"🎯 Target achieved! CSCC63 now has {final_count} enrolled students.")
else:
    print(f"⚠️  Only reached {final_count} enrollments. May need more students or adjust target.")
