import os
import sys
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

# Load environment variables
load_dotenv()

# Database configuration - try to get from .env file
db_uri = None

# Read from .env file directly since we're in the backend directory
try:
    with open('.env', 'r') as f:
        for line in f:
            if line.startswith('DATABASE_URL=') or line.startswith('SQLALCHEMY_DATABASE_URI='):
                db_uri = line.split('=', 1)[1].strip().strip("'\"")
                break
except:
    pass

if not db_uri:
    # Fallback to some common patterns
    db_uri = os.getenv('DATABASE_URL') or os.getenv('SQLALCHEMY_DATABASE_URI') or 'postgresql://smartroomassigner_algk_user:XhuqPdTXMxpmUML52B7ELaMmXq9lLPuY@dpg-ct9odrrv2p9s73b70s10-a/smartroomassigner_algk'

if not db_uri:
    print("No database URI found")
    sys.exit(1)

print(f"Using database: {db_uri.split('@')[1].split('/')[0]}")

# Create engine
engine = create_engine(db_uri)

def check_tables():
    try:
        with engine.connect() as conn:
            print("=== TABLES IN DATABASE ===")
            result = conn.execute(text("SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename"))
            tables = result.fetchall()
            for table in tables:
                print(f"  {table[0]}")

            print("\n=== RECORD COUNTS ===")
            for table in ['building', 'buildings', 'room']:
                try:
                    result = conn.execute(text(f"SELECT COUNT(*) FROM {table}"))
                    count = result.fetchone()[0]
                    print(f"  {table}: {count} records")
                except:
                    print(f"  {table}: table not found")

            # Check buildings table content
            print("\n=== BUILDINGS TABLE (first 5) ===")
            try:
                result = conn.execute(text("SELECT building_code, building_name FROM buildings LIMIT 5"))
                buildings = result.fetchall()
                for building in buildings:
                    print(f"  {building[0]} - {building[1]}")
            except Exception as e:
                print(f"  Error reading buildings table: {e}")

            # Check building table content (legacy)
            print("\n=== BUILDING TABLE (first 5) ===")
            try:
                result = conn.execute(text("SELECT code, name FROM building LIMIT 5"))
                buildings = result.fetchall()
                for building in buildings:
                    print(f"  {building[0]} - {building[1]}")
            except Exception as e:
                print(f"  Error reading building table: {e}")

            # Check rooms table content
            print("\n=== ROOMS TABLE (first 5) ===")
            try:
                result = conn.execute(text("SELECT building_name, room_number, room_capacity FROM room LIMIT 5"))
                rooms = result.fetchall()
                for room in rooms:
                    print(f"  {room[0]} - {room[1]} (capacity: {room[2]})")
            except Exception as e:
                print(f"  Error reading room table: {e}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_tables()
