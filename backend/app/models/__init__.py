# Import all models to ensure they are registered with SQLAlchemy
from .user import User, Role
from .student import Student
from .building import Building
from .room import Room
from .course import Course
from .exam import Exam
from .assignment import Assignment
