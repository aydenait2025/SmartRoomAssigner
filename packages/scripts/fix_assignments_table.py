#!/usr/bin/env python3
"""
Fix the assignments table by creating it properly
"""
import os
import sys

# Add the backend directory to sys.path so we can import the app
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

def fix_assignments_table():
    """Use Flask context to create the proper assignments table"""
    from app import create_app
    from app.extensions import db

    # Create Flask app with proper context
    app = create_app()

    with app.app_context():
        # Drop the table if it exists
        try:
            db.engine.execute("DROP TABLE IF EXISTS assignments CASCADE")
            print("Dropped existing assignments table")
        except Exception as e:
            print(f"Note: Could not drop table: {e}")

        # Create the table using SQLAlchemy
        from app.models.assignment import Assignment
        Assignment.__table__.create(db.engine, checkfirst=True)

        print("✅ Assignments table created successfully!")
        print("Columns should include: user_id, room_id, exam_id, course, exam_date, etc.")

        # Verify the table exists and has the right columns
        result = db.engine.execute("""
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'assignments'
            ORDER BY ordinal_position
        """).fetchall()

        print("\n📋 Assignments table columns:")
        for row in result:
            nullable = "NULL" if row.is_nullable == 'YES' else "NOT NULL"
            print(f"  - {row.column_name} ({row.data_type}) {nullable}")

if __name__ == "__main__":
    fix_assignments_table()
