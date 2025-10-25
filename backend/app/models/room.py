from ..extensions import db

class Room(db.Model):
    __tablename__ = 'rooms'
    id = db.Column(db.Integer, primary_key=True)
    building_id = db.Column(db.Integer, db.ForeignKey('buildings.id'), nullable=False)
    room_number = db.Column(db.String(20), nullable=False)
    room_name = db.Column(db.String(100))
    floor_number = db.Column(db.Integer)
    capacity = db.Column(db.Integer, db.CheckConstraint('capacity > 0'), nullable=False)
    exam_capacity = db.Column(db.Integer)
    room_type = db.Column(db.String(50))
    department_id = db.Column(db.Integer, db.ForeignKey('academic_departments.id'))
    technology_equipment = db.Column(db.JSON)
    accessibility_features = db.Column(db.JSON)
    seating_arrangement = db.Column(db.String(50))
    chalkboards_count = db.Column(db.Integer, default=0)
    whiteboards_count = db.Column(db.Integer, default=0)
    projectors_count = db.Column(db.Integer, default=0)
    computers_count = db.Column(db.Integer, default=0)
    square_footage = db.Column(db.Integer)
    room_restrictions = db.Column(db.JSON)
    is_active = db.Column(db.Boolean, default=True)
    is_bookable = db.Column(db.Boolean, default=True)
    maintenance_schedule = db.Column(db.JSON, default=dict)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    # Constraints
    __table_args__ = (
        db.UniqueConstraint('building_id', 'room_number', name='unique_building_room_number'),
    )

    def to_dict(self):
        """Convert room to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'building_id': self.building_id,
            'room_number': self.room_number,
            'room_name': self.room_name,
            'floor_number': self.floor_number,
            'capacity': self.capacity,
            'exam_capacity': self.exam_capacity,
            'room_type': self.room_type,
            'department_id': self.department_id,
            'technology_equipment': self.technology_equipment,
            'accessibility_features': self.accessibility_features,
            'is_active': self.is_active,
            'is_bookable': self.is_bookable
        }

    def __repr__(self):
        return f"<Room {self.building.building_name if self.building else 'Unknown'}-{self.room_number}>"
