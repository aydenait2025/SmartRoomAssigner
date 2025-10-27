-- Seed demo notifications for SmartRoomAssigner
-- This script inserts the 4 demo notifications into the system_notifications table

-- Get admin role ID first (assuming role exists with standard name)
DO $$
DECLARE
    admin_role_id INTEGER;
BEGIN
    SELECT id INTO admin_role_id FROM roles WHERE name = 'Administrator' LIMIT 1;

    -- Only proceed if admin role exists
    IF admin_role_id IS NOT NULL THEN
        -- Insert notifications for admin role
        INSERT INTO system_notifications (
            recipient_user_id,
            recipient_role_id,
            notification_title,
            notification_message,
            notification_type,
            priority_level,
            expires_at,
            read_by_user,
            created_at
        ) VALUES
        -- Notification 1: For admin role (unread, high priority)
        (
            NULL,
            admin_role_id,
            'Room Assignment Required',
            '3 exams are pending room assignment. Please review and assign rooms.',
            'exam_reminder',
            'high',
            NOW() + INTERVAL '7 days',
            false,
            NOW() - INTERVAL '30 minutes'
        ),
        -- Notification 2: For admin role (unread, urgent priority)
        (
            NULL,
            admin_role_id,
            'Student Unassigned',
            '27 students are still unassigned for tomorrow''s CS 301 Final Exam.',
            'exam_reminder',
            'urgent',
            NOW() + INTERVAL '1 day',
            false,
            NOW() - INTERVAL '2 hours'
        ),
        -- Notification 3: For admin role (read, normal priority)
        (
            NULL,
            admin_role_id,
            'Room Conflict Detected',
            'MB-101 is double-booked for 2pm-4pm on December 10th.',
            'system_alert',
            'high',
            NOW() + INTERVAL '30 days',
            true,
            NOW() - INTERVAL '4 hours'
        ),
        -- Notification 4: For admin role (read, low priority)
        (
            NULL,
            admin_role_id,
            'Assignment Completed',
            'MATH 201 Midterm assignments have been successfully completed.',
            'system_alert',
            'low',
            NOW() + INTERVAL '90 days',
            true,
            NOW() - INTERVAL '1 day'
        );

        RAISE NOTICE 'Successfully inserted 4 demo notifications for admin role';
    ELSE
        RAISE NOTICE 'Admin role not found, skipping notification seeding';
    END IF;
END $$;

-- Verify the notifications were inserted
SELECT
    id,
    notification_title,
    priority_level,
    read_by_user,
    created_at,
    CASE
        WHEN recipient_role_id IS NOT NULL THEN 'Role-based (' || (SELECT name FROM roles WHERE id = recipient_role_id) || ')'
        WHEN recipient_user_id IS NOT NULL THEN 'User-specific'
        ELSE 'External email'
    END as recipient_type
FROM system_notifications
ORDER BY created_at DESC;
