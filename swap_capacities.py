#!/usr/bin/env python3
"""
Script to swap capacity and exam_capacity values in the rooms table
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
        cursor.execute("SELECT id, room_number, capacity, exam_capacity FROM rooms ORDER BY id LIMIT 5")
        rows = cursor.fetchall()

        print("=== BEFORE SWAP ===")
        for row in rows:
            print(f"Room {row[1]}: capacity={row[2]}, exam_capacity={row[3]}")

        # Perform the swap
        print("\n=== PERFORMING SWAP ===")
        cursor.execute("""
            UPDATE rooms
            SET capacity = exam_capacity,
                exam_capacity = capacity
        """)

        affected_rows = cursor.rowcount
        print(f"Affected {affected_rows} rows")

        # Show result - same rooms to compare
        print("\n=== AFTER SWAP ===")
        cursor.execute("SELECT id, room_number, capacity, exam_capacity FROM rooms WHERE id IN (SELECT id FROM rooms LIMIT 5 ORDER BY id)")
        rows = cursor.fetchall()
        for row in rows:
            print(f"Room {row[1]}: capacity={row[2]}, exam_capacity={row[3]}")

        # Additional verification
        cursor.execute("""
            SELECT
                COUNT(*) as total_rooms,
                COUNT(CASE WHEN capacity > exam_capacity THEN 1 END) as capacity_larger,
                COUNT(CASE WHEN capacity < exam_capacity THEN 1 END) as exam_larger,
                COUNT(CASE WHEN capacity IS NULL OR exam_capacity IS NULL THEN 1 END) as null_values
            FROM rooms
        """)
        stats = cursor.fetchone()
        print(f"\n📊 Verification: {stats[1]}/{stats[0]} rooms now have capacity > exam_capacity")
        print(f"    {stats[2]}/{stats[0]} rooms have exam_capacity > capacity")
        print(f"    {stats[3]} rooms have null values")

        conn.close()

        print("\n🎉 Room capacity swap completed successfully!")
        print("✓ Regular seating capacity should now be higher than exam capacity")

    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    swap_room_capacities()
