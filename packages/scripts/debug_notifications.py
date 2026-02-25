#!/usr/bin/env python3

import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv('DATABASE_URL')

try:
    conn = psycopg2.connect(db_url)
    cursor = conn.cursor()

    print("=== Alice Admin User ===")
    cursor.execute("SELECT u.id, u.name, u.email, u.role_id, r.name as role_name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.email = 'alice@examspace.com'")
    alice = cursor.fetchone()
    print("Alice user:", alice)

    print("\n=== Admin Roles ===")
    cursor.execute("SELECT id, name FROM roles WHERE name ILIKE '%admin%'")
    admin_roles = cursor.fetchall()
    print("Admin roles:", admin_roles)

    print("\n=== Sample Notifications ===")
    cursor.execute("SELECT id, recipient_user_id, recipient_role_id, notification_title FROM system_notifications LIMIT 5")
    notifs = cursor.fetchall()
    print("Sample notifications:", notifs)

    print("\n=== All Notifications ===")
    cursor.execute("SELECT id, notification_title, recipient_user_id, recipient_role_id FROM system_notifications")
    all_notifs = cursor.fetchall()
    print("All notifications:", all_notifs)

    conn.close()

except Exception as e:
    print(f"Error: {str(e)}")
