#!/usr/bin/env python3
"""
Script to swap capacity and exam_capacity values in rooms table
"""

import os
import sys
sys.path.append('backend')

# Add backend to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from app import create_app
from flask_sqlalchemy import SQLAlchemy

def swap_room_capacities():
    """Create Flask app context and swap room capacity values"""
    app = create_app()

    with app.app_context():
        db = SQLAlchemy(app)

        # Get current connection
        connection = db.engine.raw_connection()
        cursor = connection.cursor()

        try:
            # Show current state
            print("=== BEFORE SWAP ===")
            cursor.execute("SELECT id, room_number, capacity, exam_capacity FROM rooms LIMIT 5")
            rows = cursor.fetchall()
            for row in rows:
                print(f"Room {row[1]}: capacity={row[2]}, exam_capacity={row[3]}")

            # Perform the swap
            print("\n=== PERFORMING SWAP ===")
            cursor.execute("""
                UPDATE rooms
                SET capacity = exam_capacity,
                    exam_capacity = capacity
            """)

            print(f"Affected {cursor.rowcount} rows")

            # Show result
            print("\n=== AFTER SWAP ===")
            cursor.execute("SELECT id, room_number, capacity, exam_capacity FROM rooms LIMIT 5")
            rows = cursor.fetchall()
            for row in rows:
                print(f"Room {row[1]}: capacity={row[2]}, exam_capacity={row[3]}")

            # Commit the changes
            connection.commit()
            print("\n=== CHANGES COMMITTED ===")

        except Exception as e:
            print(f"Error during swap: {e}")
            connection.rollback()
        finally:
            cursor.close()
            connection.close()

if __name__ == "__main__":
    swap_room_capacities()
    print("Done!")
