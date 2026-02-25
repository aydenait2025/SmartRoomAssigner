from ..extensions import db

class Building(db.Model):
    __tablename__ = 'buildings'
    id = db.Column(db.Integer, primary_key=True)
    building_code = db.Column(db.String(10), nullable=False)
    building_name = db.Column(db.String(200), nullable=False)
    campus = db.Column(db.String(50))
    full_address = db.Column(db.Text)
    latitude = db.Column(db.Numeric(10, 8))
    longitude = db.Column(db.Numeric(11, 8))
    building_type = db.Column(db.String(50))
    year_constructed = db.Column(db.Integer)
    total_floors = db.Column(db.Integer)
    accessible_entrances = db.Column(db.JSON)
    emergency_exits = db.Column(db.JSON)
    fire_systems_installation = db.Column(db.Date)
    last_inspection_date = db.Column(db.Date)
    inspection_frequency_months = db.Column(db.Integer, default=12)
    next_inspection_date = db.Column(db.Date)
    capacity_override = db.Column(db.Integer)
    accessibility_rating = db.Column(db.Integer, db.CheckConstraint('accessibility_rating >= 1 AND accessibility_rating <= 5'))
    maintenance_priority = db.Column(db.String(10), default='normal')
    emergency_contact_name = db.Column(db.String(150))
    emergency_contact_phone = db.Column(db.String(20))
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    rooms = db.relationship('Room', backref='building', lazy=True)

    def __repr__(self):
        return f"<Building {self.building_code}: {self.building_name}>"
