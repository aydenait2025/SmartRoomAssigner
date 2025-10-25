#!/usr/bin/env python3

import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()
conn = psycopg2.connect(os.getenv('DATABASE_URL'))
cursor = conn.cursor()

print("🔍 Checking CS course enrollments...")

# Check available CS courses
cursor.execute("SELECT id, course_code, course_name FROM courses WHERE course_code LIKE 'CSC%' OR course_code LIKE 'CSCC%' ORDER BY course_code")
results = cursor.fetchall()

print(f'\nAvailable CS-related courses ({len(results)}):')
for row in results:
    print(f'  ID: {row[0]} - {row[1]}: {row[2]}')

# Check enrollments for target courses
cursor.execute("""
    SELECT c.course_code, COUNT(ce.student_id) as enrollment_count
    FROM courses c
    LEFT JOIN course_enrollments ce ON ce.course_id = c.id
    WHERE c.course_code IN ('CSCC73', 'CSCD84', 'CSCD70')
    GROUP BY c.course_code, c.id
    ORDER BY c.course_code
""")
enrollments = cursor.fetchall()

print(f'\nCurrent enrollments for target courses ({len(enrollments)}):')
for code, count in enrollments:
    print(f'  {code}: {count} students')

target_courses = ['CSCC73', 'CSCD84', 'CSCD70']
available_codes = [row[1] for row in results]

missing_courses = [code for code in target_courses if code not in available_codes]
if missing_courses:
    print(f'\n⚠️  Missing target courses: {missing_courses}')
else:
    print(f'\n✅ All target courses (CSCC73, CSCD84, CSCD70) are available')

conn.close()
