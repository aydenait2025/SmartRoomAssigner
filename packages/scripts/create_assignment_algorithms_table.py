#!/usr/bin/env python3
"""
Script to create or recreate the assignment_algorithms table to match the AssignmentAlgorithm model
"""
import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

def create_assignment_algorithms_table():
    """Create the assignment_algorithms table using direct SQL"""

    # Get database connection details
    db_url = os.getenv('DATABASE_URL')
    if not db_url:
        # Extract from individual environment variables (as shown in app.py)
        db_host = os.getenv('DB_HOST', 'ep-cool-boat-a4gkok47.us-east-1.aws.neon.tech')
        db_name = os.getenv('DB_NAME', 'neondb')
        db_user = os.getenv('DB_USER', 'neondb_owner')
        db_password = os.getenv('DB_PASSWORD', 'something_secret')
        db_sslmode = os.getenv('DB_SSLMODE', 'require')

        # Construct connection string
        db_url = f"postgresql://{db_user}:{db_password}@{db_host}/{db_name}?sslmode={db_sslmode}"

    print(f"Connecting to database...")

    conn = None
    try:
        # Connect to the database
        conn = psycopg2.connect(db_url)
        conn.autocommit = True  # Enable auto-commit for DDL statements

        with conn.cursor() as cursor:
            # Drop the table if it exists
            print("Dropping existing assignment_algorithms table...")
            cursor.execute("DROP TABLE IF EXISTS assignment_algorithms CASCADE")

            # Create the new assignment_algorithms table with the correct schema
            print("Creating new assignment_algorithms table...")
            cursor.execute("""
                CREATE TABLE assignment_algorithms (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(100) NOT NULL UNIQUE,
                    description TEXT NOT NULL,
                    version VARCHAR(20) DEFAULT '1.0',
                    algorithm_logic TEXT NOT NULL,
                    is_active BOOLEAN DEFAULT TRUE,
                    created_by INTEGER NOT NULL REFERENCES users(id),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)

            # Add indexes for performance
            print("Adding indexes...")
            cursor.execute("CREATE INDEX idx_assignment_algorithms_active ON assignment_algorithms(is_active)")
            cursor.execute("CREATE INDEX idx_assignment_algorithms_created_by ON assignment_algorithms(created_by)")

            # Basic permissions - grant to public for now (simplified)
            # In production, this would be more restrictive

            # Insert default algorithms
            print("Inserting default algorithms...")
            cursor.execute("""
                INSERT INTO assignment_algorithms (name, description, algorithm_logic, created_by, is_active) VALUES
                (
                    'Smart Alphabetical Grouping',
                    'Advanced algorithm that groups students alphabetically. A-K in first room, L-S in second, etc.',
                    '{"type": "alphabetical_grouping", "rules": ["alphabetical_sorting", "group_by_last_name", "maintain_name_clusters", "multi_room_distribution"]}',
                    1,
                    TRUE
                ),
                (
                    'Simple Round Robin',
                    'Basic round-robin assignment. Students assigned sequentially to available rooms.',
                    '{"type": "round_robin", "rules": ["single_assignment_per_room", "ignore_alphabetical_order"]}',
                    1,
                    FALSE
                ),
                (
                    'Capacity Optimized',
                    'Focuses on maximizing room utilization while respecting capacity limits.',
                    '{"type": "capacity_optimization", "rules": ["maximize_utilization", "respect_capacity_limits", "balance_load"]}',
                    1,
                    FALSE
                ),
                (
                    'Department-based Grouping',
                    'Groups students by academic department before alphabetical sorting.',
                    '{"type": "department_grouping", "rules": ["group_by_department", "alphabetical_within_departments", "department_segregation"]}',
                    1,
                    FALSE
                )
            """)

            # Verify the table was created correctly
            print("Verifying table creation...")
            cursor.execute("""
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns
                WHERE table_name = 'assignment_algorithms'
                ORDER BY ordinal_position
            """)

            columns = cursor.fetchall()
            print("\n📋 assignment_algorithms table columns:")
            for col in columns:
                nullable = "NULL" if col[2] == 'YES' else "NOT NULL"
                print(f"  - {col[0]} ({col[1]}) {nullable}")

            # Check inserted data
            cursor.execute("SELECT COUNT(*) FROM assignment_algorithms")
            count = cursor.fetchone()[0]
            print(f"\n📊 Inserted {count} default algorithms")

            print("\n✅ assignment_algorithms table fixed successfully!")

    except Exception as e:
        print(f"❌ Error: {e}")
        if conn:
            conn.rollback()
        return False

    finally:
        if conn:
            conn.close()

    return True

if __name__ == "__main__":
    success = create_assignment_algorithms_table()
    if success:
        print("\n🎯 assignment_algorithms table fix complete!")
    else:
        print("\n❌ assignment_algorithms table fix failed!")
