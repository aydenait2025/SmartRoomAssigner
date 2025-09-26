from .auth import bp as auth
from .users import bp as users
from .students import bp as students
from .rooms import bp as rooms
from .buildings import bp as buildings
from .assignments import bp as assignments
from .imports import bp as imports
from .system import bp as system

__all__ = ['auth', 'users', 'students', 'rooms', 'buildings', 'assignments', 'imports', 'system']
