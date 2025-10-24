from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from ..extensions import db

class User(UserMixin, db.Model):
    """Enterprise User model for enterprise-grade user management"""
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    external_id = db.Column(db.String(100))
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    phone = db.Column(db.String(20))
    avatar_url = db.Column(db.Text)
    password_hash = db.Column(db.Text, nullable=True)  # Allow NULL for OAuth users
    password_changed_at = db.Column(db.DateTime)
    password_expires_at = db.Column(db.DateTime)
    role_id = db.Column(db.Integer, db.ForeignKey('roles.id'), nullable=False)
    role = db.relationship('Role', backref='users', lazy=True)
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id'))
    is_active = db.Column(db.Boolean, default=True)
    is_locked = db.Column(db.Boolean, default=False)
    locked_until = db.Column(db.DateTime)
    failed_login_attempts = db.Column(db.Integer, default=0)
    last_login_at = db.Column(db.DateTime)
    last_login_ip = db.Column(db.String(45))  # IPv4/IPv6
    email_verified = db.Column(db.Boolean, default=False)
    email_verification_token = db.Column(db.String(200))
    created_by = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    # OAuth provider IDs
    google_id = db.Column(db.String(50))
    microsoft_id = db.Column(db.String(50))

    # Override username property for Flask-Login compatibility
    @property
    def username(self):
        """Return email as username for compatibility"""
        return self.email



    def set_password(self, password):
        """Hash and store password"""
        self.password_hash = generate_password_hash(password)
        self.password_changed_at = db.func.current_timestamp()

    def check_password(self, password):
        """Verify password against stored hash"""
        return check_password_hash(self.password_hash, password)

    def is_admin(self):
        """Check if user has admin role hierarchy"""
        return self.role.hierarchy_level >= 100 if self.role else False

    def is_student(self):
        """Check if user has student role"""
        return self.role.name.lower() == 'student' if self.role else False

    def to_dict(self):
        """Convert user to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role.name if self.role else None,
            'role_id': self.role_id,
            'is_active': self.is_active,
            'is_locked': self.is_locked,
            'last_login_at': self.last_login_at.isoformat() if self.last_login_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

    def __repr__(self):
        return f"<User {self.name} ({self.email})>"

class Role(db.Model):
    """Enterprise Role model for role-based access control with hierarchy"""
    __tablename__ = 'roles'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    description = db.Column(db.Text)
    permissions = db.Column(db.Text, default='[]')  # JSON array of permissions
    hierarchy_level = db.Column(db.Integer, default=0)
    is_system_role = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    def __repr__(self):
        return f"<Role {self.name} (Level {self.hierarchy_level})>"
