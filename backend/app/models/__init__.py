from .user import User, Role
from .student import Student
from .building import Building
from .academic_department import AcademicDepartment
from .course import Course
from .room import Room
from .exam import Exam
from .assignment import Assignment, Enrollment

# Establish course relationships after all models are loaded
def setup_relationships():
    from sqlalchemy.orm import relationship as rel
    from .assignment import Enrollment
    Enrollment.course = rel('Course', back_populates='enrollments', lazy=True)

setup_relationships()

__all__ = ['User', 'Role', 'Student', 'Building', 'AcademicDepartment', 'Course', 'Room', 'Exam', 'Assignment', 'Enrollment']
