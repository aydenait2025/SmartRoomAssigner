-- Fix and add missing tables
-- This script completes the SmartRoomAssigner database schema

-- ================================
-- FIX 1: EQUIPMENT_RESERVATIONS (syntax error fix)
-- ================================
CREATE TABLE equipment_reservations (
    id SERIAL PRIMARY KEY,
    equipment_id INTEGER NOT NULL REFERENCES equipment_inventory(id),
    reserved_by INTEGER NOT NULL REFERENCES users(id),
    reservation_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    purpose TEXT NOT NULL,
    pickup_location VARCHAR(200),
    return_condition_check BOOLEAN DEFAULT false,
    checkout_notes TEXT,
    return_notes TEXT,
    actual_return_date TIMESTAMP,
    reservation_status VARCHAR(20) DEFAULT 'pending',
    approved_by INTEGER REFERENCES users(id),
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT valid_equipment_status CHECK (
        reservation_status IN ('pending', 'approved', 'denied', 'checked_out', 'returned', 'cancelled')
    )
);

-- ================================
-- FIX 2: AUDIT_LOGS (fixed for PostgreSQL partitioning)
-- ================================
CREATE TABLE audit_logs (
    id BIGSERIAL NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id INTEGER,
    operation_type VARCHAR(10) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    changed_columns TEXT[],
    changed_by_user_id INTEGER REFERENCES users(id),
    changed_by_external_id VARCHAR(100),
    session_id VARCHAR(200),
    ip_address INET NOT NULL,
    user_agent TEXT,
    source_system VARCHAR(50) DEFAULT 'internal',
    business_impact VARCHAR(50),
    compliance_flag BOOLEAN DEFAULT false,
    retention_period INTERVAL,
    gdpr_data_sensitivity VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Fixed: PostgreSQL partitioning requires partition key in PRIMARY KEY
    PRIMARY KEY (id, created_at),

    CONSTRAINT valid_operation_type CHECK (
        operation_type IN ('INSERT', 'UPDATE', 'DELETE', 'SELECT', 'EXPORT')
    ),
    CONSTRAINT valid_business_impact CHECK (
        business_impact IN ('low', 'medium', 'high', 'critical')
    ),
    CONSTRAINT valid_gdpr_sensitivity CHECK (
        gdpr_data_sensitivity IN ('personal', 'sensitive', 'confidential', 'public')
    )
) PARTITION BY RANGE (created_at);

-- Create initial partition for current year
CREATE TABLE audit_logs_2025 PARTITION OF audit_logs
    FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');

-- ================================
-- FIX 3: PERFORMANCE_METRICS (fixed for PostgreSQL partitioning)
-- ================================
CREATE TABLE performance_metrics (
    id BIGSERIAL NOT NULL,
    metric_category VARCHAR(50) NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(12,4),
    metric_unit VARCHAR(20),
    entity_type VARCHAR(50),
    entity_id INTEGER,
    campus_filter VARCHAR(50),
    department_filter INTEGER REFERENCES academic_departments(id),
    date_dimension DATE NOT NULL,
    time_dimension TIME,
    collection_method VARCHAR(30) DEFAULT 'automated',
    data_quality_score DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Fixed: PostgreSQL partitioning requires partition key in PRIMARY KEY
    PRIMARY KEY (id, date_dimension)
) PARTITION BY RANGE (date_dimension);

-- Create initial partition for current year
CREATE TABLE performance_metrics_2025 PARTITION OF performance_metrics
    FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');

-- ================================
-- INDEXES FOR NEW TABLES
-- ================================

-- Equipment reservations indexes
CREATE INDEX idx_equipment_reservations_equipment_id ON equipment_reservations(equipment_id);
CREATE INDEX idx_equipment_reservations_reserved_by ON equipment_reservations(reserved_by);
CREATE INDEX idx_equipment_reservations_date_range ON equipment_reservations(reservation_date, start_time, end_time);
CREATE INDEX idx_equipment_reservations_status ON equipment_reservations(reservation_status);

-- Audit logs indexes (global indexes for partitioned table)
CREATE INDEX idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(changed_by_user_id);
CREATE INDEX idx_audit_logs_business_impact ON audit_logs(business_impact);

-- Performance metrics indexes (global indexes for partitioned table)
CREATE INDEX idx_performance_metrics_category ON performance_metrics(metric_category);
CREATE INDEX idx_performance_metrics_entity ON performance_metrics(entity_type, entity_id);
CREATE INDEX idx_performance_metrics_date ON performance_metrics(date_dimension);

COMMIT;
