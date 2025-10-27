
    -- Drop table if it exists (for development/testing)
    DROP TABLE IF EXISTS assignment_algorithms CASCADE;

    -- Create assignment_algorithms table
    CREATE TABLE assignment_algorithms (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT NOT NULL,
        version VARCHAR(20) DEFAULT '1.0',
        algorithm_logic TEXT NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_by INTEGER NOT NULL REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Add index for active algorithms
    CREATE INDEX idx_assignment_algorithms_active ON assignment_algorithms(is_active);

    -- Add index for created_by
    CREATE INDEX idx_assignment_algorithms_created_by ON assignment_algorithms(created_by);

    -- Grant permissions to authenticated users
    GRANT SELECT, INSERT, UPDATE, DELETE ON assignment_algorithms TO authenticated;
    GRANT USAGE ON SEQUENCE assignment_algorithms_id_seq TO authenticated;

    -- Row Level Security (RLS) Policies
    ALTER TABLE assignment_algorithms ENABLE ROW LEVEL SECURITY;

    -- Admin users can do everything
    CREATE POLICY "assignment_algorithms_admin_policy" ON assignment_algorithms
        FOR ALL USING (
            EXISTS (
                SELECT 1 FROM users
                WHERE users.id = auth.uid()
                AND users.role_id IN (
                    SELECT id FROM user_roles WHERE name = 'Administrator'
                )
            )
        );

    -- Other users can only read active algorithms
    CREATE POLICY "assignment_algorithms_read_policy" ON assignment_algorithms
        FOR SELECT USING (is_active = TRUE);

    -- Function to update updated_at timestamp
    CREATE OR REPLACE FUNCTION update_assignment_algorithms_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    -- Trigger to automatically update updated_at
    CREATE TRIGGER trigger_update_assignment_algorithms_updated_at
        BEFORE UPDATE ON assignment_algorithms
        FOR EACH ROW
        EXECUTE FUNCTION update_assignment_algorithms_updated_at();

    -- Insert default algorithms
    INSERT INTO assignment_algorithms (name, description, algorithm_logic, created_by, is_active) VALUES
    (
        'Simple Round Robin',
        'Basic round-robin assignment. Students assigned sequentially to available rooms.',
        '{"type": "round_robin", "rules": ["single_assignment_per_room", "ignore_alphabetical_order"]}',
        1,  -- Assuming admin user exists
        FALSE
    ),
    (
        'Smart Alphabetical Grouping',
        'Advanced algorithm that groups students alphabetically. A-K in first room, L-S in second, etc.',
        '{"type": "alphabetical_grouping", "rules": ["alphabetical_sorting", "group_by_last_name", "maintain_name_clusters", "multi_room_distribution"]}',
        1,  -- Assuming admin user exists
        TRUE  -- This is the default active algorithm
    ),
    (
        'Capacity Optimized',
        'Focuses on maximizing room utilization while respecting capacity limits.',
        '{"type": "capacity_optimization", "rules": ["maximize_utilization", "respect_capacity_limits", "balance_load"]}',
        1,  -- Assuming admin user exists
        FALSE
    ),
    (
        'Department-based Grouping',
        'Groups students by academic department before alphabetical sorting.',
        '{"type": "department_grouping", "rules": ["group_by_department", "alphabetical_within_departments", "department_segregation"]}',
        1,  -- Assuming admin user exists
        FALSE
    );

    -- Show success message
    SELECT 'assignment_algorithms table created successfully!' as status;
    