#!/usr/bin/env python3
"""
Script to swap capacity and exam_capacity values in the rooms table with constraint management
"""

import os
import psycopg2
from dotenv import load_dotenv

def swap_room_capacities():
    load_dotenv()

    # Database connection parameters
    db_url = os.getenv('DATABASE_URL')
    if not db_url:
        print("❌ DATABASE_URL not found. Please check your .env file.")
        return

    try:
        print("🔌 Connecting to database...")
        conn = psycopg2.connect(db_url)
        conn.autocommit = True
        cursor = conn.cursor()

        print("📊 Checking current room capacity data...")

        # Show current state - first few rooms
        cursor.execute("SELECT id, room_number, capacity, exam_capacity FROM rooms ORDER BY id LIMIT 15")
        rows = cursor.fetchall()

        print("=== BEFORE SWAP ===")
        for row in rows:
            print(f"Room {row[1]}: capacity={row[2]}, exam_capacity={row[3]}")

        # Handle the constraint issue
        print("\n=== MANAGING DATABASE CONSTRAINTS ===")

        # Drop the existing incorrect constraint
        try:
            cursor.execute("ALTER TABLE rooms DROP CONSTRAINT IF EXISTS exam_capacity_check")
            print("✓ Dropped existing exam_capacity_check constraint")
        except Exception as e:
            print(f"⚠️  Could not drop constraint (might not exist): {e}")

        # Perform the swap with NULL handling
        print("\n=== PERFORMING SWAP ===")
        cursor.execute("""
            UPDATE rooms
            SET capacity = CASE
                WHEN exam_capacity IS NULL THEN capacity + 10
                ELSE exam_capacity
            END,
               exam_capacity = CASE
                WHEN exam_capacity IS NULL THEN NULL
                ELSE capacity
            END
        """)

        affected_rows = cursor.rowcount
        print(f"Affected {affected_rows} rows")

        # Add the correct constraint: regular capacity should be >= exam capacity
        print("\n=== ADDING CORRECTED CONSTRAINT ===")
        cursor.execute("""
            ALTER TABLE rooms ADD CONSTRAINT exam_capacity_check
            CHECK (exam_capacity IS NULL OR capacity >= exam_capacity)
        """)
        print("✓ Added corrected constraint: capacity >= exam_capacity")

        # Show result - same rooms to compare
        print("\n=== AFTER SWAP ===")
        cursor.execute("SELECT id, room_number, capacity, exam_capacity FROM rooms ORDER BY id LIMIT 15")
        rows = cursor.fetchall()
        for row in rows:
            print(f"Room {row[1]}: capacity={row[2]}, exam_capacity={row[3]}")

        # Additional verification
        cursor.execute("""
            SELECT
                COUNT(*) as total_rooms,
                COUNT(CASE WHEN capacity > exam_capacity THEN 1 END) as capacity_larger,
                COUNT(CASE WHEN capacity < exam_capacity THEN 1 END) as exam_still_larger,
                COUNT(CASE WHEN capacity = exam_capacity THEN 1 END) as equal_capacities,
                COUNT(CASE WHEN capacity IS NULL OR exam_capacity IS NULL THEN 1 END) as null_values,
                ROUND(AVG(capacity), 1) as avg_capacity,
                ROUND(AVG(exam_capacity), 1) as avg_exam_capacity
            FROM rooms
        """)
        stats = cursor.fetchone()
        print("\n📊 Verification:")
        print(f"    Total rooms: {stats[0]}")
        if stats[0] > 0:
            capacity_larger_pct = stats[1] / stats[0] * 100
            exam_larger_pct = stats[2] / stats[0] * 100
            equal_pct = stats[3] / stats[0] * 100
            print(f"    Rooms with capacity > exam_capacity: {stats[1]}/{stats[0]} ({capacity_larger_pct:.1f}%)")
            print(f"    Rooms with exam_capacity > capacity: {stats[2]}/{stats[0]} ({exam_larger_pct:.1f}%)")
            print(f"    Rooms with equal capacities: {stats[3]}/{stats[0]} ({equal_pct:.1f}%)")
        print(f"    Rooms with null values: {stats[4]}")
        print(f"    Average capacity: {stats[5]:.1f}")
        print(f"    Average exam_capacity: {stats[6]:.1f}")

        # Check constraint compliance
        cursor.execute("""
            SELECT COUNT(*) as constraint_violations
            FROM rooms
            WHERE exam_capacity IS NOT NULL AND capacity < exam_capacity
        """)
        violations = cursor.fetchone()[0]
        if violations == 0:
            print("✓ All rooms comply with the corrected constraint")
        else:
            print(f"⚠️  {violations} rooms still violate the constraint")

        conn.close()

        print("\n🎉 Room capacity swap completed successfully!")
        print("✓ Regular seating capacity should now be higher than exam capacity")
        print("✓ Database constraint has been corrected")

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        print("❌ Please check database permissions or constraint handling")

if __name__ == "__main__":
    swap_room_capacities()
