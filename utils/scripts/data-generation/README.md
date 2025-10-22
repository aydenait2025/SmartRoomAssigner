# 📊 Data Generation Scripts

Scripts in this directory generate mock/test data for the SmartRoomAssigner system.

## Available Scripts

### `mock_students.py`
**Purpose**: Generate realistic student data for testing and demonstrations.

**Features**:
- Creates student profiles with realistic names, IDs, and information
- Generates course enrollments and academic data
- Outputs CSV files compatible with the system's import functionality

**Usage**:
```bash
cd /path/to/SmartRoomAssigner
python utils/scripts/data-generation/mock_students.py
```

**Output**:
- `mock_students_XXX.csv` - Generated student data files
- Outputs to the same directory as the script

**Customization**:
- Modify the script to change the number of students generated
- Adjust data patterns to match specific testing requirements

---

*Note: Generated data should not be committed to version control if it's considered sensitive.*
