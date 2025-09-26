from flask import Blueprint, request, jsonify, current_app
from flask_login import login_required
from werkzeug.utils import secure_filename
import pandas as pd
import os
from ..models.student import Student
from ..models.building import Building
from ..models.room import Room
from ..models.exam import Exam
from ..models.assignment import Assignment
from ..extensions import db

bp = Blueprint('imports', __name__)

ALLOWED_EXTENSIONS = {'csv', 'xlsx', 'xls'}

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@bp.route('/import/students', methods=['POST'])
@login_required
def import_students():
    """Import students from CSV or Excel file"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    if not allowed_file(file.filename):
        return jsonify({'error': 'File type not allowed. Use CSV or Excel files'}), 400

    try:
        # Save file temporarily
        filename = secure_filename(file.filename)
        filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        # Read file based on extension
        if filename.endswith('.csv'):
            df = pd.read_csv(filepath)
        else:
            df = pd.read_excel(filepath)

        # Validate required columns
        required_columns = ['student_id', 'first_name', 'last_name', 'email']
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            os.remove(filepath)
            return jsonify({'error': f'Missing required columns: {missing_columns}'}), 400

        imported_students = []
        errors = []

        for i, row in df.iterrows():
            try:
                # Check if student already exists
                existing_student = Student.query.filter_by(student_id=str(row['student_id'])).first()
                if existing_student:
                    errors.append(f'Row {i+2}: Student ID {row["student_id"]} already exists')
                    continue

                student = Student(
                    student_id=str(row['student_id']),
                    first_name=str(row['first_name']),
                    last_name=str(row['last_name']),
                    email=str(row['email']),
                    phone=str(row.get('phone', '')) if pd.notna(row.get('phone')) else None,
                    year=int(row['year']) if pd.notna(row.get('year')) and str(row.get('year')).isdigit() else None,
                    major=str(row.get('major', '')) if pd.notna(row.get('major')) else '',
                    gpa=float(row['gpa']) if pd.notna(row.get('gpa')) and str(row.get('gpa')).replace('.', '').isdigit() else None
                )

                db.session.add(student)
                imported_students.append(student)

            except Exception as e:
                errors.append(f'Row {i+2}: {str(e)}')

        if imported_students:
            db.session.commit()

        # Clean up file
        os.remove(filepath)

        return jsonify({
            'message': f'Imported {len(imported_students)} students successfully',
            'students': [student.to_dict() for student in imported_students],
            'errors': errors
        }), 200 if imported_students else 400

    except Exception as e:
        return jsonify({'error': f'Error processing file: {str(e)}'}), 500

@bp.route('/import/buildings', methods=['POST'])
@login_required
def import_buildings():
    """Import buildings from CSV or Excel file"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    if not allowed_file(file.filename):
        return jsonify({'error': 'File type not allowed. Use CSV or Excel files'}), 400

    try:
        # Save file temporarily
        filename = secure_filename(file.filename)
        filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        # Read file
        if filename.endswith('.csv'):
            df = pd.read_csv(filepath)
        else:
            df = pd.read_excel(filepath)

        # Validate required columns
        required_columns = ['name', 'code', 'address']
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            os.remove(filepath)
            return jsonify({'error': f'Missing required columns: {missing_columns}'}), 400

        imported_buildings = []
        errors = []

        for i, row in df.iterrows():
            try:
                # Check if building code already exists
                existing_building = Building.query.filter_by(code=str(row['code'])).first()
                if existing_building:
                    errors.append(f'Row {i+2}: Building code {row["code"]} already exists')
                    continue

                building = Building(
                    name=str(row['name']),
                    code=str(row['code']),
                    address=str(row['address']),
                    description=str(row.get('description', '')) if pd.notna(row.get('description')) else '',
                    total_floors=int(row['total_floors']) if pd.notna(row.get('total_floors')) and str(row.get('total_floors')).isdigit() else None,
                    total_rooms=int(row['total_rooms']) if pd.notna(row.get('total_rooms')) and str(row.get('total_rooms')).isdigit() else None,
                    coordinates_lat=float(row['coordinates_lat']) if pd.notna(row.get('coordinates_lat')) and str(row.get('coordinates_lat')).replace('.', '').isdigit() else None,
                    coordinates_lng=float(row['coordinates_lng']) if pd.notna(row.get('coordinates_lng')) and str(row.get('coordinates_lng')).replace('.', '').isdigit() else None,
                    campus=str(row.get('campus', '')) if pd.notna(row.get('campus')) else '',
                    accessibility_info=str(row.get('accessibility_info', '')) if pd.notna(row.get('accessibility_info')) else ''
                )

                db.session.add(building)
                imported_buildings.append(building)

            except Exception as e:
                errors.append(f'Row {i+2}: {str(e)}')

        if imported_buildings:
            db.session.commit()

        # Clean up file
        os.remove(filepath)

        return jsonify({
            'message': f'Imported {len(imported_buildings)} buildings successfully',
            'buildings': [building.to_dict() for building in imported_buildings],
            'errors': errors
        }), 200 if imported_buildings else 400

    except Exception as e:
        return jsonify({'error': f'Error processing file: {str(e)}'}), 500

