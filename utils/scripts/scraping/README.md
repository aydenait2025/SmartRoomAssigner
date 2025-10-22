# 🌐 Web Scraping Scripts

Scripts in this directory collect building and room information from external data sources (university websites, APIs, etc.).

## Available Scripts

### `scrape_buildings.py`
**Purpose**: Collect building information from university websites and directories.

**Data Collected**:
- Building names and formal titles
- Building codes/identifiers (e.g., "BA", "MP", "UC")
- Physical addresses and locations
- Building types (academic, residential, administrative)
- Geographic coordinates when available

**Usage**:
```bash
cd /path/to/SmartRoomAssigner
python utils/scripts/scraping/scrape_buildings.py
```

**Output**: CSV file with building data ready for import into SmartRoomAssigner.

### `scrape_rooms.py`
**Purpose**: Collect room information and details for existing buildings.

**Data Collected**:
- Room numbers and identifiers
- Room capacities (seating counts)
- Room types (lecture hall, classroom, lab, etc.)
- Room features (projectors, whiteboards, computers)
- Accessibility information
- Floor numbers and building associations

**Usage**:
```bash
cd /path/to/SmartRoomAssigner
python utils/scripts/scraping/scrape_rooms.py
```

**Output**: CSV file with room inventory data.

## Ethical Guidelines

### Rate Limiting
- Respect website rate limits and terms of service
- Include appropriate delays between requests
- Avoid overloading target servers

### Data Usage
- Only collect publicly available information
- Verify data accuracy and currency
- Document data collection dates and methods

### Legal Compliance
- Check for robots.txt files
- Adhere to website terms of service
- Include appropriate user-agent identification

## Data Format Standards

All scripts output CSV files with standardized headers:

**Buildings CSV**:
```csv
building_code,building_name,street_address,city,building_type,latitude,longitude
```

**Rooms CSV**:
```csv
building_code,room_number,capacity,room_type,floor_number,has_projector,accessibility_notes
```

---

*⚠️ Note: Always verify website terms and conditions before running scraping scripts. Update scripts regularly as websites change.*
