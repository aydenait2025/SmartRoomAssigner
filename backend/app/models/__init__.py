# Import all models here to ensure they're registered with SQLAlchemy
from .user import User, Role
from .building import Building
from .room import Room
from .academic_department import AcademicDepartment
from .course import Course
from .exam import Exam
# from .academic_program import AcademicProgram  # File doesn't exist
from .student import Student
# from .time_slot import TimeSlot  # File doesn't exist
# from .academic_term import AcademicTerm  # File doesn't exist
# from .course_enrollment import CourseEnrollment  # File doesn't exist
from .assignment import Assignment  # File exists
# from .faculty_course_assignment import FacultyCourseAssignment  # File doesn't exist
# from .exam_session import ExamSession  # File doesn't exist
# from .room_assignment import RoomAssignment  # File doesn't exist
# from .faculty import Faculty  # File doesn't exist
# from .teaching_assistant import TeachingAssistant  # File doesn't exist
# from .equipment_inventory import EquipmentInventory  # File doesn't exist
# from .room_equipment_assignment import RoomEquipmentAssignment  # File doesn't exist
from .room_reservation import RoomReservation

# Re-export for convenience
__all__ = [
    'User', 'Role', 'Building', 'Room', 'AcademicDepartment', 'Course', 'Exam',
    'Student', 'Assignment', 'RoomReservation'
]
