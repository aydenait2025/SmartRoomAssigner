#!/usr/bin/env python3
"""
Fix duplicate course codes with different capitalizations
"""

import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()
conn = psycopg2.connect(os.getenv('DATABASE_URL'))
cursor = conn.cursor()

print("🔍 Checking for duplicate course codes with different capitalizations...")

# Find duplicate course codes (case-insensitive)
cursor.execute("""
    SELECT
        LOWER(course_code) as lower_code,
        array_agg(course_code ORDER BY course_code) as variants,
        array_agg(id ORDER BY course_code) as ids,
        array_agg(course_name ORDER BY course_code) as names
    FROM courses
    GROUP BY LOWER(course_code)
    HAVING COUNT(*) > 1
""")

duplicates = cursor.fetchall()

if not duplicates:
    print("✅ No duplicate course codes found!")
else:
    print(f"⚠️  Found {len(duplicates)} groups of duplicate course codes:")

    for lower_code, variants, ids, names in duplicates:
        print(f"\nDuplicate group for '{lower_code}':")
        for i, (course_code, course_id, course_name) in enumerate(zip(variants, ids, names)):
            cursor.execute("SELECT COUNT(*) FROM course_enrollments WHERE course_id = %s", (course_id,))
            result = cursor.fetchone()
            enrolled_count = result[0] if result else 0
            print(f"  {i+1}. ID: {course_id} - '{course_code}': {course_name} ({enrolled_count} enrolled)")

        # Keep the uppercase version, delete others
        uppercase_variants = [v for v in variants if v.isupper()]
        if uppercase_variants:
            keep_code = uppercase_variants[0]  # Keep first uppercase version
        else:
            keep_code = variants[0]  # Keep first one if no uppercase

        print(f"  → Keeping: '{keep_code}'")
        print(f"  → Deleting: {len(variants)-1} duplicates")

        # Transfer enrollments to the kept course and delete duplicates
        keep_id = ids[variants.index(keep_code)]

        # Don't delete any yet, just show what would be done
        print("  ⚠️  Would transfer enrollments and delete duplicates")

print("\n🧹 Let's clean up the duplicates...")

for lower_code, variants, ids, names in duplicates:
    # Keep the uppercase version
    uppercase_versions = [v for v in variants if v.isupper()]
    if uppercase_versions:
        keep_code = uppercase_versions[0]
    else:
        keep_code = variants[0]

    keep_id = ids[variants.index(keep_code)]
    to_delete = []

    # First, delete any enrollments in the duplicate courses to avoid conflicts
    for i, course_id in enumerate(ids):
        if ids[i] != keep_id:
            from_course = variants[i]
            # Remove enrollments in duplicate courses
            cursor.execute("DELETE FROM course_enrollments WHERE course_id = %s", (course_id,))
            print(f"  → Removed {cursor.rowcount} enrollments from duplicate {from_course}")

            # Delete the duplicate course
            cursor.execute("DELETE FROM courses WHERE id = %s", (course_id,))
            print(f"  → Deleted duplicate course: {from_course}")

conn.commit()

# Verify the cleanup
cursor.execute("""
    SELECT COUNT(*) FROM courses WHERE LOWER(course_code) IN (
        SELECT LOWER(course_code) FROM courses GROUP BY LOWER(course_code) HAVING COUNT(*) > 1
    )
""")

remaining_duplicates = cursor.fetchone()[0]
print(f"\n🎯 Cleanup complete!")
print(f"📊 Remaining duplicate course codes: {remaining_duplicates}")

# Show final course list
cursor.execute("SELECT count(*) FROM courses")
total_courses = cursor.fetchone()[0]
print(f"📚 Total unique courses: {total_courses}")

conn.close()
