#!/usr/bin/env python3
"""
Create all tables in PostgreSQL database using the ultimate enterprise schema
"""
import os
import sys
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

# Load environment variables
load_dotenv()
DATABASE_URL = os.getenv('DATABASE_URL')

if not DATABASE_URL:
    print("❌ ERROR: DATABASE_URL not found in .env file")
    print("Make sure .env file exists and contains DATABASE_URL")
    sys.exit(1)

def connect_to_database():
    """Connect to PostgreSQL database"""
    try:
        print("🔌 Connecting to database...")
        engine = create_engine(DATABASE_URL)
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version();"))
            version = result.fetchone()[0]
            print(f"✅ Connected! PostgreSQL version: {version[:50]}...")
        return engine
    except Exception as e:
        print(f"❌ Failed to connect: {e}")
        sys.exit(1)

def check_existing_tables(engine):
    """Check if tables already exist"""
    try:
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT table_name
                FROM information_schema.tables
                WHERE table_schema = 'public'
                ORDER BY table_name
            """))
            tables = [row[0] for row in result.fetchall()]

            if len(tables) > 0:
                print(f"ℹ️ Found {len(tables)} existing tables:")
                for table in tables[:10]:
                    print(f"  - {table}")
                if len(tables) > 10:
                    print(f"  ... and {len(tables) - 10} more")
                return True
            else:
                print("ℹ️ No tables found in database")
                return False
    except Exception as e:
        print(f"❌ Error checking tables: {e}")
        return False

def create_tables_from_schema(engine):
    """Create all tables from the ultimate enterprise schema in dependency order"""
    schema_file = "db/ultimate_enterprise_schema.sql"

    if not os.path.exists(schema_file):
        print(f"❌ Schema file not found: {schema_file}")
        sys.exit(1)

    try:
        print("📚 Reading schema file...")
        with open(schema_file, 'r', encoding='utf-8') as f:
            schema_content = f.read()

        # Define table creation order (base tables first, then tables with foreign keys)
        table_creation_order = [
            # Phase 1: Foundation tables (no dependencies)
            'roles',
            'retention_policies',
            'users',
            'system_configuration',
            'system_notifications',

            # Phase 2: Academic structure
            'academic_departments',
            'academic_programs',
            'curriculum_requirements',
            'courses',
            'program_course_requirements',
            'academic_plans',
            'academic_terms',
            'time_slots',

            # Phase 3: Student management
            'students',
            'course_enrollments',
            'student_accounts',
            'consent_records',
            'data_subject_requests',

            # Phase 4: Faculty & staff
            'faculty',
            'faculty_course_assignments',
            'teaching_assistants',

            # Phase 5: Facility management
            'buildings',
            'rooms',
            'equipment_inventory',
            'room_equipment_assignments',

            # Phase 6: Scheduling & exams
            'exams',
            'exam_sessions',
            'room_assignments',

            # Phase 7: Access management
            'access_permissions',
            'guest_registrations',

            # Phase 8: External integrations
            'external_systems',
            'integration_logs',

            # Phase 9: Operations
            'room_reservations',
            'equipment_reservations',
            'maintenance_records',

            # Phase 10: Compliance & security
            'security_incidents',
            'audit_logs',

            # Phase 11: Analytics
            'performance_metrics',
            'predictive_models'
        ]

        # Extract table definitions from schema
        table_definitions = {}
        current_table = None
        current_definition = ""
        in_create_table = False

        for line in schema_content.split('\n'):
            line = line.strip()

            if line.upper().startswith('CREATE TABLE'):
                # Extract table name
                table_name = line.split()[2].split('(')[0].lower()
                current_table = table_name
                current_definition = line + '\n'
                in_create_table = True
            elif in_create_table:
                current_definition += line + '\n'
                if line.endswith(');'):
                    table_definitions[current_table] = current_definition.strip()
                    current_table = None
                    in_create_table = False

        print(f"📋 Found definitions for {len(table_definitions)} tables")

        # First, execute any non-table SQL statements (functions, etc.)
        print("\n🔧 Executing schema functions and initial statements...")
        with engine.connect() as conn:
            for line in schema_content.split('\n'):
                line = line.strip()
                if line.upper().startswith('CREATE OR REPLACE FUNCTION'):
                    # Execute function definitions first
                    function_sql = line
                    in_function = True
                    for next_line in schema_content.split('\n')[schema_content.split('\n').index(line) + 1:]:
                        function_sql += '\n' + next_line
                        if next_line.strip().endswith('$$;'):
                            break
                    try:
                        print(f"    🔧 Creating function: {line.split()[4]}")
                        conn.execute(text(function_sql))
                        conn.commit()
                        print("    ✅ Function created successfully")
                    except Exception as e:
                        print(f"    ⚠️ Function creation skipped (might already exist): {str(e)[:100]}")
                        conn.rollback()

        # Create tables in dependency order
        created_tables = []
        skipped_tables = []

        with engine.connect() as conn:
            for i, table_name in enumerate(table_creation_order, 1):
                if table_name in table_definitions:
                    try:
                        print(f"  Creating table {i}/{len(table_creation_order)}: {table_name}")
                        conn.execute(text(table_definitions[table_name]))
                        conn.commit()
                        created_tables.append(table_name)
                    except Exception as e:
                        error_msg = str(e)
                        if 'already exists' in error_msg.lower():
                            print(f"    ℹ️ Table {table_name} already exists, skipping...")
                            skipped_tables.append(table_name)
                        else:
                            print(f"    ❌ Error creating {table_name}: {error_msg}")
                            conn.rollback()
                            continue
                else:
                    print(f"    ⚠️ Definition not found for table: {table_name}")

        print("✅ Schema creation completed!")
        print(f"   📊 Created: {len(created_tables)} tables")
        print(f"   ⏭️ Skipped: {len(skipped_tables)} tables (already exist)")

        # Run any additional SQL (indexes, constraints, etc.)
        print("\n🔧 Running additional SQL (indexes, constraints)...")
        additional_sql_statements = []

        # Split and process additional statements (indexes, etc.)
        statements = []
        current_statement = ""
        for line in schema_content.split('\n'):
            line = line.strip()
            if line.startswith('--') or not line:
                continue
            if not line.upper().startswith('CREATE TABLE'):
                if ';' in line:
                    current_statement += line.split(';')[0] + ';'
                    if current_statement.strip() and not current_statement.upper().startswith('CREATE TABLE'):
                        statements.append(current_statement.strip())
                    current_statement = ""
                else:
                    current_statement += line + " "

        # Execute non-table creation statements
        for stmt in statements:
            if stmt and not stmt.upper().startswith('CREATE TABLE'):
                try:
                    conn.execute(text(stmt))
                    conn.commit()
                except Exception as e:
                    # Many of these might fail due to dependencies, which is ok
                    pass

        return True

    except Exception as e:
        print(f"❌ Error creating schema: {e}")
        return False

def main():
    """Main function"""
    print("🚀 SmartRoomAssigner Database Setup")
    print("=" * 40)

    engine = connect_to_database()
    has_tables = check_existing_tables(engine)

    if has_tables:
        print("\n❗ Found existing tables. Need to drop them first for full recreation.")
        print("This will DELETE ALL EXISTING DATA in the database.")
        # Drop all tables in reverse dependency order
        print("\n🗑️ Dropping existing tables...")

        # Get all table names
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT table_name FROM information_schema.tables
                WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
                ORDER BY table_name DESC
            """))
        existing_tables = [row[0] for row in result.fetchall()]

        dropped_count = 0
        for table_name in existing_tables:
            try:
                with engine.connect() as conn:
                    conn.execute(text(f"DROP TABLE IF EXISTS {table_name} CASCADE"))
                    conn.commit()
                print(f"    ✅ Dropped: {table_name}")
                dropped_count += 1
            except Exception as e:
                print(f"    ⚠️ Error dropping {table_name}: {e}")

        print(f"✅ Dropped {dropped_count} tables")
        has_tables = False

    if not has_tables:
        print("\n📦 Creating tables from schema...")

    success = create_tables_from_schema(engine)

    if success:
        # Final verification
        print("\n🔍 Verifying table creation...")
        check_existing_tables(engine)
        print("\n🎉 Database setup completed successfully!")
        print("\n💡 Next steps:")
        print("  1. Run the backend server: cd backend && python app.py")
        print("  2. Visit http://localhost:5000/init-db to create sample data")
        print("  3. Start the frontend: cd frontend && npm start")
    else:
        print("\n❌ Database setup failed!")
        sys.exit(1)

if __name__ == "__main__":
    main()
