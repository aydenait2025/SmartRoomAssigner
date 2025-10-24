#!/usr/bin/env python3
"""
Script to add University of Toronto buildings to the buildings table.
This uses the enterprise schema fields for the buildings table.
"""

import sys
import os
from math import floor

# Add backend directory to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app.config import config
from flask import Flask
from flask_sqlalchemy import SQLAlchemy

# UofT Building data (building_code, building_name)
uoft_buildings_data = """AB,Astronomy and Astrophysics
AP,Anthropology Building
BA,Bahen Centre Information Tech
BF,Bancroft Building
BL,Claude T. Bissell Building
EP,Stewart Building
ES,Earth Sciences Centre
EX,Exam Centre
FE,Bloor Street West-371
GB,Galbraith Building
HA,Haultain Building
HS,Health Sciences Building
IN,Innis College
KP,Koffler House
MB,Lassonde Mining Building
MC,Mechanical Engineering Bldg
MP,McLennan Physical Laboratories
MS,Medical Sciences Building
MY,Myhal Centre MCEIE
NL,C David Naylor Building
OI,O.I.S.E.
PB,Leslie Dan Pharmacy Building
RL,Robarts Library Building
RU,Rehabilitation Sciences Bdg
RW,Ramsay Wright Laboratories
SF,Sandford Fleming Building
SK,"Social Work, Faculty of"
SS,Sidney Smith Hall
SU,Student Commons
TC,Trinity College
UC,University College
WB,Wallberg Building
WE,Wetmore Hall-New College
WI,Wilson Hall-New College
WO,Woodsworth College Residence
WW,Woodsworth College"""

def get_building_type(building_name, building_code):
    """Categorize building type based on name and code"""
    name_lower = building_name.lower()
    code_upper = building_code.upper()

    # Libraries
    if 'library' in name_lower or 'robarts' in name_lower:
        return 'library'

    # Residences
    if ('college' in name_lower and 'residence' not in name_lower) or \
       'hall' in name_lower or building_code.startswith(('WO', 'WW')) or \
       'residence' in name_lower:
        return 'residence'

    # Academic buildings
    if any(keyword in name_lower for keyword in ['centre', 'building', 'hall', 'house']):
        return 'academic'

    # Labs and research
    if any(keyword in name_lower for keyword in ['laboratories', 'labs', 'research', 'centre']):
        return 'laboratory'

    # Default to academic
    return 'academic'

def get_building_coordinates(building_code):
    """Return approximate GPS coordinates for UofT buildings"""
    # University of Toronto main campus approximate bounds
    # Center point around: 43.6629°N, 79.3957°W

    base_lat = 43.6629
    base_lon = -79.3957

    # Add small random variations to spread buildings out
    # This gives each building a slightly different location
    code_hash = sum(ord(c) for c in building_code.upper())
    lat_offset = (code_hash % 100 - 50) * 0.0001  # ±0.005 degrees (~500m)
    lon_offset = (code_hash % 80 - 40) * 0.0001   # ±0.004 degrees

    return base_lat + lat_offset, base_lon + lon_offset

def main():
    """Add UofT buildings to the database"""

    # Initialize Flask app
    app = Flask(__name__)
    app.config.from_object(config['development'])
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db = SQLAlchemy(app)

    with app.app_context():
        try:
            # Define the Building model inline with the same fields
            class Building(db.Model):
                """Enterprise-grade Building model mapping to 'buildings' table"""
                __tablename__ = 'buildings'

                id = db.Column(db.Integer, primary_key=True)
                building_code = db.Column(db.String(10), unique=True, nullable=False)
                building_name = db.Column(db.String(200), nullable=False)
                campus = db.Column(db.String(50))
                full_address = db.Column(db.Text)
                latitude = db.Column(db.Float)
                longitude = db.Column(db.Float)
                building_type = db.Column(db.String(50))
                year_constructed = db.Column(db.Integer)
                total_floors = db.Column(db.Integer)
                accessible_entrances = db.Column(db.Text)
                emergency_exits = db.Column(db.Text)
                fire_systems_installation = db.Column(db.Date)
                last_inspection_date = db.Column(db.Date)
                inspection_frequency_months = db.Column(db.Integer, default=12)
                next_inspection_date = db.Column(db.Date)
                capacity_override = db.Column(db.Integer)
                accessibility_rating = db.Column(db.Integer)
                maintenance_priority = db.Column(db.String(10), default='normal')
                emergency_contact_name = db.Column(db.String(150))
                emergency_contact_phone = db.Column(db.String(20))
                is_active = db.Column(db.Boolean, default=True)
                created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
                updated_at = db.Column(db.DateTime, default=db.func.current_timestamp())

            # Clear existing buildings (optional - comment out if you want to keep existing data)
            # db.session.query(Building).delete()  # Uncomment to clear existing

            buildings_added = 0
            buildings_skipped = 0

            # Parse the building data
            lines = uoft_buildings_data.strip().split('\n')

            for line in lines:
                if not line.strip():
                    continue

                # Parse CSV line, handling quoted names
                if line.startswith('"') and '",' in line:
                    # Handle quoted names like "Social Work, Faculty of"
                    parts = line.split('","')
                    building_code = parts[0].strip('"')
                    building_name = parts[1].strip('"')
                else:
                    parts = line.split(',')
                    if len(parts) >= 2:
                        building_code = parts[0].strip()
                        building_name = parts[1].strip()
                    else:
                        print(f"⚠️ Skipping malformed line: {line}")
                        continue

                # Check if building already exists
                existing = Building.query.filter_by(building_code=building_code).first()
                if existing:
                    buildings_skipped += 1
                    continue

                # Get building type and coordinates
                building_type = get_building_type(building_name, building_code)
                latitude, longitude = get_building_coordinates(building_code)

                # Create building record with enterprise fields
                building = Building(
                    building_code=building_code,
                    building_name=building_name,
                    campus='Main Campus',
                    full_address=f'University of Toronto - {building_name}',
                    latitude=latitude,
                    longitude=longitude,
                    building_type=building_type,
                    year_constructed=2020,  # Default year, buildings built/renovated around 2020
                    total_floors=4,  # Default 4 floors, varies by building
                    accessible_entrances='{main_entrance,side_entrance}',
                    emergency_exits='{floor_1_main,floor_2_rear}',
                    fire_systems_installation='2020-01-01',
                    last_inspection_date='2024-01-01',
                    inspection_frequency_months=12,
                    next_inspection_date='2025-01-01',
                    accessibility_rating=4,  # Most UofT buildings are accessible
                    maintenance_priority='normal',
                    emergency_contact_name='UofT Facilities Management',
                    emergency_contact_phone='(416) 978-4444',
                    is_active=True
                )

                # Add to session
                db.session.add(building)
                buildings_added += 1

                print(f"✅ Added building: {building_code} - {building_name}")

            # Commit all changes
            db.session.commit()

            print("\n" + "="*50)
            print("UofT BUILDINGS IMPORT COMPLETE")
            print(f"✅ Buildings added: {buildings_added}")
            print(f"⏭️  Buildings skipped (already exist): {buildings_skipped}")
            print(f"📊 Total buildings in database: {Building.query.count()}")
            print("="*50)

        except Exception as e:
            db.session.rollback()
            print(f"❌ Error adding buildings: {e}")
            import traceback
            traceback.print_exc()
            return 1

    return 0

if __name__ == '__main__':
    sys.exit(main())
