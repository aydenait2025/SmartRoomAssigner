#!/usr/bin/env python3

import os
import psycopg2
from dotenv import load_dotenv

def run_sql_file():
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

        print("📚 Running course insertion SQL...")

        # Read and execute the SQL file
        with open('insert_cs_courses.sql', 'r') as f:
            sql_content = f.read()

        # Split by semicolons and execute each statement
        statements = [stmt.strip() for stmt in sql_content.split(';') if stmt.strip()]

        executed_count = 0
        for statement in statements:
            if statement:  # Skip empty statements
                try:
                    cursor.execute(statement)
                    executed_count += 1
                    print(f"✓ Executed statement {executed_count}")
                except Exception as e:
                    print(f"⚠️  Error on statement {executed_count}: {str(e)[:100]}...")

        print(f"✅ Successfully executed {executed_count} SQL statements")

        # Check results
        cursor.execute("SELECT COUNT(*) FROM courses WHERE course_code LIKE 'csc%'")
        course_count = cursor.fetchone()[0]
        print(f"📊 Total CS courses in database: {course_count}")

        cursor.execute("SELECT department_name, COUNT(*) FROM academic_departments d LEFT JOIN courses c ON d.id = c.department_id GROUP BY d.id, d.department_name")
        print("\n📈 Department Summary:")
        for dept_name, count in cursor.fetchall():
            print(f"  • {dept_name}: {count} courses")

        conn.close()

        print("\n🎉 Computer Science course import completed successfully!")

    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    run_sql_file()
