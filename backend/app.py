import os
from flask import Flask, request, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
import pandas as pd
import io
import csv
import secrets
from math import floor
# from flask_mail import Mail, Message  # Commented out as it's not currently used
import requests
from authlib.integrations.flask_client import OAuth

load_dotenv()

app = Flask(__name__)

# Load configuration from config.py
from backend.app.config import config
app.config.from_object(config['development'])

# Override with environment variables if needed
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', app.config.get('SECRET_KEY', 'a_very_secret_key'))
CORS(app, supports_credentials=True, origins=[
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://142.1.92.247:3000",
    "http://localhost:5000",
    "http://localhost:8080",  # Frontend dev server
    "http://127.0.0.1:3000",  # Alternative localhost
    "http://172.20.0.1:3000",  # Docker bridge network
    "http://172.20.0.1:5000"   # Direct backend access from Docker
]) # Enable CORS for credentials

# Database URI is now configured in config.py
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.session_protection = "strong" # Protect sessions

# OAuth configuration
oauth = OAuth(app)
app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'True').lower() == 'true'
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER')

# mail = Mail(app)  # Commented out as it's not currently used

# Google OAuth
google = oauth.register(
    name='google',
    client_id=os.getenv('GOOGLE_CLIENT_ID'),
    client_secret=os.getenv('GOOGLE_CLIENT_SECRET'),
    server_metadata_url='https://accounts.google.com/.well-known/openid_configuration',
    client_kwargs={'scope': 'openid email profile'}
)

# Microsoft/Outlook OAuth
microsoft = oauth.register(
    name='microsoft',
    client_id=os.getenv('MICROSOFT_CLIENT_ID'),
    client_secret=os.getenv('MICROSOFT_CLIENT_SECRET'),
    server_metadata_url='https://login.microsoftonline.com/common/v2.0/.well-known/openid_configuration',
    client_kwargs={'scope': 'openid email profile'}
)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Database Models
class Role(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)

    def __repr__(self):
        return f"<Role {self.name}>"

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    role_id = db.Column(db.Integer, db.ForeignKey('role.id'), nullable=False)
    role = db.relationship('Role', backref='users')
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    # student_profile = db.relationship('Student', backref='user', uselist=False, lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def is_admin(self):
        return self.role.name == 'admin' if self.role else False

    def __repr__(self):
        return f"<User {self.name} ({self.role.name if self.role else 'no role'})>"

