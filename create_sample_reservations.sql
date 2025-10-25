-- Create sample room reservations to demonstrate departmental room filtering
-- This shows how departments can "reserve" rooms for their use instead of hard-coded ownership

-- Insert reservations for Computer Science rooms (building 1, room 101)
INSERT INTO room_reservations (
    room_id, requested_by, event_title, event_description,
    event_type, expected_attendees, reservation_date, start_time, end_time,
    reservation_status, approved_by, approved_at, created_at
) VALUES
(1, 1, 'Department Reserve - CS101', 'Reserved for Computer Science department courses and assignments',
 'department_reservation', 100, CURRENT_DATE, '08:00', '18:00', 'approved', 1, NOW(), NOW());

-- Note about the architectural improvement:
-- Instead of setting room.department_id = some_dept_id (hard ownership),
-- we now create reservations that allow flexible room sharing:
-- - Departments can reserve rooms for specific periods
-- - Multiple departments can reserve the same room for different time slots
-- - Rooms belong to the university, departments "borrow" them when needed

-- The frontend now shows:
-- "My Departmental Rooms" = rooms with approved reservations by department users
-- "All University Rooms" = all rooms in the system

-- This is much more flexible than the old department_id approach!
