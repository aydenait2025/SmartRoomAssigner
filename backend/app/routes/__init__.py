from .auth import bp as auth
# Comment out model-dependent blueprints for now to avoid import conflicts
# from .users import bp as users
# from .students import bp as students
# from .rooms import bp as rooms
# from .buildings import bp as buildings
# from .assignments import bp as assignments
# from .imports import bp as imports
# from .system import bp as system
# from .schedules import bp as schedules

__all__ = ['auth']  # Only auth is currently working without model conflicts
