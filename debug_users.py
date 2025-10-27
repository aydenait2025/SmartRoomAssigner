#!/usr/bin/env python3
"""Script to debug user data in database"""

import sys
sys.path.append('backend')

from app import create_app
from app.extensions import db
from app.models.user import User, Role
from werkzeug.security import check_password_hash

app = create_app()
with app.app_context():
    # Count total users
    total_users = db.session.query(db.func.count(User.id)).scalar()
    print(f'📊 Total users in database: {total_users}')

    # Count by role
    print('\n📈 Users by role:')
    role_counts = db.session.query(Role.name, db.func.count(User.id))\
        .join(User, User.role_id == Role.id)\
        .group_by(Role.id, Role.name)\
        .all()

    for role_name, count in role_counts:
        print(f'  {role_name}: {count}')

    print('\n👑 Admin users:')
    admin_users = User.query.filter(
        User.email.in_(['admin@example.com', 'alice@examspace.com'])
    ).all()
    for user in admin_users:
        print(f'ID: {user.id}, Email: {user.email}, Name: {user.name}, RoleID: {user.role_id}, Role: {user.role.name if user.role else None}')
