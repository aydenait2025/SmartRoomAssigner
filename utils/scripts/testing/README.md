# 🧪 Testing Scripts

Scripts in this directory validate the functionality and integration of the SmartRoomAssigner system.

## Available Scripts

### `simple_test.py`
**Purpose**: Basic validation of core system functionality.

**Tests Performed**:
- API connectivity and response validation
- Authentication endpoints
- Basic CRUD operations for students/rooms/schedules
- Data import/export validation

**Usage**:
```bash
cd /path/to/SmartRoomAssigner
python utils/scripts/testing/simple_test.py
```

### `test_comprehensive.py`
**Purpose**: End-to-end system testing with detailed validation.

**Tests Performed**:
- Full user workflows (login to assignment)
- Data integrity and validation
- Performance testing
- Edge case handling
- Integration between frontend and backend

**Usage**:
```bash
cd /path/to/SmartRoomAssigner
python utils/scripts/testing/test_comprehensive.py
```

### `test_import.py`
**Purpose**: Validate data import and export functionality.

**Tests Performed**:
- CSV file format validation
- Data transformation accuracy
- Import/export round-trip testing
- Error handling for invalid data

**Usage**:
```bash
cd /path/to/SmartRoomAssigner
python utils/scripts/testing/test_import.py
```

## Running Tests

All tests should be run with the SmartRoomAssigner backend running locally.

**Prerequisites**:
```bash
# Start the backend first
docker-compose up backend db

# Then run tests in separate terminal
cd /path/to/SmartRoomAssigner
python utils/scripts/testing/[script_name].py
```

## Test Output

Each script provides:
- **Pass/Fail indicators** for each test case
- **Detailed error messages** for failures
- **Performance metrics** where applicable
- **Suggested fixes** for validation failures

---

*Note: Run comprehensive tests regularly during development to ensure system stability.*
