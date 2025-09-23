# 📊 Data Scraping & Testing Utilities

This directory contains data scraping scripts, testing utilities, and data processing tools for SmartRoomAssigner. These tools help collect building/room data from UofT systems and perform validation/testing operations.

## 📁 Utility Scripts Overview

### **🕷️ Data Scraping Tools**

#### **`scrape_buildings.py`** - Building Data Extraction
**Purpose**: Extracts all available buildings from UofT Location Services Management (LMS)
- **Input**: None (accesses live UofT LMS system)
- **Output**: `../buildings.csv` - Building codes and names without headers
- **Method**: HTTPS access to `https://lsm.utoronto.ca/webapp/`
- **Format**: `CODE,Building Name` (one per line)

**Usage:**
```bash
cd utils
python scrape_buildings.py

# Expected output: "../buildings.csv"
# Format: BA, Bahen Centre for Information Technology
#         BF, Bancroft Building
#         ... (all campus buildings)
```

#### **`scrape_rooms.py`** - Room Capacity Data Collection
**Purpose**: Extracts room capacity data for captured buildings
- **Input**: `../buildings.csv` (building codes)
- **Output**: `../rooms.csv` - Room details with capacities
- **Method**: Automated form navigation through UofT LMS
- **Format**: `Building,Room,Room Capacity,Testing Capacity`

**Usage:**
```bash
cd utils
python scrape_rooms.py

# Requires: ../buildings.csv (run scrape_buildings.py first)
# Output: ../rooms.csv with headers
```

### **🧪 Testing & Validation Scripts**

#### **`test_import.py`** - Data Import Testing
**Purpose**: Validates CSV data import processes
- **Tests**: File existence, format validation, data integrity
- **Coverage**: Building/room CSV structure validation
- **Output**: Pass/fail status with detailed error messages

#### **`test_comprehensive.py`** - System Integration Testing
**Purpose**: End-to-end system validation
- **Tests**: Database connections, data pipelines, API endpoints
- **Coverage**: Full workflow from scraping to database insertion
- **Output**: Detailed test results and performance metrics

#### **`simple_test.py`** - Basic Functionality Testing
**Purpose**: Quick validation of core components
- **Tests**: Basic Python imports, file operations, simple calculations
- **Coverage**: Development environment validation
- **Output**: Simple pass/fail indicators

### **📚 Documentation**

#### **`BUILDING_SCRAPER_README.md`** - Comprehensive Scraping Guide
**Content**:
- Detailed setup instructions
- Authentication procedures
- Troubleshooting common issues
- Rate limiting guidelines
- Data quality validation steps

## 🚀 Quick Start Guide

### **1. Data Collection Pipeline:**
```bash
# Navigate to utils directory
cd utils

# Step 1: Collect all buildings
python scrape_buildings.py

# Step 2: Collect room capacities for all buildings
python scrape_rooms.py

# Verify outputs
ls -la ../*.csv
```

### **2. Validation Pipeline:**
```bash
# Run comprehensive tests
python test_comprehensive.py

# Quick functionality check
python simple_test.py

# Data format validation
python test_import.py
```

### **3. Output Verification:**
Expected files after successful run:
```
buildings.csv    # Building code, name pairs
rooms.csv        # Room capacities and details
```

## 🛠️ Prerequisites

### **System Requirements:**
- Python 3.8+
- Firefox browser (for Selenium)
- `geckodriver` in system PATH

### **Python Dependencies:**
```bash
pip install -r ../backend/requirements.txt
# Key packages: selenium, requests, beautifulsoup4
```

### **Network Access:**
- HTTPS access to `lsm.utoronto.ca`
- No VPN required for public building data
- VPN may be required for restricted room data

## 🔄 Data Pipeline Architecture

```
UofT LMS System → scrape_buildings.py → buildings.csv
                                       ↓
                    scrape_rooms.py ← ← ↓ → rooms.csv
                                       ↓
Database Integration → PostgreSQL → SmartRoomAssigner Tables
```

## 🔐 Security & Compliance

### **Data Handling:**
- All data collection follows UofT acceptable use policies
- No sensitive user data is collected
- Public building/room information only

### **Usage Guidelines:**
- Respect rate limiting (avoid DDoS detection)
- Use only for legitimate academic data collection
- Comply with UofT terms of service

## 📊 Data Quality Assurance

### **Building Data Validation:**
- Automatic duplicate code detection
- Campus/location verification
- Format consistency checking

### **Room Data Quality:**
- Capacity range validation
- Building code cross-referencing
- Missing data detection and reporting

## 🐛 Troubleshooting

### **Common Issues:**

#### **`selenium` cannot connect to Firefox:**
```bash
# Install geckodriver
# Ubuntu/Debian:
sudo apt-get install firefox-geckodriver
# macOS:
brew install geckodriver
# Or download manually from: https://github.com/mozilla/geckodriver/releases
```

#### **"No buildings found":**
- Verify network connectivity to UofT LMS
- Check if system is under maintenance
- Ensure you're not blocked by rate limiting

#### **"Room capacity extraction failed":**
- Page layout may have changed (update XPath selectors)
- Room may not have capacity information listed
- Temporary network issues

#### **Permission errors on CSV files:**
```bash
# Ensure write permissions in project root
chmod 755 ../
chmod 644 ../*.csv
```

## 🔄 Maintenance & Updates

### **Regular Schedule:**
- **Weekly**: Run data collection to detect new buildings/rooms
- **Monthly**: Update scraping logic for LMS changes
- **Quarterly**: Review data quality metrics
- **Annually**: Complete system refresh

### **Version Compatibility:**
- Scripts designed for UofT LMS interface as of 2024
- XPath selectors may need updates if UI changes
- Test thoroughly after LMS system updates

## 🎯 Best Practices

### **Development:**
- Run tests before committing changes
- Document any XPath or selector modifications
- Keep session management clean and secure
- Handle exceptions gracefully

### **Production Use:**
- Schedule runs during off-peak hours
- Monitor for rate limiting
- Backup data before bulk updates
- Log all successful/failed operations

## 📞 Support & Contact

For technical issues with data scraping:
1. Check `BUILDING_SCRAPER_README.md` for detailed guides
2. Run diagnostic tests using `test_comprehensive.py`
3. Review output logs for specific error messages
4. Check network connectivity and UofT LMS status

**Maintainer**: SmartRoomAssigner Development Team
**Security**: Report any authentication issues immediately
