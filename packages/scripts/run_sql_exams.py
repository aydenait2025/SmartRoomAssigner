#!/usr/bin/env python3

import os
import psycopg2
from dotenv import load_dotenv

def run_exams_sql():
    load_dotenv()

    # Database connection parameters (assuming Neon/PostgreSQL setup)
    db_url = os.getenv('DATABASE_URL')
    if not db_url:
        print("❌ DATABASE_URL not found. Please check your .env file.")
        return

    try:
        print("🔌 Connecting to database...")
        conn = psycopg2.connect(db_url)
        conn.autocommit = True
        cursor = conn.cursor()

        print("📝 Running sample exams insertion SQL...")

        # Read and execute the SQL file
        with open('insert_sample_exams.sql', 'r') as f:
            sql_content = f.read()

        # Split by semicolons and execute each statement
        statements = [stmt.strip() for stmt in sql_content.split(';') if stmt.strip()]

        inserted_exams = 0
        for statement in statements:
            if statement:  # Skip empty statements
                try:
                    cursor.execute(statement)
                    if "INSERT INTO exams" in statement:
                        inserted_exams += 1
                    print(f"✓ Executed SQL block containing {inserted_exams} exam inserts")
                except Exception as e:
                    print(f"⚠️  Error on statement: {str(e)[:100]}...")

        print(f"✅ Successfully executed SQL statements")

        # Check results
        cursor.execute("SELECT COUNT(*) FROM exams WHERE exam_code LIKE '%CSC%'")
        exam_count = cursor.fetchone()[0]
        print(f"📊 Total CS exams in database: {exam_count}")

        cursor.execute("""
            SELECT e.exam_code, c.course_code, c.course_name, e.exam_type, e.student_count_estimate
            FROM exams e
            JOIN courses c ON e.course_id = c.id
            WHERE e.exam_code LIKE '%CSC%'
            ORDER BY c.course_code, e.exam_type
        """)

        print("\n📋 Exam Summary:")
        for row in cursor.fetchall():
            exam_code, course_code, course_name, exam_type, students = row
            print(f"  • {exam_code}: {course_name} ({exam_type}) - ~{students} students")

        conn.close()

        print(f"\n🎓 Successfully added {inserted_exams} Computer Science exam sessions!")

    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    run_exams_sql()
