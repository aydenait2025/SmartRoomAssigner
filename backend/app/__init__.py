import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_login import LoginManager
from authlib.integrations.flask_client import OAuth

# Import configuration
from .config import Config

# Import extensions
from .extensions import db, login_manager, oauth

# Import models for database creation
# from .models import user, student, building, exam, assignment  # Commented out as models are inline

def create_app(config_class=None):
    """Application factory pattern"""
    app = Flask(__name__)

    if config_class is None:
        # Use environment variable for configuration
        config_name = os.getenv('FLASK_CONFIG', 'app.config.DevelopmentConfig')
        app.config.from_object(config_name)
    else:
        # Use provided config class directly
        app.config.from_object(config_class)

    # Initialize extensions
    db.init_app(app)
    login_manager.init_app(app)
    CORS(app, supports_credentials=True, origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        f"http://{os.getenv('SERVER_IP', 'localhost')}:3000"
    ])

    # Initialize OAuth
    oauth.init_app(app)
    oauth.register(
        name='google',
        client_id=os.getenv('GOOGLE_CLIENT_ID'),
        client_secret=os.getenv('GOOGLE_CLIENT_SECRET'),
        server_metadata_url='https://accounts.google.com/.well-known/openid_configuration',
        client_kwargs={'scope': 'openid email profile'}
    )
    oauth.register(
        name='microsoft',
        client_id=os.getenv('MICROSOFT_CLIENT_ID'),
        client_secret=os.getenv('MICROSOFT_CLIENT_SECRET'),
        server_metadata_url='https://login.microsoftonline.com/common/v2.0/.well-known/openid_configuration',
        client_kwargs={'scope': 'openid email profile'}
    )

    # Register blueprints
    from .routes import auth, users, students, rooms, buildings, assignments, imports, system, schedules, courses, dashboard_bp as dashboard
    app.register_blueprint(auth.bp)
    app.register_blueprint(users.bp)
    app.register_blueprint(students.bp)
    app.register_blueprint(rooms.bp)
    app.register_blueprint(buildings.bp)
    app.register_blueprint(assignments.bp)
    app.register_blueprint(imports.bp)
    app.register_blueprint(system)
    app.register_blueprint(schedules)
    app.register_blueprint(courses)
    app.register_blueprint(dashboard)

    # Import and register commands
    from . import commands
    commands.register_commands(app)

    return app
