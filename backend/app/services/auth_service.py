"""Authentication service for user management and validation"""

from flask import current_app
from ..models.user import User, Role
from ..extensions import db

class AuthService:
    """Service class for authentication operations"""

    @staticmethod
    def authenticate_user(email, password):
        """Authenticate user with email and password"""
        user = User.query.filter_by(email=email).first()
        if not user:
            return None, "User not found"

        if not user.check_password(password):
            return None, "Invalid password"

        return user, None

    @staticmethod
    def create_user(name, email, password, role_name='student'):
        """Create a new user account"""
        # Check if user already exists
        if User.query.filter_by(email=email).first():
            return None, "Email already exists"

        # Get role
        role = Role.query.filter_by(name=role_name).first()
        if not role:
            return None, f"Invalid role: {role_name}"

        # Create user
        user = User(name=name, email=email, role_id=role.id)
        user.set_password(password)

        db.session.add(user)
        db.session.commit()

        return user, None

    @staticmethod
    def get_current_user_info(user):
        """Get current user information for API responses"""
        return {
            "id": user.id,
            "email": user.email,
            "role": user.role.name if user.role else None
        }

    @staticmethod
    def initialize_roles():
        """Initialize default roles in database"""
        roles_data = [
            Role(name='admin'),
            Role(name='professor'),
            Role(name='ta'),
            Role(name='student')
        ]

        for role in roles_data:
            existing = Role.query.filter_by(name=role.name).first()
            if not existing:
                db.session.add(role)

        db.session.commit()
        return True