class Student(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    student_number = db.Column(db.String(20), unique=True, nullable=False)
    student_id = db.Column(db.String(100), nullable=False)  # Email/ID
    department = db.Column(db.String(100), nullable=True)
    courses = db.Column(db.Text, nullable=True)  # Comma-separated courses

    enrollments = db.relationship('Enrollment', backref='student', lazy=True)
    room_assignments = db.relationship('RoomAssignment', backref='student', lazy=True)

    def __repr__(self):
        return f"<Student {self.student_number}>"

class Building(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    code = db.Column(db.String(10), unique=True, nullable=False)
    address = db.Column(db.Text)

    rooms = db.relationship('Room', backref='building', lazy=True)

    def __repr__(self):
        return f"<Building {self.code}: {self.name}>"

class Room(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    building_id = db.Column(db.Integer, db.ForeignKey('building.id'), nullable=False)
    room_number = db.Column(db.String(20), nullable=False)
    capacity = db.Column(db.Integer, nullable=False)
    floor = db.Column(db.Integer)
    type = db.Column(db.String(50))

    room_assignments = db.relationship('RoomAssignment', backref='room', lazy=True)

    def __repr__(self):
        return f"<Room {self.building.code if self.building else 'Unknown'}-{self.room_number}>"

class Exam(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    course_name = db.Column(db.String(100))
    course_code = db.Column(db.String(20))
    exam_date = db.Column(db.Date, nullable=False)
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    creator = db.relationship('User', backref='created_exams', lazy=True)

    enrollments = db.relationship('Enrollment', backref='exam', lazy=True)
    room_assignments = db.relationship('RoomAssignment', backref='exam', lazy=True)

    def __repr__(self):
        return f"<Exam {self.course_code} on {self.exam_date}>"

class Enrollment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'), nullable=False)
    exam_id = db.Column(db.Integer, db.ForeignKey('exam.id'), nullable=False)

    def __repr__(self):
        return f"<Enrollment Student: {self.student_id}, Exam: {self.exam_id}>"

class RoomAssignment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    exam_id = db.Column(db.Integer, db.ForeignKey('exam.id'), nullable=False)
    room_id = db.Column(db.Integer, db.ForeignKey('room.id'), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'), nullable=False)
    seat_number = db.Column(db.String(10))

    def __repr__(self):
        return f"<RoomAssignment Student: {self.student_id}, Room: {self.room_id}, Exam: {self.exam_id}>"

# Keep the old Assignment model for backward compatibility
class Assignment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'), unique=True, nullable=False)
    room_id = db.Column(db.Integer, db.ForeignKey('room.id'), nullable=False)
    course = db.Column(db.String(100)) # Optional: if assignments are course-specific
    exam_date = db.Column(db.DateTime) # Optional: if assignments are date-specific

    def __repr__(self):
        return f"<Assignment Student: {self.student_id}, Room: {self.room_id}>"

# Routes
@app.route('/')
def index():
    return "SmartRoomAssign Backend is running!"

@app.route('/init-db')
def init_db_route():
    with app.app_context():
        db.drop_all() # Drop all existing tables
        db.create_all() # Create all tables (including the updated User table)

        # Create roles
        roles_data = [
            Role(name='admin'),
            Role(name='professor'),
            Role(name='ta'),
            Role(name='student')
        ]
        db.session.add_all(roles_data)
        db.session.flush()  # Get IDs for roles

        # Get role IDs
        admin_role = Role.query.filter_by(name='admin').first()
        professor_role = Role.query.filter_by(name='professor').first()
        ta_role = Role.query.filter_by(name='ta').first()
        student_role = Role.query.filter_by(name='student').first()

        # Create sample users with simple passwords for testing
        users_data = [
            User(name='Alice Admin', email='alice@examspace.com', role_id=admin_role.id, password_hash=generate_password_hash('password')),
            User(name='Dr. Bob', email='bob@university.edu', role_id=professor_role.id, password_hash=generate_password_hash('password')),
            User(name='Tom TA', email='tom@university.edu', role_id=ta_role.id, password_hash=generate_password_hash('password')),
            User(name='Student Sara', email='sara@student.edu', role_id=student_role.id, password_hash=generate_password_hash('password'))
        ]
        db.session.add_all(users_data)
        db.session.flush()

        # Create sample student
        student = Student(
            first_name='Student',
            last_name='Sara',
            student_number='S2023001',
            student_id='sara@student.edu',
            department='Computer Science',
            courses='CS301,CHEM101,MATH201'
        )
        db.session.add(student)
        db.session.flush()

        # Create buildings
        buildings_data = [
            Building(name='Main Building', code='MB', address='123 Campus Drive'),
            Building(name='Science Hall', code='SH', address='456 Science Lane')
        ]
        db.session.add_all(buildings_data)
        db.session.flush()

        # Create rooms
        rooms_data = [
            Room(building_id=buildings_data[0].id, room_number='101', capacity=30, floor=1, type='Lecture'),
            Room(building_id=buildings_data[0].id, room_number='102', capacity=25, floor=1, type='Lab'),
            Room(building_id=buildings_data[1].id, room_number='201', capacity=40, floor=2, type='Lecture')
        ]
        db.session.add_all(rooms_data)
        db.session.flush()

        # Create sample exam
        exam = Exam(
            course_name='Introduction to Databases',
            course_code='CS301',
            exam_date='2025-12-10',
            start_time='09:00:00',
            end_time='12:00:00',
            created_by=users_data[1].id  # Dr. Bob
        )
        db.session.add(exam)
        db.session.flush()

        # Create enrollment
        enrollment = Enrollment(student_id=student.id, exam_id=exam.id)
        db.session.add(enrollment)

        # Create room assignment
        room_assignment = RoomAssignment(
            exam_id=exam.id,
            room_id=rooms_data[0].id,
            student_id=student.id,
            seat_number='A1'
        )
        db.session.add(room_assignment)

        db.session.commit()
    return "Database initialized with sample data for all tables!"

@app.route('/seed-buildings')
@login_required
def seed_buildings():
    if current_user.role != 'admin':
        return jsonify({"error": "Unauthorized"}), 403

    # UofT Buildings data - each building will get default rooms
    uoft_buildings = {
        'AB': 'Astronomy and Astrophysics',
        'AP': 'Anthropology Building',
        'BA': 'Bahen Centre Information Tech',
        'BF': 'Bancroft Building',
        'BL': 'Claude T. Bissell Building',
        'EP': 'Stewart Building',
        'ES': 'Earth Sciences Centre',
        'EX': 'Exam Centre',
        'FE': 'Bloor Street West-371'
    }

    with app.app_context():
        rooms_added = 0
        buildings_created = {}

        for code, full_name in uoft_buildings.items():
            building_name = f"{code} - {full_name}"
            address = f"University of Toronto - {building_name}"

            # Check if building already exists
            existing_building = Building.query.filter_by(name=building_name, code=code).first()
            if existing_building:
                continue  # Skip if building exists

            # Create building first
            building = Building(name=building_name, code=code, address=address)
            db.session.add(building)
            db.session.flush()  # Get the building ID

            # Create 3 rooms per building
            buildings_created[building_name] = []
            num_rooms = 3

            for room_num in range(1, num_rooms + 1):
                room_capacity = 30
                testing_capacity = room_capacity * 2

                room = Room(
                    building_id=building.id,
                    room_number=f"{floor(room_num/3)*100 + (room_num % 3) + 1:03d}",
                    capacity=room_capacity,
                    floor=floor(room_num/3) + 1,
                    type='Lecture' if room_num % 2 == 0 else 'Lab'
                )

                buildings_created[building_name].append({
                    "room_number": room.room_number,
                    "capacity": room.capacity,
                    "floor": room.floor,
                    "type": room.type
                })

                db.session.add(room)
                rooms_added += 1

        db.session.commit()

        return jsonify({
            "message": f"Successfully added {len(buildings_created)} buildings with {rooms_added} total rooms",
            "buildings_created": buildings_created
        }), 200

@app.route('/import-buildings', methods=['POST'])
@login_required
def import_buildings():
    if current_user.role != 'admin':
        return jsonify({"error": "Unauthorized"}), 403

    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    if not (file.filename.endswith('.csv') or file.filename.endswith('.txt')):
        return jsonify({"error": "Invalid file type. Please upload a CSV or text file."}), 400

    data = file.read().decode('utf-8')

    try:
        # Try different delimiters: comma, space, tab
        df = None
        for delimiter in [',', ' ', '\t']:
            try:
                test_df = pd.read_csv(io.StringIO(data), sep=delimiter, on_bad_lines='skip')
                if len(test_df.columns) >= 2:
                    df = test_df
                    break
            except:
                continue

        if df is None:
            # Fallback to comma if other delimiters don't work
            df = pd.read_csv(io.StringIO(data), sep=',', on_bad_lines='skip')

        # Check if we have building codes (2-3 character codes) or just building names
        has_building_codes = False
        if len(df.columns) >= 2:
            # Check if first column looks like building codes (2-3 characters, alphanumeric)
            first_col = df.columns[0].strip()
            sample_values = df.iloc[:3, 0].astype(str).str.strip()
            if all(len(val) <= 3 and val.replace(' ', '').isalnum() for val in sample_values if val):
                has_building_codes = True

        # Also check for explicit column names (case-insensitive)
        column_names = [col.strip().lower() for col in df.columns]
        if 'building code' in column_names and 'building name' in column_names:
            has_building_codes = True

        imported_count = 0
        skipped_count = 0
        rooms_added = 0

        with app.app_context():
            for index, row in df.iterrows():
                if has_building_codes:
                    # Format: Code and Building Name
                    building_code = str(row.iloc[0]).strip()
                    building_full_name = str(row.iloc[1]).strip()
                    building_name = f"{building_code} - {building_full_name}"
                else:
                    # Format: Just Building Name (original logic)
                    building_full_name = str(row.iloc[0]).strip()

                    # Generate building code from building_full_name
                    words = building_full_name.split()
                    building_code = "".join([word[0].upper() for word in words if word]).strip()

                    # If the generated code is empty or too short, use a substring or default
                    if not building_code:
                        building_code = building_full_name[:3].upper() if len(building_full_name) >= 3 else building_full_name.upper()

                    # Ensure building_code is not too long for display
                    if len(building_code) > 10:
                        building_code = building_code[:10]

                    building_name = f"{building_code} - {building_full_name}"

                # Check if building already exists
                existing_building = Building.query.filter_by(name=building_name, code=building_code).first()
                if existing_building:
                    skipped_count += 1
                    continue # Skip if building already exists

                # If new building, add it and its default rooms
                num_rooms = 3 # Fixed number of rooms for uploaded buildings
                room_capacity = 30
                testing_capacity = room_capacity * 2

                for room_num in range(1, num_rooms + 1):
                    room = Room(
                        building_id=building.id,
                        room_number=str(room_num).zfill(3),
                        capacity=room_capacity,
                        allowed=True
                    )
                    db.session.add(room)
                    rooms_added += 1
                imported_count += 1
            db.session.commit()

        return jsonify({
            "message": f"Import complete. Added {imported_count} new buildings and {rooms_added} rooms. Skipped {skipped_count} existing buildings.",
            "imported_buildings": imported_count,
            "skipped_buildings": skipped_count,
            "format_detected": "building_codes" if has_building_codes else "building_names_only"
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'student')

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    with app.app_context():
        if User.query.filter_by(email=email).first():
            return jsonify({"error": "Email already exists"}), 409

        # Get role ID
        role_obj = Role.query.filter_by(name=role).first()
        if not role_obj:
            return jsonify({"error": f"Invalid role: {role}"}), 400

        new_user = User(name=email, email=email, role_id=role_obj.id, password_hash=generate_password_hash(password))
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": "User registered successfully"}), 201

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Missing credentials"}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "User not found"}), 401

    if not user.check_password(password):
        return jsonify({"error": "Invalid password"}), 401

    # Flask-Login session
    login_user(user, remember=True)

    # Return what React expects
    return jsonify({
        "user": {
            "id": user.id,
            "email": user.email,
            "role": user.role.name if user.role else None
        },
        "token": "dummy-session-token"
    }), 200

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return jsonify({"message": "Logged out successfully"}), 200

@app.route('/current_user')
@login_required
def get_current_user():
    return jsonify({"id": current_user.id, "username": current_user.email, "role": current_user.role.name if current_user.role else None}), 200

@app.route('/upload-rooms', methods=['POST'])
@login_required
def upload_rooms():
    if not hasattr(current_user, 'role') or current_user.role != 'admin':
        return jsonify({"error": "Unauthorized"}), 403

    if 'file' not in request.files and 'text' not in request.form:
        return jsonify({"error": "No file or text provided"}), 400

    data = None
    if 'file' in request.files:
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400
        if file and (file.filename.endswith('.csv') or file.filename.endswith('.txt')):
            data = file.read().decode('utf-8')
    elif 'text' in request.form:
        data = request.form['text']

    if not data:
        return jsonify({"error": "No data to process"}), 400

    try:
        df = pd.read_csv(io.StringIO(data))

        # Validate columns
        required_cols = ['Building Name', 'Room Number', 'Room Capacity']
        if not all(col in df.columns for col in required_cols):
            return jsonify({"error": f"Missing required columns. Expected: {', '.join(required_cols)}"}), 400

        # Fill missing 'Testing Capacity' with 0
        if 'Testing Capacity' not in df.columns:
            df['Testing Capacity'] = 0
        else:
            df['Testing Capacity'] = df['Testing Capacity'].fillna(0)

        # Fill missing 'Allowed flag' with True
        if 'Allowed flag' not in df.columns:
            df['Allowed flag'] = True
        else:
            df['Allowed flag'] = df['Allowed flag'].fillna(True)

        rooms_to_add = []
        with app.app_context():
            for index, row in df.iterrows():
                # Find or create building first
                building_name = row['Building Name']
                building = Building.query.filter_by(name=building_name).first()
                if not building:
                    # Extract building code from name (e.g., "BA - Bahen Centre" -> "BA")
                    building_code = building_name.split(' - ')[0] if ' - ' in building_name else building_name[:10]
                    building = Building(name=building_name, code=building_code)
                    db.session.add(building)
                    db.session.flush()

                room = Room(
                    building_id=building.id,
                    room_number=row['Room Number'],
                    capacity=row['Room Capacity'],
                    floor=1,  # Default to floor 1
                    type='Lecture'  # Default type
                )
                rooms_to_add.append({
                    "building_name": building.name,
                    "room_number": row['Room Number'],
                    "room_capacity": row['Room Capacity'],
                    "testing_capacity": row['Testing Capacity'],
                    "allowed": True
                })
            db.session.rollback()  # Don't save, just preview

        # For preview, we just return the processed data
        return jsonify(rooms_to_add), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/save-rooms', methods=['POST'])
@login_required
def save_rooms():
    if not hasattr(current_user, 'role') or current_user.role != 'admin':
        return jsonify({"error": "Unauthorized"}), 403

    rooms_data = request.json
    if not rooms_data:
        return jsonify({"error": "No room data provided"}), 400

    try:
        with app.app_context():
            # Clear existing rooms and add new ones
            db.session.query(Room).delete()
            for room_data in rooms_data:
                # Find or create building first
                building = Building.query.filter_by(name=room_data['building_name']).first()
                if not building:
                    # Extract building code from name (e.g., "BA - Bahen Centre" -> "BA")
                    building_code = room_data['building_name'].split(' - ')[0] if ' - ' in room_data['building_name'] else room_data['building_name'][:10]
                    building = Building(name=room_data['building_name'], code=building_code)
                    db.session.add(building)
                    db.session.flush()

                room = Room(
                    building_id=building.id,
                    room_number=room_data['room_number'],
                    capacity=room_data['room_capacity'],
                    floor=1,  # Default to floor 1
                    type='Lecture'  # Default type
                )
                db.session.add(room)
            db.session.commit()
        return jsonify({"message": "Rooms saved successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/upload-students', methods=['POST'])
@login_required
def upload_students():
    if current_user.role != 'admin':
        return jsonify({"error": "Unauthorized"}), 403

    if 'file' not in request.files and 'text' not in request.form:
        return jsonify({"error": "No file or text provided"}), 400

    data = None
    if 'file' in request.files:
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400
        if file and (file.filename.endswith('.csv') or file.filename.endswith('.txt')):
            data = file.read().decode('utf-8')
    elif 'text' in request.form:
        data = request.form['text']

    if not data:
        return jsonify({"error": "No data to process"}), 400

    try:
        df = pd.read_csv(io.StringIO(data))
        
        # Automatically detect "First Name, Last Name, Student Number, Student ID" or "Last Name, First Name, Student Number, Student ID"
        if 'First Name' in df.columns and 'Last Name' in df.columns:
            first_name_col = 'First Name'
            last_name_col = 'Last Name'
        elif 'Last Name' in df.columns and 'First Name' in df.columns: # Redundant check, but good for clarity
            first_name_col = 'First Name'
            last_name_col = 'Last Name'
        else:
            return jsonify({"error": "Missing 'First Name' or 'Last Name' columns"}), 400

        required_cols = [first_name_col, last_name_col, 'Student Number', 'Student ID']
        if not all(col in df.columns for col in required_cols):
            return jsonify({"error": f"Missing required columns. Expected: {', '.join(required_cols)}"}), 400

        students_to_add = []
        for index, row in df.iterrows():
            student = Student(
                first_name=row[first_name_col],
                last_name=row[last_name_col],
                student_number=row['Student Number'],
                student_id=row['Student ID']
            )
            students_to_add.append(student)
        
        # For preview, we just return the processed data
        return jsonify([
            {
                "first_name": s.first_name,
                "last_name": s.last_name,
                "student_number": s.student_number,
                "student_id": s.student_id
            } for s in students_to_add
        ]), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/save-students', methods=['POST'])
@login_required
def save_students():
    if current_user.role != 'admin':
        return jsonify({"error": "Unauthorized"}), 403

    students_data = request.json
    if not students_data:
        return jsonify({"error": "No student data provided"}), 400

    try:
        with app.app_context():
            # Clear existing students and add new ones
            db.session.query(Student).delete()
            for student_data in students_data:
                student = Student(
                    first_name=student_data['first_name'],
                    last_name=student_data['last_name'],
                    student_number=student_data['student_number'],
                    student_id=student_data['student_id']
                )
                db.session.add(student)
            db.session.commit()
        return jsonify({"message": "Students saved successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/students/bulk-import', methods=['POST'])
@login_required
def bulk_import_students():
    if current_user.role != 'admin':
        return jsonify({"error": "Unauthorized"}), 403

    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    if not file.filename.endswith('.csv'):
        return jsonify({"error": "Invalid file type. Please upload a CSV file."}), 400

    data = file.read().decode('utf-8')

    try:
        df = pd.read_csv(io.StringIO(data))

        # Validate required columns (our CSV has: first_name,last_name,student_number,student_id,department,courses)
        required_cols = ['first_name', 'last_name', 'student_number', 'student_id']
        if not all(col in df.columns for col in required_cols):
            return jsonify({"error": f"Missing required columns. Expected: {', '.join(required_cols)}"}), 400

        success_count = 0
        error_count = 0
        error_details = []

        with app.app_context():
            for index, row in df.iterrows():
                try:
                    # Extract data from CSV row
                    first_name = str(row.get('first_name', '')).strip()
                    last_name = str(row.get('last_name', '')).strip()
                    student_number = str(row.get('student_number', '')).strip()
                    student_id = str(row.get('student_id', '')).strip()
                    department = str(row.get('department', '')).strip() if 'department' in df.columns else None
                    courses = str(row.get('courses', '')).strip() if 'courses' in df.columns else None

                    # Validate required fields
                    if not all([first_name, last_name, student_number, student_id]):
                        error_count += 1
                        error_details.append({
                            "row": index + 2,  # +2 for 1-indexed + header row
                            "message": "Missing required fields (first_name, last_name, student_number, student_id)"
                        })
                        continue

                    # Check for duplicate student_number
                    existing_student = Student.query.filter_by(student_number=student_number).first()
                    if existing_student:
                        error_count += 1
                        error_details.append({
                            "row": index + 2,
                            "message": f"Student number '{student_number}' already exists"
                        })
                        continue

                    # Create new student
                    student = Student(
                        first_name=first_name,
                        last_name=last_name,
                        student_number=student_number,
                        student_id=student_id,
                        department=department,
                        courses=courses
                    )

                    db.session.add(student)
                    success_count += 1

                except Exception as e:
                    error_count += 1
                    error_details.append({
                        "row": index + 2,
                        "message": str(e)
                    })
                    continue

            db.session.commit()

        return jsonify({
            "success": success_count,
            "errors": error_count,
            "error_details": error_details[:10]  # Limit error details to first 10
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e), "success": 0, "errors": 0}), 400

@app.route('/assign-students', methods=['POST'])
@login_required
def assign_students():
    if current_user.role != 'admin':
        return jsonify({"error": "Unauthorized"}), 403

    try:
        with app.app_context():
            students = Student.query.order_by(Student.last_name.asc()).all()
            rooms = Room.query.filter_by(allowed=True).order_by(Room.building_name.asc(), Room.room_number.asc()).all()

            # Clear existing assignments
            db.session.query(Assignment).delete()
            db.session.commit()

            room_capacities = {room.id: room.testing_capacity if room.testing_capacity > 0 else room.room_capacity for room in rooms}
            room_assignments = {room.id: [] for room in rooms}
            unassigned_students = []

            for student in students:
                assigned = False
                for room in rooms:
                    if len(room_assignments[room.id]) < room_capacities[room.id]:
                        assignment = Assignment(student_id=student.id, room_id=room.id)
                        db.session.add(assignment)
                        room_assignments[room.id].append(student.id)
                        assigned = True
                        break
                if not assigned:
                    unassigned_students.append(student)
            
            db.session.commit()

            # Prepare results for response
            results = []
            for room in rooms:
                assigned_students_in_room = [Student.query.get(s_id) for s_id in room_assignments[room.id]]
                results.append({
                    "room_id": room.id,
                    "building_name": room.building_name,
                    "room_number": room.room_number,
                    "assigned_students": [
                        {"first_name": s.first_name, "last_name": s.last_name, "student_id": s.student_id}
                        for s in assigned_students_in_room
                    ],
                    "remaining_capacity": room_capacities[room.id] - len(assigned_students_in_room)
                })
            
            unassigned_students_data = [
                {"first_name": s.first_name, "last_name": s.last_name, "student_id": s.student_id}
                for s in unassigned_students
            ]

            return jsonify({
                "assignments": results,
                "unassigned_students": unassigned_students_data,
                "message": "Students assigned successfully"
            }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/student-assignment', methods=['GET'])
@login_required
def student_assignment():
    if current_user.role != 'student':
        return jsonify({"error": "Unauthorized"}), 403
    
    with app.app_context():
        student_profile = Student.query.filter_by(user_id=current_user.id).first()
        if not student_profile:
            return jsonify({"error": "Student profile not found"}), 404
        
        assignment = Assignment.query.filter_by(student_id=student_profile.id).first()
        if not assignment:
            return jsonify({"message": "No assignment found for this student"}), 200
        
        room = Room.query.get(assignment.room_id)
        
        return jsonify({
            "student_name": f"{student_profile.first_name} {student_profile.last_name}",
            "student_id": student_profile.student_id,
            "room": {
                "building_name": room.building_name,
                "room_number": room.room_number
            },
            "course": assignment.course,
            "exam_date": assignment.exam_date
        }), 200

@app.route('/export-assignments-csv', methods=['GET'])
@login_required
def export_assignments_csv():
    if current_user.role != 'admin':
        return jsonify({"error": "Unauthorized"}), 403

    from flask import make_response
    with app.app_context():
        assignments = db.session.query(Assignment, Student, Room).join(Student).join(Room).all()
        
        output = io.StringIO()
        writer = csv.writer(output)
        
        writer.writerow(['Student First Name', 'Student Last Name', 'Student ID', 'Building Name', 'Room Number', 'Course', 'Exam Date'])
        
        for assignment, student, room in assignments:
            writer.writerow([
                student.first_name,
                student.last_name,
                student.student_id,
                room.building_name,
                room.room_number,
                assignment.course if assignment.course else '',
                assignment.exam_date.strftime('%Y-%m-%d %H:%M') if assignment.exam_date else ''
            ])
        
        response = make_response(output.getvalue())
        response.headers["Content-Disposition"] = "attachment; filename=assignments.csv"
        response.headers["Content-type"] = "text/csv"
        return response

@app.route('/export-assignments-pdf', methods=['GET'])
@login_required
def export_assignments_pdf():
    if current_user.role != 'admin':
        return jsonify({"error": "Unauthorized"}), 403

    # This would require a PDF generation library like ReportLab or FPDF
    # For simplicity, this is a placeholder.
    return jsonify({"message": "PDF export not yet implemented"}), 501

@app.route('/rooms', methods=['GET'])
@login_required
def get_rooms():
    if current_user.role != 'admin':
        return jsonify({"error": "Unauthorized"}), 403
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)

    with app.app_context():
        pagination = Room.query.paginate(page=page, per_page=per_page, error_out=False)
        rooms = pagination.items
        
        return jsonify({
            "rooms": [
                {
                    "id": room.id,
                    "building_name": room.building_name,
                    "room_number": room.room_number,
                    "room_capacity": room.room_capacity,
                    "testing_capacity": room.testing_capacity,
                    "allowed": room.allowed
                } for room in rooms
            ],
            "total_pages": pagination.pages,
            "current_page": pagination.page,
            "total_items": pagination.total
        }), 200

@app.route('/students', methods=['GET'])
@login_required
def get_students():
    if current_user.role != 'admin':
        return jsonify({"error": "Unauthorized"}), 403
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)

    with app.app_context():
        pagination = Student.query.paginate(page=page, per_page=per_page, error_out=False)
        students = pagination.items
        
        return jsonify({
            "students": [
                {
                    "id": student.id,
                    "first_name": student.first_name,
                    "last_name": student.last_name,
                    "student_number": student.student_number,
                    "student_id": student.student_id
                } for student in students
            ],
            "total_pages": pagination.pages,
            "current_page": pagination.page,
            "total_items": pagination.total
        }), 200

@app.route('/assignments', methods=['GET'])
@login_required
def get_assignments():
    if current_user.role != 'admin':
        return jsonify({"error": "Unauthorized"}), 403
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)

    with app.app_context():
        pagination = db.session.query(Assignment, Student, Room).join(Student).join(Room).paginate(page=page, per_page=per_page, error_out=False)
        assignments_data = pagination.items
        
        results = []
        for assignment, student, room in assignments_data:
            results.append({
                "assignment_id": assignment.id,
                "student_name": f"{student.first_name} {student.last_name}",
                "student_id": student.student_id,
                "room_name": f"{room.building_name}-{room.room_number}",
                "room_capacity": room.room_capacity,
                "testing_capacity": room.testing_capacity,
                "course": assignment.course,
                "exam_date": assignment.exam_date
            })
        return jsonify({
            "assignments": results,
            "total_pages": pagination.pages,
            "current_page": pagination.page,
            "total_items": pagination.total
        }), 200

@app.route('/buildings', methods=['GET'])
@login_required
def get_buildings():
    if current_user.role != 'admin':
        return jsonify({"error": "Unauthorized"}), 403

    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)

    with app.app_context():
        # Group rooms by building
        rooms = Room.query.all()
        buildings_dict = {}

        for room in rooms:
            building_name = room.building_name
            if building_name not in buildings_dict:
                buildings_dict[building_name] = {
                    "building_name": building_name,
                    "total_rooms": 0,
                    "total_capacity": 0,
                    "total_testing_capacity": 0,
                    "available_rooms": 0,
                    "rooms": []
                }

            buildings_dict[building_name]["rooms"].append({
                "id": room.id,
                "room_number": room.room_number,
                "room_capacity": room.room_capacity,
                "testing_capacity": room.testing_capacity,
                "allowed": room.allowed
            })

            buildings_dict[building_name]["total_rooms"] += 1
            buildings_dict[building_name]["total_capacity"] += room.room_capacity
            buildings_dict[building_name]["total_testing_capacity"] += room.testing_capacity
            if room.allowed:
                buildings_dict[building_name]["available_rooms"] += 1

        buildings_list = list(buildings_dict.values())

        # Sort by building name
        buildings_list.sort(key=lambda x: x["building_name"])

        # Manual pagination for the list of buildings
        start = (page - 1) * per_page
        end = start + per_page
        paginated_buildings = buildings_list[start:end]

        total_items = len(buildings_list)
        total_pages = (total_items + per_page - 1) // per_page

        return jsonify({
            "buildings": paginated_buildings,
            "total_pages": total_pages,
            "current_page": page,
            "total_items": total_items
        }), 200

# CRUD operations for rooms
@app.route('/rooms', methods=['POST'])
@login_required
def create_room():
    if not hasattr(current_user, 'role') or current_user.role != 'admin':
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    try:
        with app.app_context():
            # Find or create building first
            building = Building.query.filter_by(name=data['building_name']).first()
            if not building:
                # Extract building code from name (e.g., "BA - Bahen Centre" -> "BA")
                building_code = data['building_name'].split(' - ')[0] if ' - ' in data['building_name'] else data['building_name'][:10]
                building = Building(name=data['building_name'], code=building_code)
                db.session.add(building)
                db.session.flush()

            room = Room(
                building_id=building.id,
                room_number=data['room_number'],
                capacity=data['room_capacity'],
                floor=1,  # Default to floor 1
                type='Lecture'  # Default type
            )
            db.session.add(room)
            db.session.commit()

            return jsonify({
                "id": room.id,
                "building_name": building.name,
                "room_number": room.room_number,
                "room_capacity": room.capacity,
                "message": "Room created successfully"
            }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/rooms/<int:room_id>', methods=['PUT'])
@login_required
def update_room(room_id):
    if current_user.role != 'admin':
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    try:
        with app.app_context():
            room = Room.query.get_or_404(room_id)

            room.building_name = data.get('building_name', room.building_name)
            room.room_number = data.get('room_number', room.room_number)
            room.room_capacity = data.get('room_capacity', room.room_capacity)
            room.testing_capacity = data.get('testing_capacity', room.testing_capacity)
            room.allowed = data.get('allowed', room.allowed)

            db.session.commit()

            return jsonify({
                "id": room.id,
                "building_name": room.building_name,
                "room_number": room.room_number,
                "room_capacity": room.room_capacity,
                "testing_capacity": room.testing_capacity,
                "allowed": room.allowed,
                "message": "Room updated successfully"
            }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/rooms/<int:room_id>', methods=['DELETE'])
@login_required
def delete_room(room_id):
    if current_user.role != 'admin':
        return jsonify({"error": "Unauthorized"}), 403

    try:
        with app.app_context():
            room = Room.query.get_or_404(room_id)
            db.session.delete(room)
            db.session.commit()

            return jsonify({"message": "Room deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# CRUD operations for students
@app.route('/students', methods=['POST'])
@login_required
def create_student():
    if current_user.role != 'admin':
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    try:
        with app.app_context():
            student = Student(
                first_name=data['first_name'],
                last_name=data['last_name'],
                student_number=data['student_number'],
                student_id=data['student_id']
            )
            db.session.add(student)
            db.session.commit()

            return jsonify({
                "id": student.id,
                "first_name": student.first_name,
                "last_name": student.last_name,
                "student_number": student.student_number,
                "student_id": student.student_id,
                "message": "Student created successfully"
            }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/students/<int:student_id>', methods=['PUT'])
@login_required
def update_student(student_id):
    if current_user.role != 'admin':
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    try:
        with app.app_context():
            student = Student.query.get_or_404(student_id)

            student.first_name = data.get('first_name', student.first_name)
            student.last_name = data.get('last_name', student.last_name)
            student.student_number = data.get('student_number', student.student_number)
            student.student_id = data.get('student_id', student.student_id)

            db.session.commit()

            return jsonify({
                "id": student.id,
                "first_name": student.first_name,
                "last_name": student.last_name,
                "student_number": student.student_number,
                "student_id": student.student_id,
                "message": "Student updated successfully"
            }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/students/<int:student_id>', methods=['DELETE'])
@login_required
def delete_student(student_id):
    if current_user.role != 'admin':
        return jsonify({"error": "Unauthorized"}), 403

    try:
        with app.app_context():
            student = Student.query.get_or_404(student_id)
            db.session.delete(student)
            db.session.commit()

            return jsonify({"message": "Student deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# OAuth and Forgot Password Routes

@app.route('/auth/google')
def google_login():
    redirect_uri = 'http://localhost:5000/auth/google/callback'
    return google.authorize_redirect(redirect_uri)

@app.route('/auth/google/callback')
def google_callback():
    try:
        token = google.authorize_access_token()
        resp = google.get('https://www.googleapis.com/oauth2/v2/userinfo')
        user_info = resp.json()

        # Create or get user based on Google email
        with app.app_context():
            user = User.query.filter_by(email=user_info['email']).first()
            if not user:
                # Get student role
                student_role = Role.query.filter_by(name='student').first()
                user = User(name=user_info.get('name', user_info['email']), email=user_info['email'], role_id=student_role.id, password_hash=generate_password_hash(secrets.token_hex(16)))
                db.session.add(user)
                db.session.commit()

            login_user(user)
            return jsonify({"message": "Logged in successfully", "user": {"id": user.id, "username": user.username, "role": user.role}}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/auth/outlook')
def outlook_login():
    redirect_uri = 'http://localhost:5000/auth/outlook/callback'
    return microsoft.authorize_redirect(redirect_uri)

@app.route('/auth/outlook/callback')
def outlook_callback():
    try:
        token = microsoft.authorize_access_token()
        resp = microsoft.get('https://graph.microsoft.com/v1.0/me')
        user_info = resp.json()

        # Create or get user based on Outlook email
        with app.app_context():
            user = User.query.filter_by(email=user_info['mail']).first()
            if not user:
                # Get student role
                student_role = Role.query.filter_by(name='student').first()
                user = User(name=user_info.get('displayName', user_info['mail']), email=user_info['mail'], role_id=student_role.id, password_hash=generate_password_hash(secrets.token_hex(16)))
                db.session.add(user)
                db.session.commit()

            login_user(user)
            return jsonify({"message": "Logged in successfully", "user": {"id": user.id, "username": user.username, "role": user.role}}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/forgot-password', methods=['POST'])
def forgot_password():
    try:
        data = request.get_json()
        email = data.get('email')

        if not email:
            return jsonify({"error": "Email is required"}), 400

        # For demo purposes, we'll just log the request
        # In a real implementation, you'd send an email with a reset token
        app.logger.info(f"Password reset requested for email: {email}")

        # TODO: Implement actual password reset flow with:
        # 1. Generate reset token with expiration
        # 2. Store token in database
        # 3. Send email with reset link
        # 4. Create reset password endpoint

        return jsonify({"message": "Password reset email sent. Please check your email. (Demo implementation)"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
