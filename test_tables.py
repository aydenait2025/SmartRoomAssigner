import sqlite3

conn = sqlite3.connect('data/app.db')
cursor = conn.cursor()

# Get all tables
cursor.execute('SELECT name FROM sqlite_master WHERE type="table"')
tables = cursor.fetchall()
print('Available tables:')
for table in tables:
    print(f'- {table[0]}')

# Check for course_enrollments table specifically
try:
    cursor.execute('PRAGMA table_info(course_enrollments)')
    columns = cursor.fetchall()
    print('\nCourse enrollments table schema:')
    for col in columns:
        print(f'- {col[1]} ({col[2]})')
except:
    print('\nNo course_enrollments table found')

# Check for users table
try:
    cursor.execute('SELECT COUNT(*) FROM users WHERE role_id=2')
    student_count = cursor.fetchone()[0]
    print(f'\nStudents in users table: {student_count}')
except:
    print('\nNo users table or no students found')

# Sample queries to debug
try:
    cursor.execute('SELECT COUNT(*) FROM students')
    student_count_old = cursor.fetchone()[0]
    print(f'Students in old students table: {student_count_old}')
except:
    print('No students table found')

conn.close()
