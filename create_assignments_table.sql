
    -- Drop and recreate the assignments table to match the Assignment model
    DROP TABLE IF EXISTS assignments CASCADE;

    -- Create assignments table
    CREATE TABLE assignments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        room_id INTEGER NOT NULL REFERENCES rooms(id),
        exam_id INTEGER REFERENCES exams(id),
        course VARCHAR(100),
        exam_date TIMESTAMP,
        assigned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        special_accommodations TEXT,
        notes TEXT,
        seat_number VARCHAR(10)
    );

    -- Add indexes for performance
    CREATE INDEX idx_assignments_user_id ON assignments(user_id);
    CREATE INDEX idx_assignments_room_id ON assignments(room_id);
    CREATE INDEX idx_assignments_exam_id ON assignments(exam_id);
    CREATE INDEX idx_assignments_exam_date ON assignments(exam_date);

    -- Grant permissions (similar to other tables)
    GRANT SELECT, INSERT, UPDATE, DELETE ON assignments TO authenticated;
    GRANT USAGE ON SEQUENCE assignments_id_seq TO authenticated;

    -- Row Level Security (RLS) - optional, matching other tables
    ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

    -- Admin users can do everything
    CREATE POLICY "assignments_admin_policy" ON assignments
        FOR ALL USING (
            EXISTS (
                SELECT 1 FROM users
                WHERE users.id = auth.uid()
                AND users.role_id IN (
                    SELECT id FROM roles WHERE name = 'Administrator'
                )
            )
        );

    -- Users can read their own assignments
    CREATE POLICY "assignments_read_policy" ON assignments
        FOR SELECT USING (user_id = auth.uid());

    -- Function to update updated_at timestamp (for future updates)
    CREATE OR REPLACE FUNCTION update_assignments_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
        -- Could add updated_at column if needed
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    -- Show success message
    SELECT 'assignments table created successfully with user_id, room_id, exam_id, course, exam_date, assigned_date, special_accommodations, notes, seat_number columns!' as status;
    