@bp.route('/import/assignments', methods=['POST'])
@login_required
def import_assignments():
    """Import assignments from CSV or Excel file"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    if not allowed_file(file.filename):
        return jsonify({'error': 'File type not allowed. Use CSV or Excel files'}), 400

    try:
        # Save file temporarily
        filename = secure_filename(file.filename)
        filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        # Read file
        if filename.endswith('.csv'):
            df = pd.read_csv(filepath)
        else:
            df = pd.read_excel(filepath)

        # Validate required columns
        required_columns = ['student_id', 'exam_id', 'room_id']
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            os.remove(filepath)
            return jsonify({'error': f'Missing required columns: {missing_columns}'}), 400

        imported_assignments = []
        errors = []

        for i, row in df.iterrows():
            try:
                # Validate entities exist
                student = Student.query.filter_by(student_id=str(row['student_id'])).first()
                if not student:
                    errors.append(f'Row {i+2}: Student {row["student_id"]} not found')
                    continue

                exam = Exam.query.get(int(row['exam_id']) if pd.notna(row.get('exam_id')) else None)
                if not exam:
                    errors.append(f'Row {i+2}: Exam {row["exam_id"]} not found')
                    continue

                room = Room.query.get(int(row['room_id']) if pd.notna(row.get('room_id')) else None)
                if not room:
                    errors.append(f'Row {i+2}: Room {row["room_id"]} not found')
                    continue

                # Check if student already has an assignment for this exam
                existing_assignment = Assignment.query.filter_by(
                    student_id=student.id,
                    exam_id=exam.id
                ).first()
                if existing_assignment:
                    errors.append(f'Row {i+2}: Student {row["student_id"]} already has an assignment for exam {row["exam_id"]}')
                    continue

                # Check room capacity
                room_assignments_count = Assignment.query.filter_by(room_id=room.id).count()
                if room_assignments_count >= room.capacity:
                    errors.append(f'Row {i+2}: Room {row["room_id"]} is at full capacity')
                    continue

                assignment = Assignment(
                    student_id=student.id,
                    exam_id=exam.id,
                    room_id=room.id,
                    assigned_date=pd.to_datetime(row.get('assigned_date', pd.Timestamp.now())),
                    special_accommodations=str(row.get('special_accommodations', '')) if pd.notna(row.get('special_accommodations')) else '',
                    notes=str(row.get('notes', '')) if pd.notna(row.get('notes')) else ''
                )

                db.session.add(assignment)
                imported_assignments.append(assignment)

            except Exception as e:
                errors.append(f'Row {i+2}: {str(e)}')

        if imported_assignments:
            db.session.commit()

        # Clean up file
        os.remove(filepath)

        return jsonify({
            'message': f'Imported {len(imported_assignments)} assignments successfully',
            'assignments': [assignment.to_dict() for assignment in imported_assignments],
            'errors': errors
        }), 200 if imported_assignments else 400

    except Exception as e:
        return jsonify({'error': f'Error processing file: {str(e)}'}), 500
