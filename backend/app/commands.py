import click
from flask.cli import with_appcontext
from .extensions import db
from .models import User, Role

@click.command()
@click.argument('username')
@click.argument('password')
@click.option('--admin', is_flag=True, help='Create admin user')
@with_appcontext
def create_user(username, password, admin):
    """Create a new user"""
    # Create admin role if it doesn't exist
    admin_role = Role.query.filter_by(name='admin').first()
    if not admin_role:
        admin_role = Role(name='admin')
        db.session.add(admin_role)

    # Create user role if it doesn't exist
    user_role = Role.query.filter_by(name='user').first()
    if not user_role:
        user_role = Role(name='user')
        db.session.add(user_role)

    db.session.commit()

    # Create user
    user = User.query.filter_by(username=username).first()
    if user:
        click.echo(f'User {username} already exists')
        return

    new_user = User(
        username=username,
        email=f'{username}@example.com',
        name=username.title(),
        role=admin_role if admin else user_role
    )
    new_user.set_password(password)

    db.session.add(new_user)
    db.session.commit()

    click.echo(f'User {username} created successfully')

@click.command()
@with_appcontext
def init_db():
    """Initialize the database"""
    db.create_all()
    click.echo('Database initialized')

@click.command()
@with_appcontext
def drop_db():
    """Drop all database tables"""
    db.drop_all()
    click.echo('Database dropped')

# Register commands
def register_commands(app):
    app.cli.add_command(create_user)
    app.cli.add_command(init_db)
    app.cli.add_command(drop_db)
