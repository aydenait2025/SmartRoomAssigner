# 🛠️ SmartRoomAssigner Utility Scripts

This directory contains utility scripts for development, testing, and data generation purposes. These scripts are not part of the core application but are useful for development, testing, and data management workflows.

## 📁 Directory Structure

```
utils/scripts/
├── README.md                    # This file - overview of all scripts
├── data-generation/             # Scripts for creating test/mock data
├── testing/                     # Scripts for testing and validation
└── scraping/                    # Scripts for web scraping and data collection
```

## 🎯 Purpose

These scripts serve different development needs:
- **Data generation** scripts create sample data for testing and demos
- **Testing scripts** validate functionality and integration
- **Scraping scripts** collect real-world data for the system

## 📋 Usage Guidelines

### Before Running Scripts
All scripts should be run from the repository root directory:
```bash
cd /path/to/SmartRoomAssigner
python utils/scripts/[category]/[script_name].py
```

### Dependencies
Most scripts require Python 3.8+ and the following packages:
```bash
pip install requests beautifulsoup4 pandas faker
```

---

## 📊 Script Categories

### 1. 📊 Data Generation (`data-generation/`)
**Purpose**: Create mock data for testing, development, and demonstrations

- **`mock_students.py`** - Generates realistic student data with profiles, courses, and academic information
  - **Output**: CSV files with 100-1000+ student records
  - **Usage**: `python utils/scripts/data-generation/mock_students.py`

### 2. 🧪 Testing (`testing/`)
**Purpose**: Validate system functionality, APIs, and integration points

- **`simple_test.py`** - Basic functionality tests for core features
  - **Tests**: Authentication, basic CRUD operations
  - **Output**: Pass/fail results for each test case

- **`test_comprehensive.py`** - Full system integration tests
  - **Tests**: End-to-end workflows, data validation, performance
  - **Output**: Detailed test reports with metrics

- **`test_import.py`** - Data import/export functionality validation
  - **Tests**: CSV import processes, data transformation
  - **Output**: Validation results for different data formats

### 3. 🌐 Web Scraping (`scraping/`)
**Purpose**: Collect real building and room data from external sources

- **`scrape_buildings.py`** - Scrape building information from university websites
  - **Data collected**: Building names, addresses, codes
  - **Output**: Structured building data files

- **`scrape_rooms.py`** - Collect room information for buildings
  - **Data collected**: Room numbers, capacities, types
  - **Output**: Room inventory data for assignment system

---

## 🚀 Development Guidelines

### Adding New Scripts
1. **Choose appropriate category** based on script purpose
2. **Add comprehensive comments** explaining functionality
3. **Include error handling** for robust execution
4. **Update this README** to document the new script
5. **Test with sample data** before committing

### Script Standards
- **Python 3.8+ compatible** - Use modern Python features
- **Error handling** - Use try/except blocks appropriately
- **Logging** - Print meaningful status messages
- **Configuration** - Load settings from environment variables when possible
- **Documentation** - Include docstrings and inline comments

### Data Handling
- **Sensitive data** - Never commit API keys or credentials
- **Large files** - Use `.gitignore` to exclude generated output files
- **Data validation** - Validate input and output data integrity
- **Rate limiting** - Respect website rate limits when scraping

---

## 📈 Common Use Cases

### Testing System Setup
```bash
# Generate test data
python utils/scripts/data-generation/mock_students.py

# Run basic tests
python utils/scripts/testing/simple_test.py

# Validate imports
python utils/scripts/testing/test_import.py
```

### Collecting Real Data
```bash
# Scrape building information
python utils/scripts/scraping/scrape_buildings.py

# Get room details
python utils/scripts/scraping/scrape_rooms.py
```

### Development Workflow
```bash
# Create development data
python utils/scripts/data-generation/mock_students.py

# Run comprehensive tests
python utils/scripts/testing/test_comprehensive.py

# Validate system integration
python utils/scripts/testing/simple_test.py
```

---

## 🔧 Maintenance

### Regular Tasks
- **Update dependencies** when libraries become outdated
- **Review and update** scraping scripts for website changes
- **Expand test coverage** as new features are added
- **Archive old scripts** rather than deleting (move to `archive/`)

### Best Practices
- **Version control** - All scripts are committed to Git
- **Permissions** - Scripts should be executable where appropriate
- **Backup data** - Generated CSV files should be backed up for consistency
- **Documentation** - Keep script documentation current

---

## 📞 Support

For questions about utility scripts:
1. **Check this README** for detailed information
2. **Review script comments** for inline documentation
3. **Check Git history** for recent changes and updates
4. **Contact development team** for script-specific questions

---

*🔄 Last updated: December 2025 - organize and maintain scripts as the project evolves.*

---

## 📝 Related Documentation

See also:
- [`../../README.md`](../README.md) - Main project documentation
- [`../../doc/`](../doc/) - Complete system documentation
- [`../README.md`](../README.md) - Top-level utils overview
