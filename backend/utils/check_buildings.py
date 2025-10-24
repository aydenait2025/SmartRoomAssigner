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

def check_buildings():
    try:
        with engine.connect() as conn:
            # Query all buildings count
            result = conn.execute(text("SELECT COUNT(*) FROM building"))
            count = result.fetchone()[0]
            print(f"Total buildings in database: {count}")

            # Get building details - limit to first 50 for readability
            result = conn.execute(text("SELECT code, name FROM building ORDER BY code"))
            buildings = result.fetchall()

            if len(buildings) <= 50:
                print(f"\nAll {len(buildings)} buildings found:")
                for building in buildings:
                    print(f"  {building[0]} - {building[1]}")
            else:
                print(f"\nFirst 50 of {len(buildings)} buildings found:")
                for building in buildings[:50]:
                    print(f"  {building[0]} - {building[1]}")
                print(f"  ... and {len(buildings) - 50} more buildings")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_buildings()
