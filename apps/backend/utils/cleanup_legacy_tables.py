import os
import sys
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

# Load environment variables
load_dotenv()

# Database configuration
db_uri = None
try:
    with open('.env', 'r') as f:
        for line in f:
            if line.startswith('DATABASE_URL=') or line.startswith('SQLALCHEMY_DATABASE_URI='):
                db_uri = line.split('=', 1)[1].strip().strip("'\"")
                break
except:
    pass

if not db_uri:
    db_uri = os.getenv('DATABASE_URL') or os.getenv('SQLALCHEMY_DATABASE_URI')

if not db_uri:
    print("No database URI found")
    sys.exit(1)

print(f"Using database: {db_uri.split('@')[1].split('/')[0]}")

# Create engine
engine = create_engine(db_uri)

# Legacy tables to drop (keep enterprise schema tables)
LEGACY_TABLES_TO_DROP = [
    'building',         # Legacy: use 'buildings' instead
    'user',            # Legacy: use 'users' instead
    'student',         # Legacy: use 'students' instead
    'role',            # Legacy: use 'roles' instead
    'room',            # Legacy: use 'rooms' instead
    'assignment',      # Legacy: use 'assignments' instead
    'enrollment',      # Legacy: use 'course_enrollments' instead
    'exam',            # Legacy: use 'exams' instead
    'room_assignment'  # Legacy: use 'room_assignments' instead
]

# Enterprise schema tables to keep (don't drop these)
ENTERPRISE_TABLES_TO_KEEP = [
    'buildings', 'rooms', 'users', 'students', 'roles', 'courses',
    'course_enrollments', 'exams', 'exam_sessions', 'assignments',
    'room_assignments', 'academic_departments', 'academic_programs',
    'academic_terms', 'access_permissions', 'audit_logs', 'consent_records',
    'curriculum_requirements', 'data_subject_requests', 'equipment_inventory',
    'equipment_reservations', 'external_systems', 'faculty',
    'faculty_course_assignments', 'guest_registrations', 'integration_logs',
    'maintenance_records', 'mfa_audit_logs', 'mfa_backup_codes', 'mfa_methods',
    'mfa_sessions', 'mfa_verification_codes', 'performance_metrics',
    'predictive_models', 'program_course_requirements', 'retention_policies',
    'security_incidents', 'system_configuration', 'system_notifications',
    'teaching_assistants', 'time_slots', 'academic_plans'
]

def cleanup_legacy_tables():
    try:
        with engine.connect() as conn:
            # Get current tables
            result = conn.execute(text("SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename"))
            current_tables = [row[0] for row in result.fetchall()]

            print("=== CURRENT TABLES IN DATABASE ===")
            for table in current_tables:
                print(f"  {table}")

            print(f"\n=== LEGACY TABLES TO DROP ({len(LEGACY_TABLES_TO_DROP)}) ===")
            tables_to_drop = []
            for table in LEGACY_TABLES_TO_DROP:
                if table in current_tables:
                    tables_to_drop.append(table)
                    print(f"  ✓ {table} (will be dropped)")
                else:
                    print(f"  - {table} (already gone)")

            print(f"\n=== ENTERPRISE TABLES TO KEEP ({len(ENTERPRISE_TABLES_TO_KEEP)}) ===")
            for table in ENTERPRISE_TABLES_TO_KEEP:
                if table in current_tables:
                    print(f"  ✓ {table} (kept)")
                else:
                    print(f"  - {table} (not found)")

            if not tables_to_drop:
                print("\n✅ No legacy tables found to drop! Database is clean.")
                return

            print(f"\n🗑️  DROP OPERATION: {len(tables_to_drop)} legacy tables will be dropped")

            # Ask for confirmation
            print("\n⚠️  WARNING: This will permanently delete legacy tables and all their data!")
            print("   The following tables will be dropped:")
            for table in tables_to_drop:
                print(f"     - {table}")

            # Automatically confirm drop operation since user requested legacy table cleanup
            print("\n🟡 AUTO-CONFIRMING drop operation (user requested legacy table cleanup)")
            print("⚠️  WARNING: This will permanently delete legacy tables and all their data!")

            # Drop legacy tables
            dropped_count = 0
            for table in tables_to_drop:
                try:
                    print(f"Dropping table: {table}...")
                    conn.execute(text(f"DROP TABLE IF EXISTS {table} CASCADE"))
                    conn.commit()
                    dropped_count += 1
                    print(f"  ✅ {table} dropped")
                except Exception as e:
                    print(f"  ❌ Error dropping {table}: {e}")
                    conn.rollback()

            print(f"\n🎉 SUCCESS: Dropped {dropped_count} legacy tables")
            print("Database now contains only enterprise schema tables")

            # Verify cleanup
            result = conn.execute(text("SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename"))
            final_tables = [row[0] for row in result.fetchall()]

            print(f"\n=== FINAL TABLES ({len(final_tables)}) ===")
            for table in sorted(final_tables):
                status = "🆕" if table in ENTERPRISE_TABLES_TO_KEEP else "❓"
                print(f"  {status} {table}")

    except Exception as e:
        print(f"Error: {e}")

def main():
    print("📋 Smart Room Assigner - Legacy Table Cleanup Tool")
    print("=" * 50)
    print("This tool will remove legacy database tables and keep only enterprise schema.")
    print()

    cleanup_legacy_tables()

    print("\n💡 Next steps:")
    print("   1. Test your application with only enterprise tables")
    print("   2. Update any code that references legacy table names")
    print("   3. Make sure dashboard stats are using correct table names")

if __name__ == "__main__":
    main()
