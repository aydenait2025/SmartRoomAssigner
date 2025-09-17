import os
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
import pandas as pd
import io
import csv

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'a_very_secret_key') # Replace with a strong secret key
CORS(app, supports_credentials=True) # Enable CORS for credentials

app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'postgresql://user:password@db:5432/smartroomassign')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.session_protection = "strong" # Protect sessions

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Database Models
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(50), nullable=False, default='student') # 'admin' or 'student'

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f"<User {self.username} ({self.role})>"

class Room(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    building_name = db.Column(db.String(100), nullable=False)
    room_number = db.Column(db.String(50), nullable=False)
    room_capacity = db.Column(db.Integer, nullable=False)
    testing_capacity = db.Column(db.Integer, default=0)
    allowed = db.Column(db.Boolean, default=True)
    assignments = db.relationship('Assignment', backref='room', lazy=True)

    def __repr__(self):
        return f"<Room {self.building_name}-{self.room_number}>"

class Student(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    student_number = db.Column(db.String(50), unique=True, nullable=False)
    student_id = db.Column(db.String(50), unique=True, nullable=False) # Assuming student_id is unique identifier for login
    assignment = db.relationship('Assignment', backref='student', uselist=False, lazy=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True) # Link to User for student login
    user = db.relationship('User', backref='student_profile', uselist=False)

    def __repr__(self):
        return f"<Student {self.first_name} {self.last_name}>"

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
        db.create_all()
        # Create a default admin user if not exists
        if not User.query.filter_by(username='admin').first():
            admin_user = User(username='admin', role='admin')
            admin_user.set_password('adminpassword') # Change this in production!
            db.session.add(admin_user)
            db.session.commit()
    return "Database initialized and default admin user created!"

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    role = data.get('role', 'student')

    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400

    with app.app_context():
        if User.query.filter_by(username=username).first():
            return jsonify({"error": "Username already exists"}), 409

        new_user = User(username=username, role=role)
        new_user.set_password(password)
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": "User registered successfully"}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    with app.app_context():
        user = User.query.filter_by(username=username).first()

        if user and user.check_password(password):
            login_user(user)
            return jsonify({"message": "Logged in successfully", "user": {"id": user.id, "username": user.username, "role": user.role}}), 200
        return jsonify({"error": "Invalid username or password"}), 401

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return jsonify({"message": "Logged out successfully"}), 200

@app.route('/current_user')
@login_required
def get_current_user():
    return jsonify({"id": current_user.id, "username": current_user.username, "role": current_user.role}), 200

@app.route('/upload-rooms', methods=['POST'])
@login_required
def upload_rooms():
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
        for index, row in df.iterrows():
            room = Room(
                building_name=row['Building Name'],
                room_number=row['Room Number'],
                room_capacity=row['Room Capacity'],
                testing_capacity=row['Testing Capacity'],
                allowed=row['Allowed flag']
            )
            rooms_to_add.append(room)
        
        # For preview, we just return the processed data
        return jsonify([
            {
                "building_name": r.building_name,
                "room_number": r.room_number,
                "room_capacity": r.room_capacity,
                "testing_capacity": r.testing_capacity,
                "allowed": r.allowed
            } for r in rooms_to_add
        ]), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/save-rooms', methods=['POST'])
@login_required
def save_rooms():
    if current_user.role != 'admin':
        return jsonify({"error": "Unauthorized"}), 403

    rooms_data = request.json
    if not rooms_data:
        return jsonify({"error": "No room data provided"}), 400

    try:
        with app.app_context():
            # Clear existing rooms and add new ones
            db.session.query(Room).delete()
            for room_data in rooms_data:
                room = Room(
                    building_name=room_data['building_name'],
                    room_number=room_data['room_number'],
                    room_capacity=room_data['room_capacity'],
                    testing_capacity=room_data.get('testing_capacity', 0),
                    allowed=room_data.get('allowed', True)
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
    
    with app.app_context():
        rooms = Room.query.all()
        return jsonify([
            {
                "id": room.id,
                "building_name": room.building_name,
                "room_number": room.room_number,
                "room_capacity": room.room_capacity,
                "testing_capacity": room.testing_capacity,
                "allowed": room.allowed
            } for room in rooms
        ]), 200

@app.route('/students', methods=['GET'])
@login_required
def get_students():
    if current_user.role != 'admin':
        return jsonify({"error": "Unauthorized"}), 403
    
    with app.app_context():
        students = Student.query.all()
        return jsonify([
            {
                "id": student.id,
                "first_name": student.first_name,
                "last_name": student.last_name,
                "student_number": student.student_number,
                "student_id": student.student_id
            } for student in students
        ]), 200

@app.route('/assignments', methods=['GET'])
@login_required
def get_assignments():
    if current_user.role != 'admin':
        return jsonify({"error": "Unauthorized"}), 403
    
    with app.app_context():
        assignments = db.session.query(Assignment, Student, Room).join(Student).join(Room).all()
        
        results = []
        for assignment, student, room in assignments:
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
        return jsonify(results), 200

if __name__ == '__main__':
    app.run(debug=True)
