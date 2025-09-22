#!/usr/bin/env python3
import pandas as pd
import io

# Test the CSV parsing logic from the updated import function
def test_csv_parsing():
    csv_data = """AB,Astronomy and Astrophysics
AP,Anthropology Building
BA,Bahen Centre Information Tech
BF,Bancroft Building
BL,Claude T. Bissell Building
EP,Stewart Building
ES,Earth Sciences Centre
EX,Exam Centre"""

    # Test the parsing logic
    df = pd.read_csv(io.StringIO(csv_data), sep=',', on_bad_lines='skip')

    print("CSV DataFrame:")
    print(df)
    print(f"\nColumns: {list(df.columns)}")
    print(f"Number of rows: {len(df)}")

    # Check if we have building codes (2-3 character codes) or just building names
    has_building_codes = False
    if len(df.columns) >= 2:
        # Check if first column looks like building codes (2-3 characters, alphanumeric)
        first_col = df.columns[0].strip()
        sample_values = df.iloc[:3, 0].astype(str).str.strip()
        if all(len(val) <= 3 and val.replace(' ', '').isalnum() for val in sample_values if val):
            has_building_codes = True

    print(f"\nDetected format: {'Building codes + names' if has_building_codes else 'Building names only'}")

    # Process the data
    buildings_to_create = []
    for index, row in df.iterrows():
        if has_building_codes:
            # Format: Code and Building Name
            building_code = str(row.iloc[0]).strip()
            building_full_name = str(row.iloc[1]).strip()
            building_name = f"{building_code} - {building_full_name}"
        else:
            # Format: Just Building Name (original logic)
            building_full_name = str(row.iloc[0]).strip()
            words = building_full_name.split()
            building_code = "".join([word[0].upper() for word in words if word]).strip()
            if not building_code:
                building_code = building_full_name[:3].upper() if len(building_full_name) >= 3 else building_full_name.upper()
            building_name = f"{building_code} - {building_full_name}"

        buildings_to_create.append({
            "code": building_code,
            "full_name": building_full_name,
            "building_name": building_name
        })

    print("\nBuildings to create:")
    for building in buildings_to_create:
        print(f"  - {building['building_name']}")

    return buildings_to_create

if __name__ == "__main__":
    test_csv_parsing()
