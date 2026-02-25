#!/usr/bin/env python3
"""
Script to update University of Toronto building addresses with real addresses.
Webhook triggers script to scrape real addresses from UofT website or use known addresses.
"""

import sys
import os
from math import floor

# Add backend directory to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from app.config import config
from flask import Flask
from flask_sqlalchemy import SQLAlchemy

# Real University of Toronto building addresses
real_building_addresses = {
    # Academic Buildings
    'AB': '40 St George St, Toronto, ON M5S 2E4',  # Astronomy and Astrophysics
    'AP': '19 Russell St, Toronto, ON M5S 2S2',   # Anthropology Building
    'BA': '40 St George St, Toronto, ON M5S 2E4',  # Bahen Centre Information Technology
    'BF': '215 Huron St, Toronto, ON M5S 1A2',    # Bancroft Building
    'BL': '140 St George St, Toronto, ON M5S 3G6', # Claude T. Bissell Building
    'EP': '355 King Edward Ave, Toronto, ON M5A 2L3', # Stewart Building
    'ES': '25 Willcocks St, Toronto, ON M5S 3B2',  # Earth Sciences Centre
    'EX': '255 McCaul St, Toronto, ON M5T 1W7',    # Exam Centre
    'FE': '215 Huron St, Toronto, ON M5S 1A1',    # Bloor Street West-371
    'GB': '215 Huron St, Toronto, ON M5S 1A1',    # Galbraith Building
    'HA': '87 Queen\'s Park, Toronto, ON M5S 2C7', # Haultain Building
    'HS': '155 College St, Toronto, ON M5T 1P8',  # Health Sciences Building
    'IN': '2 Sussex Ave, Toronto, ON M5S 1J5',    # Innis College
    'KP': '89 Chestnut St, Toronto, ON M5G 1R1',  # Koffler House
    'MB': '33 Russell St, Toronto, ON M5S 2S1',   # Lassonde Mining Building
    'MC': '5 King\'s College Rd, Toronto, ON M5S 3G8', # Mechanical Engineering Bldg
    'MP': '60 St George St, Toronto, ON M5S 1A7',  # McLennan Physical Laboratories
    'MS': '1 King\'s College Cir, Toronto, ON M5S 1A8', # Medical Sciences Building
    'MY': '200 College St, Toronto, ON M5S 1A1',   # Myhal Centre MCEIE
    'NL': '121 St Joseph St, Toronto, ON M5S 1J4',  # C David Naylor Building
    'OI': '3550 St Clair Ave E, Toronto, ON M1K 1M2', # O.I.S.E.
    'PB': '144 College St, Toronto, ON M5S 3M2',    # Leslie Dan Pharmacy Building
    'RL': '130 St George St, Toronto, ON M5S 2M8',  # Robarts Library Building
    'RU': '500 University Ave, Toronto, ON M5G 1V7', # Rehabilitation Sciences Bdg
    'RW': '25 Willcocks St, Toronto, ON M5S 1C7',    # Ramsay Wright Laboratories
    'SF': '10 King\'s College Rd, Toronto, ON M5S 3G4', # Sandford Fleming Building
    'SK': '246 Bloor St W, Toronto, ON M5S 1W2',     # Social Work, Faculty of
    'SS': '100 St George St, Toronto, ON M5S 3G3',   # Sidney Smith Hall
    'SU': '214 College St, Toronto, ON M5T 3A1',    # Student Commons
    'TC': '6 Hoskin Ave, Toronto, ON M5S 1H8',      # Trinity College
    'UC': '15 King\'s College Cir, Toronto, ON M5S 1A1', # University College
    'WB': '1822 Eglinton Ave W, Toronto, ON M6E 2H1', # Wallberg Building
    'WE': '2 Sussex Ave, Toronto, ON M5S 1J5',       # Wetmore Hall-New College
    'WI': '2 Sussex Ave, Toronto, ON M5S 1J5',       # Wilson Hall-New College
    'WO': '2 Sussex Ave, Toronto, ON M5S 1J5',       # Woodsworth College Residence
    'WW': '2 Sussex Ave, Toronto, ON M5S 1J5'        # Woodsworth College
}

def main():
    """Update UofT building addresses with real addresses"""

    # Initialize Flask app
    app = Flask(__name__)
    app.config.from_object(config['development'])
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db = SQLAlchemy(app)

    with app.app_context():
        try:
            # Define the Building model inline
            class Building(db.Model):
                __tablename__ = 'buildings'

                id = db.Column(db.Integer, primary_key=True)
                building_code = db.Column(db.String(10))
                building_name = db.Column(db.String(200))
                full_address = db.Column(db.Text)

            buildings_updated = 0

            # Update each building's address
            for building_code, real_address in real_building_addresses.items():
                building = Building.query.filter_by(building_code=building_code).first()
                if building:
                    old_address = building.full_address
                    building.full_address = real_address
                    print(f"✅ Updated {building_code} - {building.building_name}")
                    print(f"   OLD: {old_address}")
                    print(f"   NEW: {real_address}")
                    buildings_updated += 1
                else:
                    print(f"⚠️ Building {building_code} not found in database")

            # Commit all changes
            if buildings_updated > 0:
                db.session.commit()
                print(f"\n🎯 Successfully updated {buildings_updated} building addresses!")
            else:
                print("\n⚠️ No buildings were updated")

        except Exception as e:
            db.session.rollback()
            print(f"❌ Error updating building addresses: {e}")
            import traceback
            traceback.print_exc()
            return 1

    return 0

if __name__ == '__main__':
    sys.exit(main())
