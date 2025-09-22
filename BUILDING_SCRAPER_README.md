# Building Data Scraper

This Python script automatically scrapes building information from the University of Toronto's room booking system and saves it to a CSV file for use with the SmartRoomAssigner application.

## Features

- **Automated Data Collection**: Scrapes building codes and names from UofT's official room booking system
- **Clean Output**: Generates CSV with two columns: Code, Building Name
- **Headless Operation**: Runs without opening browser windows
- **Error Handling**: Robust error handling and logging

## Prerequisites

1. **Python Dependencies**: Install required packages:
   ```bash
   pip install -r backend/requirements.txt
   ```

2. **Firefox Browser**: Install Firefox (required for Selenium)

3. **GeckoDriver**: Download and install GeckoDriver:
   - **Linux**: `sudo apt-get install firefox-geckodriver`
   - **macOS**: `brew install geckodriver`
   - **Windows**: Download from https://github.com/mozilla/geckodriver/releases

## Usage

### Basic Usage

```bash
python scrape_buildings.py
```

This will:
1. Navigate to the UofT room booking system
2. Extract all building codes and names from the dropdown
3. Save them to `buildings.csv` in the project root
4. Display progress in the console

### Output Format

The script generates a CSV file with two columns (no header):
```
AB,Astronomy and Astrophysics
BA,Bahen Centre for Information Technology
BN,Bloor - Dufferin
...
```

### Integration with SmartRoomAssigner

The generated `buildings.csv` file can be directly imported into the Building Management system:

1. Go to Building Management tab in the admin interface
2. Click "📥 Import Buildings"
3. Select the generated `buildings.csv` file
4. The buildings will be automatically imported into the system

## Configuration

### Headless Mode
The script runs in headless mode by default (no browser window). To see the browser:
```python
options.headless = False  # Line 8 in scrape_buildings.py
```

### Output File
To change the output filename:
```python
with open("my_buildings.csv", "w", newline="", encoding="utf-8") as f:  # Line 25
```

## Troubleshooting

### Common Issues

1. **"geckodriver not found"**:
   - Ensure GeckoDriver is installed and in your PATH
   - On Linux: `sudo apt-get install firefox-geckodriver`

2. **"Firefox not found"**:
   - Install Firefox browser
   - On Linux: `sudo apt-get install firefox`

3. **"Permission denied"**:
   - Make sure the script has write permissions for the output file
   - Run: `chmod +x scrape_buildings.py`

4. **"Connection timeout"**:
   - Check your internet connection
   - The UofT website might be temporarily unavailable

### Debug Mode

To see more detailed output, you can modify the script to add debug prints:
```python
print(f"Found {len(building_options)} building options")
for i, option in enumerate(building_options):
    print(f"Option {i}: value='{option.get_attribute('value')}', text='{option.text}'")
```

## File Structure

```
SmartRoomAssigner/
├── scrape_buildings.py          # Main scraping script
├── buildings.csv               # Generated output file
├── backend/
│   └── requirements.txt        # Python dependencies (includes selenium)
└── frontend/
    └── src/components/admin/
        └── BuildingView.js     # Building management interface
```

## Security Note

This script only reads publicly available information from the UofT room booking website. It does not perform any write operations or access any private data.

## Support

If you encounter issues:
1. Check that all prerequisites are installed
2. Verify your internet connection
3. Ensure the UofT website is accessible
4. Check the console output for specific error messages
