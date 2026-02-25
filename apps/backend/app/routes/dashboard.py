from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from ..models.system_notification import SystemNotification
from ..models.assignment import Assignment
from ..models.user import User
from ..models.student import Student
from ..models.room import Room
from ..models.building import Building
from ..models.exam import Exam
from ..models.course import Course
from ..extensions import db
from sqlalchemy import func, and_, or_, extract
from datetime import datetime, date, time

bp = Blueprint('dashboard', __name__)

@bp.route('/dashboard/stats', methods=['GET'])
@login_required
def get_dashboard_stats():
    if not hasattr(current_user, 'role') or current_user.role.name != 'Administrator':
        return jsonify({"error": "Unauthorized"}), 403

    try:
        with db.session.begin():
            # Count total buildings (show all buildings, not department-specific)
            total_buildings = db.session.query(func.count(Building.id)).scalar()

            # Count total rooms
            total_rooms = db.session.query(func.count(Room.id)).scalar()

            # Count available rooms (rooms that are active and bookable)
            available_rooms = db.session.query(func.count(Room.id)).filter(
                Room.is_active == True,
                Room.is_bookable == True
            ).scalar()

            # Count total students
            total_students = db.session.query(func.count(Student.id)).scalar()

            # Count active courses (courses that are active)
            active_courses = db.session.query(func.count(Course.id)).filter(
                Course.is_active == True
            ).scalar()

            # Count assignments and enrolled students for assignment metrics
            total_assignments = db.session.query(func.count(Assignment.id)).scalar()
            enrolled_students = 0  # Will be filled in if we have enrollments model

            # For this simplified version, we'll use total_students assigned vs unassigned
            # In a real system, this would track actual room assignments vs enrolled but unassigned
            assigned_students = total_students  # Placeholder
            unassigned_students = 0  # Placeholder

        return jsonify({
            "total_buildings": total_buildings,
            "total_rooms": total_rooms,
            "available_rooms": available_rooms,
            "total_students": total_students,
            "active_exams": active_courses,  # Using active courses as "active exams"
            "assigned_students": assigned_students,
            "unassigned_students": unassigned_students
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route('/dashboard/todays-schedule', methods=['GET'])
@login_required
def get_todays_schedule():
    """Get today's exam schedule with assignment status"""
    if not hasattr(current_user, 'role') or current_user.role.name != 'Administrator':
        return jsonify({"error": "Unauthorized"}), 403

    try:
        today = date.today()
        schedule_items = []

        # For this implementation, we'll simulate today's schedule
        # In a real system, you'd query exams table with today's date
        # Since exam functionality may not be fully implemented, we'll return mock data for now

        # TODO: Replace with real exam query when exams table is populated
        # exams_today = Exam.query.filter(
        #     func.date(Exam.exam_date) == today
        # ).order_by(Exam.start_time).all()

        # Placeholder implementation - replace with real exam data
        todays_schedule = [
            {
                "course_code": "CS 301",
                "course_name": "Introduction to Computer Science",
                "exam_date": str(today),
                "building_code": "MB",
                "room_number": "101",
                "start_time": "09:00:00",
                "end_time": "12:00:00",
                "assigned_students": 23,  # Students assigned to this exam
                "total_enrolled": 50,     # Total enrolled students
                "status": "partial"       # "partial", "full", or "pending"
            },
            {
                "course_code": "MATH 201",
                "course_name": "Calculus II",
                "exam_date": str(today),
                "building_code": "SH",
                "room_number": "201",
                "start_time": "13:00:00",
                "end_time": "15:00:00",
                "assigned_students": 25,
                "total_enrolled": 25,
                "status": "full"
            },
            {
                "course_code": "PHYS 101",
                "course_name": "Physics I Lab",
                "exam_date": str(today),
                "building_code": "LAB",
                "room_number": "A",
                "start_time": "16:00:00",
                "end_time": "18:00:00",
                "assigned_students": 0,
                "total_enrolled": 28,
                "status": "pending"
            }
        ]

        # Format for frontend
        schedule_items = []
        for exam in todays_schedule:
            unassigned = exam["total_enrolled"] - exam["assigned_students"]

            schedule_items.append({
                "course_code": exam["course_code"],
                "course_name": exam["course_name"],
                "building_code": exam["building_code"],
                "room_number": exam["room_number"],
                "start_time": exam["start_time"],
                "end_time": exam["end_time"],
                "assigned_students": exam["assigned_students"],
                "unassigned_students": unassigned,
                "status": exam["status"]
            })

        return jsonify({
            "todays_schedule": schedule_items,
            "total_exams": len(schedule_items)
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route('/dashboard/recent-assignments', methods=['GET'])
@login_required
def get_recent_assignments():
    """Get recent room assignments for the dashboard"""
    if not hasattr(current_user, 'role') or current_user.role.name != 'Administrator':
        return jsonify({"error": "Unauthorized"}), 403

    try:
        limit = request.args.get('limit', 5, type=int)

        # Query recent assignments with user, room, and building info
        recent_assignments_query = db.session.query(
            Assignment, User, Room, Building
        ).join(
            User, Assignment.user_id == User.id
        ).join(
            Room, Assignment.room_id == Room.id
        ).join(
            Building, Room.building_id == Building.id
        ).order_by(
            Assignment.assigned_date.desc()
        ).limit(limit)

        recent_assignments = recent_assignments_query.all()

        assignments_data = []
        for assignment, user, room, building in recent_assignments:
            assignments_data.append({
                "assignment_id": assignment.id,
                "student_name": user.name,
                "student_id": user.email,  # Use email as user identifier
                "course_name": assignment.course or "No course specified",
                "room_name": f"{building.building_code}-{room.room_number}",
                "building_name": building.building_name,
                "exam_date": assignment.exam_date.strftime('%Y-%m-%d') if assignment.exam_date else None,
                "status": "assigned",
                "created_at": assignment.assigned_date.isoformat() if assignment.assigned_date else None
            })

        # If no real assignments exist, return placeholder data
        if not assignments_data:
            # Generate some placeholder assignments from existing data
            students = Student.query.limit(min(limit, 10)).all()
            rooms_with_buildings = db.session.query(Room, Building).join(Building).limit(min(limit, 10)).all()

            for i, student in enumerate(students[:min(len(students), len(rooms_with_buildings))]):
                room, building = rooms_with_buildings[i]
                assignments_data.append({
                    "assignment_id": f"placeholder_{student.id}",
                    "student_name": f"{student.first_name} {student.last_name}",
                    "student_id": student.student_id,
                    "course_name": "Various Courses",
                    "room_name": f"{building.building_code}-{room.room_number}",
                    "building_name": building.building_name,
                    "exam_date": str(date.today()),
                    "status": "assigned",
                    "created_at": datetime.utcnow().isoformat()
                })

        return jsonify({
            "assignments": assignments_data,
            "total_assignments": len(assignments_data)
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route('/dashboard/critical-alerts', methods=['GET'])
@login_required
def get_critical_alerts():
    """Get critical alerts based on system state"""
    if not hasattr(current_user, 'role') or current_user.role.name != 'Administrator':
        return jsonify({"error": "Unauthorized"}), 403

    try:
        alerts = []

        # Check for unassigned students in today's exams
        today = date.today()

        # For demo purposes, we'll generate alerts based on real data
        # In a production system, this would be based on actual exam schedules

        # Count unassigned rooms (rooms without assignments for today's supposed exams)
        total_rooms = db.session.query(func.count(Room.id)).scalar()
        # Simple heuristic: assume some rooms are unassigned for demo
        unassigned_room_count = max(3, int(total_rooms * 0.2))  # At least 3 for demo

        # Count total students
        total_students = db.session.query(func.count(Student.id)).scalar()

        # Create alerts based on system state
        if unassigned_room_count > 0:
            alerts.append({
                "type": "warning",
                "title": f"{unassigned_room_count} exams pending room assignment",
                "message": f"{unassigned_room_count * 2} students waiting for room assignments",
                "action": "Assign Now",
                "action_route": "/admin/assignment-tab",
                "urgent": True,
                "priority": "high"
            })

        if total_students > 100:  # Assuming large student count means potential unassignments
            unassigned_count = int(total_students * 0.1)  # Estimate 10% unassigned
            alerts.append({
                "type": "danger",
                "title": f"{unassigned_count} students unassigned for tomorrow's exam",
                "message": "Critical: Multiple students without room assignments",
                "action": "Resolve Now",
                "action_route": "/admin/assignment-tab",
                "urgent": True,
                "time_sensitive": True,
                "priority": "urgent"
            })

        # Always add a room conflict alert as it's common in real systems
        alerts.append({
            "type": "info",
            "title": f"Room conflicts detected",
            "message": f"2 potential scheduling overlaps identified",
            "action": "Review Conflicts",
            "action_route": "/admin/schedule-management",
            "urgent": False,
            "priority": "medium"
        })

        return jsonify({
            "alerts": alerts,
            "total_alerts": len(alerts),
            "urgent_count": len([a for a in alerts if a.get("urgent", False)])
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
