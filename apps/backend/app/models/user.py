from ..extensions import db
from flask_login import UserMixin
from sqlalchemy import Column, Integer, String, Boolean, TIMESTAMP, TEXT, ForeignKey
from sqlalchemy.orm import relationship

class User(UserMixin, db.Model):
    __tablename__ = 'users'

    # Basic user information
    id = db.Column(db.Integer, primary_key=True)
    external_id = db.Column(db.String(100))
    name = db.Column(db.String(150), nullable=False)

    # Contact information
    email = db.Column(db.String(150), unique=True, nullable=False)
    phone = db.Column(db.String(20))
    avatar_url = db.Column(TEXT)

    # Password and security
    password_hash = db.Column(TEXT, nullable=False)
    password_changed_at = db.Column(TIMESTAMP)
    password_expires_at = db.Column(TIMESTAMP)

    # Role and department relationships
    role_id = db.Column(db.Integer, db.ForeignKey('roles.id'), nullable=False)
    department_id = db.Column(db.Integer)  # Reference to academic_departments

    # Relationships
    role = relationship('Role', backref='users')

    # Status and security flags
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    is_locked = db.Column(db.Boolean, nullable=False, default=False)
    locked_until = db.Column(TIMESTAMP)

    # Login tracking
    failed_login_attempts = db.Column(db.Integer, nullable=False, default=0)
    last_login_at = db.Column(TIMESTAMP)
    last_login_ip = db.Column(db.String(50))  # INET type stored as string

    # Email verification
    email_verified = db.Column(db.Boolean, nullable=False, default=False)
    email_verification_token = db.Column(db.String(100))

    # Audit fields
    created_by = db.Column(db.Integer)  # Reference to another user
    created_at = db.Column(TIMESTAMP, nullable=False, server_default=db.text('CURRENT_TIMESTAMP'))
    updated_at = db.Column(TIMESTAMP, nullable=False, server_default=db.text('CURRENT_TIMESTAMP'))

    # Helper methods for authentication and data serialization
    def get_id(self):
        return str(self.id)

    def check_password(self, password):
        """Check if the provided password matches the stored hash"""
        from werkzeug.security import check_password_hash
        return check_password_hash(self.password_hash, password)

    def set_password(self, password):
        """Set the password hash"""
        from werkzeug.security import generate_password_hash
        self.password_hash = generate_password_hash(password)

    def is_admin(self):
        """Check if user is administrator"""
        return self.role and self.role.name.lower() in ['administrator', 'admin']

    def to_dict(self):
        """Convert user to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role_id': self.role_id,
            'department_id': self.department_id,
            'is_active': self.is_active,
            'is_locked': self.is_locked,
            'locked_until': self.locked_until.isoformat() if self.locked_until else None,
            'last_login_at': self.last_login_at.isoformat() if self.last_login_at else None,
            'failed_login_attempts': self.failed_login_attempts,
            'email_verified': self.email_verified,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    def __repr__(self):
        return f"<User {self.name} ({self.email})>"

class Role(db.Model):
    __tablename__ = 'roles'
    __table_args__ = {'extend_existing': True}
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)

    def __repr__(self):
        return f"<Role {self.name}>"
