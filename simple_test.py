#!/usr/bin/env python3

# Simple test to verify CSV parsing logic without pandas
def test_csv_parsing():
    # Test with space-separated format (your current format)
    print("=== Testing Space-Separated Format ===")
    csv_data_space = """AB Astronomy and Astrophysics
AP Anthropology Building
BA Bahen Centre Information Tech
BF Bancroft Building
BL Claude T. Bissell Building
EP Stewart Building
ES Earth Sciences Centre
EX Exam Centre"""

    lines = csv_data_space.strip().split('\n')
    print("CSV Data:")
    for i, line in enumerate(lines):
        print(f"  Line {i+1}: {line}")

    # Check if we have building codes (2-3 character codes) or just building names
    has_building_codes = False
    if len(lines) > 0:
        # Check first few lines to see if first column looks like building codes
        sample_lines = lines[:3]
        codes_detected = 0
        for line in sample_lines:
            if ' ' in line:
                code = line.split(' ')[0].strip()
                if len(code) <= 3 and code.replace(' ', '').isalnum():
                    codes_detected += 1

        if codes_detected >= 2:  # If at least 2 out of 3 lines have codes
            has_building_codes = True

    print(f"\nDetected format: {'Building codes + names' if has_building_codes else 'Building names only'}")

    # Process the data
    buildings_to_create = []
    for line in lines:
        if ' ' in line:
            parts = line.split(' ', 1)  # Split only on first space
            if has_building_codes:
                # Format: Code and Building Name
                building_code = parts[0].strip()
                building_full_name = parts[1].strip()
                building_name = f"{building_code} - {building_full_name}"
            else:
                # Format: Just Building Name (original logic)
                building_full_name = parts[0].strip()
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
