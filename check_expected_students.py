#!/usr/bin/env python3
import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()
conn = psycopg2.connect(os.getenv('DATABASE_URL'))
cursor = conn.cursor()

cursor.execute('SELECT COUNT(*) as course_count, SUM(typical_enrollment) as total_expected FROM courses')
result = cursor.fetchone()
course_count = result[0]
total_expected = result[1]

print(f'Total courses: {course_count}')
print(f'Sum of all typical_enrollment values: {total_expected}')
print(f'That equals the "Total Expected Students" you see ({total_expected})')
print()
print('Individual course typical_enrollment values (first 10):')
cursor.execute('SELECT course_code, course_name, typical_enrollment FROM courses ORDER BY course_code LIMIT 10')
courses = cursor.fetchall()
for code, name, expected in courses:
    print(f'  {code}: {name} - typical_enrollment: {expected}')

print()
print('EXPLANATION:')
print('The "Total Expected Students" metric is summing up the "typical_enrollment" field')
print('from ALL courses in the database. This field represents how many students')
print('typically enroll in each individual course, not the total student population.')
print()
print('SOLUTION OPTIONS:')
print('1. Change course typical_enrollment values to more realistic numbers')
print('2. Change the frontend to show "Total Enrolled Students" instead')
print('3. Remove this metric if it\'s confusing')

conn.close()
