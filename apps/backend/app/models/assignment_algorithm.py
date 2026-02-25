from ..extensions import db
from datetime import datetime

class AssignmentAlgorithm(db.Model):
    """Model for storing customizable assignment algorithms"""
    __tablename__ = 'assignment_algorithms'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    description = db.Column(db.Text, nullable=False)
    version = db.Column(db.String(20), default='1.0')
    algorithm_logic = db.Column(db.Text, nullable=False) # JSON or structured algorithm rules
    is_active = db.Column(db.Boolean, default=True)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    creator = db.relationship('User', backref='created_algorithms')

    def __repr__(self):
        return f"<AssignmentAlgorithm {self.name} (v{self.version})>"

    def to_dict(self):
        """Convert to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'version': self.version,
            'algorithm_logic': self.algorithm_logic,
            'is_active': self.is_active,
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'creator_name': self.creator.name if self.creator else None
        }

    @classmethod
    def get_default_algorithm(cls):
        """Get the default alphabetical grouping algorithm"""
        return cls.query.filter_by(name='Smart Alphabetical Grouping', is_active=True).first()

    @classmethod
    def seed_default_algorithms(cls):
        """Seed default algorithms into the database"""
        from .user import User, Role

        # Get admin user or create system user
        admin_role = Role.query.filter_by(name='admin').first()
        admin_user = None
        if admin_role:
            admin_user = User.query.filter_by(role_id=admin_role.id).first()

        if not admin_user:
            # Create a system admin user for seeding
            admin_user = User(
                name='System Administrator',
                email='system@examspace.com',
                role_id=admin_role.id if admin_role else 1
            )
            db.session.add(admin_user)
            db.session.flush()

        # Seed default algorithms
        default_algorithms = [
            {
                'name': 'Simple Round Robin',
                'description': 'Basic round-robin assignment. Students assigned sequentially to available rooms.',
                'algorithm_logic': {
                    'type': 'round_robin',
                    'rules': ['single_assignment_per_room', 'ignore_alphabetical_order']
                }
            },
            {
                'name': 'Smart Alphabetical Grouping',
                'description': 'Advanced algorithm that groups students alphabetically. A-K in first room, L-S in second, etc.',
                'algorithm_logic': {
                    'type': 'alphabetical_grouping',
                    'rules': ['alphabetical_sorting', 'group_by_last_name', 'maintain_name_clusters', 'multi_room_distribution']
                }
            },
            {
                'name': 'Capacity Optimized',
                'description': 'Focuses on maximizing room utilization while respecting capacity limits.',
                'algorithm_logic': {
                    'type': 'capacity_optimization',
                    'rules': ['maximize_utilization', 'respect_capacity_limits', 'balance_load']
                }
            },
            {
                'name': 'Department-based Grouping',
                'description': 'Groups students by academic department before alphabetical sorting.',
                'algorithm_logic': {
                    'type': 'department_grouping',
                    'rules': ['group_by_department', 'alphabetical_within_departments', 'department_segregation']
                }
            }
        ]

        for algo_data in default_algorithms:
            # Check if algorithm already exists
            existing = cls.query.filter_by(name=algo_data['name']).first()
            if not existing:
                algorithm = cls(
                    name=algo_data['name'],
                    description=algo_data['description'],
                    algorithm_logic=str(algo_data['algorithm_logic']).replace("'", '"'),  # Convert to JSON format
                    created_by=admin_user.id,
                    is_active=True
                )
                db.session.add(algorithm)

        db.session.commit()
        return True
