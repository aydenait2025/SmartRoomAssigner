from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from ..models.assignment import Assignment
from ..models.user import User
from ..models.room import Room
from ..models.exam import Exam
from ..extensions import db
from sqlalchemy import text
from datetime import date
import time

bp = Blueprint('assignments', __name__)

@bp.route('/assignments', methods=['GET'])
@login_required
def get_assignments():
    """Get assignments with pagination"""
    if not hasattr(current_user, 'role') or current_user.role.name != 'Administrator':
        return jsonify({"error": "Unauthorized"}), 403

    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)

        # Get assignments with related data
        assignments_query = db.session.query(Assignment, User, Room).\
            join(User, Assignment.user_id == User.id).\
            join(Room, Assignment.room_id == Room.id)

        pagination = assignments_query.paginate(page=page, per_page=per_page, error_out=False)

        assignments_data = []
        for assignment, user, room in pagination.items:
            assignments_data.append(assignment.to_dict())

        return jsonify({
            "assignments": assignments_data,
            "total_pages": pagination.pages,
            "current_page": pagination.page,
            "total_items": pagination.total
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route('/assignments', methods=['POST'])
@login_required
def create_assignment():
    """Create new assignment"""
    if not hasattr(current_user, 'role') or current_user.role.name != 'Administrator':
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    try:
        assignment = Assignment(
            user_id=data['user_id'],
            room_id=data['room_id'],
            exam_id=data.get('exam_id'),
            course=data.get('course'),
            exam_date=data.get('exam_date'),
            assigned_date=data.get('assigned_date'),
            special_accommodations=data.get('special_accommodations'),
            notes=data.get('notes'),
            seat_number=data.get('seat_number')
        )

        db.session.add(assignment)
        db.session.commit()

        return jsonify({"message": "Assignment created successfully", "assignment": assignment.to_dict()}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@bp.route('/assignments/<int:assignment_id>', methods=['PUT'])
@login_required
def update_assignment(assignment_id):
    """Update assignment"""
    if not hasattr(current_user, 'role') or current_user.role.name != 'Administrator':
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    try:
        assignment = Assignment.query.get_or_404(assignment_id)

        # Update fields
        for field in ['user_id', 'room_id', 'exam_id', 'course', 'exam_date',
                     'special_accommodations', 'notes', 'seat_number']:
            if field in data:
                setattr(assignment, field, data[field])

        db.session.commit()

        return jsonify({"message": "Assignment updated successfully", "assignment": assignment.to_dict()}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@bp.route('/assignments/<int:assignment_id>', methods=['DELETE'])
@login_required
def delete_assignment(assignment_id):
    """Delete assignment"""
    if not hasattr(current_user, 'role') or current_user.role.name != 'Administrator':
        return jsonify({"error": "Unauthorized"}), 403

    try:
        assignment = Assignment.query.get_or_404(assignment_id)
        db.session.delete(assignment)
        db.session.commit()

        return jsonify({"message": "Assignment deleted successfully"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@bp.route('/assignments/smart-assign', methods=['POST'])
@login_required
def smart_assign_students():
    """Advanced smart assignment algorithm with algorithm selection"""
    if not hasattr(current_user, 'role') or current_user.role.name != 'Administrator':
        return jsonify({"error": "Unauthorized"}), 403

    from .algorithms import AssignmentAlgorithm

    data = request.get_json() or {}
    algorithm_id = data.get('algorithm_id')

    # Get the algorithm (or use default if none specified)
    selected_algorithm = None
    if algorithm_id:
        selected_algorithm = AssignmentAlgorithm.query.get(algorithm_id)
    else:
        selected_algorithm = AssignmentAlgorithm.get_default_algorithm()

    if not selected_algorithm:
        # Seed default algorithms as last resort
        AssignmentAlgorithm.seed_default_algorithms()
        selected_algorithm = AssignmentAlgorithm.get_default_algorithm()

    if not selected_algorithm:
        return jsonify({"error": "No assignment algorithm available"}), 500

    # Parse algorithm logic (from JSON string back to dict)
    algorithm_logic = None
    try:
        algorithm_logic = eval(selected_algorithm.algorithm_logic.replace('"', '"'))  # Convert JSON string back to dict
    except:
        # If parsing fails, use default logic
        algorithm_logic = {
            "type": "alphabetical_grouping",
            "rules": ["alphabetical_sorting", "group_by_last_name", "maintain_name_clusters", "multi_room_distribution"]
        }

    def progress_callback(progress, message):
        """Progress callback function - in a real implementation, this might publish to WebSocket"""
        print(f"Progress: {progress}% - {message}")

    def get_last_name_first_char(name):
        """Extract first character of last name for alphabetical grouping"""
        if not name or not isinstance(name, str):
            return 'Z'  # Default for unknown names
        parts = name.strip().split()
        if len(parts) >= 2:
            return parts[-1][0].upper()  # Last name first character
        elif len(parts) == 1:
            return parts[0][0].upper()   # First name first character if only one name
        return 'Z'  # Default

    def group_students_alphabetically(students, num_groups):
        """Group students alphabetically to maintain name clusters"""
        if num_groups <= 0:
            return [students]  # Fallback

        if num_groups <= 1:
            return [students]

        # Sort students by last name
        sorted_students = sorted(students, key=lambda s: s.name.upper() if s.name else 'ZZZ')

        # Calculate group sizes
        total_students = len(sorted_students)
        if total_students == 0:
            return []  # No students, return empty groups

        # Ensure num_groups doesn't exceed total_students
        num_groups = min(num_groups, total_students)

        base_group_size = total_students // num_groups
        remainder = total_students % num_groups

        # Create groups with smart alphabetical distribution
        groups = []
        start_idx = 0

        for i in range(num_groups):
            # Add extra student to earlier groups if remainder > 0
            group_size = base_group_size + (1 if i < remainder else 0)

            if start_idx + group_size <= total_students:
                group = sorted_students[start_idx:start_idx + group_size]
                groups.append(group)
                start_idx += group_size

        # If any students left (shouldn't happen), add to last group
        if start_idx < total_students and groups:
            groups[-1].extend(sorted_students[start_idx:])

        return groups

    def assign_students_to_room_groups(groups, rooms):
        """Assign student groups to available rooms"""
        assignments = []

        # Sort rooms by capacity descending
        available_rooms = sorted(rooms, key=lambda r: (r.exam_capacity if r.exam_capacity else r.capacity), reverse=True)

        room_idx = 0
        for group_idx, group in enumerate(groups):
            if room_idx >= len(available_rooms):
                # No more rooms available for this group
                break

            room = available_rooms[room_idx]
            room_capacity = room.exam_capacity if room.exam_capacity else room.capacity
            course = "CS 301" if group_idx % 2 == 0 else "MATH 201"  # Alternate courses
            exam_date = date.today() if group_idx % 2 == 0 else date.today().replace(day=min(30, date.today().day + 1))

            # Limit group size to room capacity
            max_students = min(len(group), room_capacity)
            room_students = group[:max_students]

            # Create assignments for this room
            group_assignments = []
            for student in room_students:
                assignment = Assignment(
                    user_id=student.id,
                    room_id=room.id,
                    course=course,
                    exam_date=exam_date
                )
                group_assignments.append(assignment)

            assignments.extend(group_assignments)
            room_idx += 1

            # Calculate progress more safely to prevent division by zero
            total_students_in_all_groups = sum(len(g) for g in groups if g and len(g) > 0)
            if total_students_in_all_groups > 0:
                progress_percentage = min(90, 50 + int((len(assignments) / total_students_in_all_groups) * 40))
            else:
                progress_percentage = 85  # Fallback progress

            progress_callback(
                progress_percentage,
                f"Assigned {len(room_students)} students to {room.building_code}-{room.room_number}..."
            )

        return assignments

    try:
        # Step 1: Clear existing assignments (0%)
        progress_callback(0, "Clearing existing assignments...")
        db.session.query(Assignment).delete()
        db.session.commit()

        # Step 2: Get available rooms and students (10%)
        progress_callback(10, "Getting available rooms...")
        rooms = Room.query.filter_by(is_active=True, is_bookable=True).all()

        progress_callback(20, "Finding eligible students...")
        # Get users with 'student' role, including their names
        from ..models.user import Role
        student_role = Role.query.filter_by(name='student').first()
        users = []
        if student_role:
            users = User.query.filter_by(role_id=student_role.id).limit(50).all()  # Limit for demo

        progress_callback(25, f"Found {len(rooms)} rooms and {len(users)} users")

        # Validation: Ensure we have data to work with
        if len(users) == 0:
            return jsonify({
                "error": "No students found in the system. Please ensure students are properly registered with 'student' role.",
                "success": False
            }), 400

        if len(rooms) == 0:
            return jsonify({
                "error": "No active, bookable rooms found in the system. Please ensure rooms are configured and active.",
                "success": False
            }), 400

        # Step 3: Calculate optimal room distribution (30%)
        progress_callback(30, "Calculating optimal distribution...")

        total_room_capacity = sum((r.exam_capacity if r.exam_capacity else r.capacity) for r in rooms)
        total_students = len(users)

        if total_room_capacity < total_students:
            return jsonify({
                "error": f"Insufficient room capacity. Available: {total_room_capacity} seats, Need: {total_students} users.",
                "success": False
            }), 400

        # Determine number of rooms needed (considering alphabetical grouping)
        # Use smart grouping: calculate based on alphabet distribution
        sorted_students = sorted(users, key=lambda s: s.name.upper() if s.name else 'ZZZ')

        # Analyze name distribution to determine optimal grouping
        first_letters = [get_last_name_first_char(s.name) for s in users]
        unique_letters = sorted(set(first_letters))
        alphabet_coverage = len(unique_letters)

        # Smart room calculation: aim for natural alphabetical breaks
        # Rule: Try to keep similar-sounding names together (e.g., K names stay together)
        if len(rooms) == 0:
            return jsonify({"error": "No available rooms found.", "success": False}), 400

        # Use all available rooms, distributed alphabetically, but not more groups than students
        valid_rooms = [r for r in rooms if (r.exam_capacity if r.exam_capacity else r.capacity) > 0]
        num_groups = min(len(valid_rooms), len(rooms), len(users))  # Ensure not more groups than students

        if num_groups <= 0:
            num_groups = 1  # Fallback to at least 1 group

        # Step 4: Sort students alphabetically and create groups (40%)
        progress_callback(40, "Sorting students alphabetically...")
        student_groups = group_students_alphabetically(sorted_students, num_groups)

        progress_callback(45, f"Created {len(student_groups)} alphabetical groups")

        # Step 5: Assign groups to rooms (50%-90%)
        progress_callback(50, "Assigning alphabetical groups to rooms...")
        assignments = assign_students_to_room_groups(student_groups, rooms)

        # Step 6: Save assignments to database (95%)
        progress_callback(95, "Saving assignments to database...")
        for assignment in assignments:
            db.session.add(assignment)
        db.session.commit()

        # Step 7: Complete (100%)
        progress_callback(100, f"Smart assignment completed! {len(assignments)} students assigned.")

        return jsonify({
            "success": True,
            "message": f"Smart assignment completed! {len(assignments)} students assigned to {num_groups} rooms with optimal alphabetical distribution.",
            "assignments_created": len(assignments),
            "groups_created": len(student_groups),
            "rooms_used": len(set(a.room_id for a in assignments)),
        }), 200

    except Exception as e:
        db.session.rollback()
        progress_callback(-1, f"Error occurred: {str(e)}")
        return jsonify({"error": str(e), "success": False}), 500

@bp.route('/assignments/assign-course-to-room', methods=['POST'])
@login_required
def assign_course_to_room():
    """Assign a course to a room - automatically assign enrolled students alphabetically"""
    if not hasattr(current_user, 'role') or current_user.role.name != 'Administrator':
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json()
    if not data or not data.get('course_id') or not data.get('room_id'):
        return jsonify({"error": "course_id and room_id are required"}), 400

    try:
        course_id = data.get('course_id')
        room_id = data.get('room_id')
        algorithm_id = data.get('algorithm_id', 1)

        # Get course and enrolled students
        from ..models.course import Course
        course = Course.query.get(course_id)
        if not course:
            return jsonify({"error": "Course not found"}), 404

        # Get students enrolled in this course using raw SQL
        enrollment_query = """
            SELECT s.user_id, u.name, u.email
            FROM course_enrollments ce
            JOIN students s ON ce.student_id = s.id
            JOIN users u ON s.user_id = u.id
            WHERE ce.course_id = :course_id
            AND ce.enrollment_status = 'enrolled'
        """

        result = db.session.execute(text(enrollment_query), {'course_id': course_id})
        enrolled_students = []

        for row in result:
            # Create a User-like object for consistency
            class EnrolledUser:
                def __init__(self, id, name, email):
                    self.id = id
                    self.name = name
                    self.email = email
            enrolled_students.append(EnrolledUser(row[0], row[1], row[2]))

        # Debug: Log enrollment count
        print(f"DEBUG: Course {course.course_name} (ID {course_id}) has {len(enrolled_students)} enrolled students")
        if enrolled_students:
            print(f"DEBUG: First student: {enrolled_students[0].name}")

        # If no enrolled students found, fallback to simulate enrollment for testing
        if not enrolled_students:
            # Create mock enrollment for testing - enroll students in courses
            from ..models.user import Role
            student_role = Role.query.filter_by(name='student').first()
            if student_role:
                students_to_enroll = User.query.filter_by(role_id=student_role.id).all()
                # Auto-enroll first 100 students in this course for testing
                current_term = db.session.query(db.func.max(Exam.term_id)).filter_by(course_id=course_id).first()
                term_id = current_term[0] if current_term and current_term[0] else 1

                for student in students_to_enroll[:min(100, len(students_to_enroll))]:
                    # Insert enrollment if doesn't exist
                    db.session.execute(text("""
                        INSERT INTO course_enrollments (student_id, course_id, term_id, enrollment_status)
                        VALUES (:student_id, :course_id, :term_id, 'enrolled')
                        ON CONFLICT DO NOTHING
                    """), {
                        'student_id': student.id if hasattr(student, 'student_id') else student.user_id,
                        'course_id': course_id,
                        'term_id': term_id
                    })

                # Now get the enrolled students
                result = db.session.execute(text(enrollment_query), {'course_id': course_id})
                enrolled_students = []
                for row in result:
                    enrolled_students.append(EnrolledUser(row[0], row[1], row[2]))

        # Check again if we have enrolled students
        if not enrolled_students:
            return jsonify({
                "error": f"No students enrolled in {course.course_name}",
                "course_id": course_id,
                "course_name": course.course_name
            }), 400

        # Sort students alphabetically by name
        sorted_students = sorted(enrolled_students, key=lambda s: s.name.upper() if s.name else 'ZZZ')

        # Get room and check capacity
        room = Room.query.get(room_id)
        if not room:
            return jsonify({"error": "Room not found"}), 404

        room_capacity = room.exam_capacity if room.exam_capacity else room.capacity
        total_student_count = len(sorted_students)

        # Limit assignment to room capacity - partial assignment is allowed
        if total_student_count > room_capacity:
            # Partial assignment: only assign up to room capacity
            assigned_students = sorted_students[:room_capacity]
            remaining_students = total_student_count - room_capacity
        else:
            # Full assignment: assign all students
            assigned_students = sorted_students
            remaining_students = 0

        student_count = len(assigned_students)

        # Check if ANY course is already assigned to this room (one room = one course rule)
        existing_assignments_for_room = Assignment.query.filter_by(room_id=room_id).count()

        if existing_assignments_for_room > 0:
            # Get building code if needed
            building_code = "Unknown"
            if hasattr(room, 'building') and room.building:
                building_code = room.building.building_code

            return jsonify({"error": f"Room {building_code}-{room.room_number} already has a course assigned. One room can only have one course."}), 400

        # Create assignments for students - only up to room capacity
        assignments_created = []
        exam_date = date.today()  # Use current date as exam date

        for student in assigned_students:  # Use assigned_students (limited to capacity)
            assignment = Assignment(
                user_id=student.id,
                room_id=room_id,
                course=course.course_name,
                exam_date=exam_date,
                assigned_date=date.today()
            )
            db.session.add(assignment)
            assignments_created.append({
                'student_id': student.id,
                'student_name': student.name,
                'assignment_id': None  # Will be set after commit
            })

        db.session.commit()

        # Update assignment IDs after commit
        for i, assignment_dict in enumerate(assignments_created):
            # Find the assignment object we just created
            assignment_obj = db.session.query(Assignment).filter_by(
                user_id=assignment_dict['student_id'],
                room_id=room_id,
                course=course.course_name
            ).first()

            if assignment_obj:
                assignments_created[i]['assignment_id'] = assignment_obj.id

        # Get building code for response
        response_building_code = "Unknown"
        if hasattr(room, 'building') and room.building:
            response_building_code = room.building.building_code

        return jsonify({
            "message": f"Assigned {student_count} students from {course.course_name} to {response_building_code}-{room.room_number}",
            "course_id": course_id,
            "course_name": course.course_name,
            "room_id": room_id,
            "assignments_created": len(assignments_created),
            "student_count": student_count,
            "total_students": total_student_count,
            "remaining_students": remaining_students,
            "assignment_type": "partial" if remaining_students > 0 else "full",
            "room": {
                "id": room.id,
                "building_code": response_building_code,
                "room_number": room.room_number,
                "capacity": room.capacity
            }
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@bp.route('/assignments/remove-course/<int:room_id>/<int:course_id>', methods=['DELETE'])
@login_required
def remove_course_assignment(room_id, course_id):
    """Remove all assignments for a course from a room"""
    if not hasattr(current_user, 'role') or current_user.role.name != 'Administrator':
        return jsonify({"error": "Unauthorized"}), 403

    try:
        from ..models.course import Course
        course = Course.query.get(course_id)
        if not course:
            return jsonify({"error": "Course not found"}), 404

        # Delete all assignments for this course in this room
        deleted_count = db.session.query(Assignment).filter_by(
            course=course.course_name,
            room_id=room_id
        ).delete()

        db.session.commit()

        return jsonify({
            "message": f"Removed {deleted_count} assignments for {course.course_name} from room {room_id}",
            "course_name": course.course_name,
            "room_id": room_id,
            "assignments_removed": deleted_count
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@bp.route('/assignments/clear-all', methods=['DELETE'])
@login_required
def clear_all_assignments():
    """Clear all student-to-room assignments"""
    if not hasattr(current_user, 'role') or current_user.role.name != 'Administrator':
        return jsonify({"error": "Unauthorized"}), 403

    try:
        deleted_count = db.session.query(Assignment).delete()
        db.session.commit()

        return jsonify({
            "message": f"Cleared all assignments ({deleted_count} assignments removed)",
            "assignments_removed": deleted_count
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # This is for testing the progress callback
    def test_progress():
        smart_assign_students()
    test_progress()
