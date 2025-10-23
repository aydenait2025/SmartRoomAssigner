-- Add MFA (Multi-Factor Authentication) Tables
-- This script adds comprehensive MFA functionality to SmartRoomAssigner

-- ================================
-- MULTI-FACTOR AUTHENTICATION (MFA) SCHEMA
-- ================================

-- MFA Methods Available in System
CREATE TABLE mfa_methods (
    id SERIAL PRIMARY KEY,
    method_code VARCHAR(20) NOT NULL UNIQUE, -- sms, email, totp, hardware, push, biometric
    method_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_enabled BOOLEAN DEFAULT true,
    setup_instructions TEXT,
    icon_svg TEXT,
    priority_order INTEGER DEFAULT 10,
    security_level VARCHAR(20) DEFAULT 'standard', -- low, standard, high
    requires_cloud_service BOOLEAN DEFAULT false,
    cloud_provider VARCHAR(50),
    cost_per_use DECIMAL(6,4) DEFAULT 0, -- Cost for external MFA services
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT valid_method_code CHECK (
        method_code IN ('sms', 'email', 'totp', 'hardware', 'push', 'biometric', 'recovery_codes')
    ),
    CONSTRAINT valid_security_level CHECK (
        security_level IN ('low', 'standard', 'high', 'critical')
    )
);

-- User MFA Enrollment (One per method per user)
CREATE TABLE user_mfa_enrollments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    mfa_method_id INTEGER NOT NULL REFERENCES mfa_methods(id),
    is_enrolled BOOLEAN DEFAULT false,
    enrollment_date TIMESTAMP,
    last_used TIMESTAMP,
    required_for_login BOOLEAN DEFAULT false,
    backup_method_allowed BOOLEAN DEFAULT true,
    device_name VARCHAR(200), -- User's name for this device/method
    device_fingerprint VARCHAR(500), -- Hardware fingerprint for security
    qr_code_secret TEXT, -- Encrypted TOTP secret
    hardware_key_id VARCHAR(200), -- For FIDO2/WebAuthn
    phone_number VARCHAR(20), -- For SMS MFA
    phone_verified BOOLEAN DEFAULT false,
    email_backup VARCHAR(150), -- Backup email for MFA codes
    email_backup_verified BOOLEAN DEFAULT false,
    biometric_data JSONB DEFAULT '{}', -- Store biometric templates securely
    trust_devices JSONB DEFAULT '[]', -- Trusted device fingerprints
    max_failures_before_lock INTEGER DEFAULT 5,
    lockout_until TIMESTAMP,
    failure_count INTEGER DEFAULT 0,
    mfa_status VARCHAR(20) DEFAULT 'inactive', -- active, inactive, locked, suspended
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_user_method_mfa UNIQUE (user_id, mfa_method_id),
    CONSTRAINT valid_mfa_status CHECK (
        mfa_status IN ('active', 'inactive', 'locked', 'suspended', 'expired')
    )
);

-- MFA Verification Codes (Temporary, short-lived)
CREATE TABLE mfa_verification_codes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    mfa_enrollment_id INTEGER NOT NULL REFERENCES user_mfa_enrollments(id),
    verification_code VARCHAR(10) NOT NULL, -- One-time code
    code_hash TEXT NOT NULL, -- For secure verification
    code_type VARCHAR(20) DEFAULT 'login', -- login, challenge, setup, recovery
    expires_at TIMESTAMP NOT NULL,
    attempts_made INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    ip_address INET,
    user_agent TEXT,
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT valid_code_type CHECK (
        code_type IN ('login', 'challenge', 'setup', 'recovery', 'password_reset', 'account_verification')
    ),
    CONSTRAINT code_not_expired CHECK (expires_at > NOW()),
    CONSTRAINT attempts_not_exceeded CHECK (attempts_made <= max_attempts)
);

-- MFA Backup/Recovery Codes (For account recovery)
CREATE TABLE mfa_backup_codes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    backup_code_hash TEXT NOT NULL, -- Hashed backup code
    code_label VARCHAR(100), -- User-friendly identifier
    is_used BOOLEAN DEFAULT false,
    used_at TIMESTAMP,
    used_by_ip INET,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP -- Optional expiration for security
);

-- Active MFA Sessions (For session management)
CREATE TABLE mfa_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    session_identifier VARCHAR(200) NOT NULL UNIQUE,
    mfa_method_used INTEGER NOT NULL REFERENCES mfa_methods(id),
    authenticated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    ip_address INET,
    user_agent TEXT,
    device_fingerprint VARCHAR(500),
    geo_location JSONB DEFAULT '{}', -- Geolocation data for security
    risk_score DECIMAL(3,2), -- 0.00 to 1.00, higher = riskier
    is_trusted_device BOOLEAN DEFAULT false,
    trust_until TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    revoked BOOLEAN DEFAULT false,
    revoked_by INTEGER REFERENCES users(id),
    revoked_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT session_not_expired CHECK (
        NOT revoked AND expires_at > NOW()
    ),
    CONSTRAINT valid_risk_score CHECK (risk_score >= 0 AND risk_score <= 1)
);

-- MFA Audit Logs (Security logging for MFA activities)
CREATE TABLE mfa_audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    mfa_enrollment_id INTEGER REFERENCES user_mfa_enrollments(id),
    activity_type VARCHAR(50) NOT NULL,
    activity_details TEXT,
    mfa_method_id INTEGER REFERENCES mfa_methods(id),
    success BOOLEAN DEFAULT true,
    failure_reason TEXT,
    ip_address INET,
    user_agent TEXT,
    geo_location JSONB DEFAULT '{}',
    risk_assessment JSONB DEFAULT '{}',
    session_id VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT valid_mfa_activity CHECK (
        activity_type IN ('enrolled', 'setup_initiated', 'setup_completed', 'setup_failed',
                         'verification_sent', 'verification_successful', 'verification_failed',
                         'backup_used', 'recovery_initiated', 'method_disabled', 'method_suspended',
                         'trust_granted', 'trust_revoked', 'security_warning', 'policy_violation',
                         'admin_override', 'system_unlock')
    )
);

-- Insert default MFA methods
INSERT INTO mfa_methods (method_code, method_name, description, priority_order, security_level) VALUES
('sms', 'SMS Text Message', 'Receive verification codes via SMS', 5, 'standard'),
('email', 'Email Verification', 'Receive codes via backup email', 4, 'standard'),
('totp', 'Authenticator Apps', 'Use Google Authenticator, Authy, etc.', 3, 'high'),
('hardware', 'Hardware Security Keys', 'FIDO2/WebAuthn compatible devices', 2, 'high'),
('biometric', 'Biometric Authentication', 'Fingerprint, facial recognition', 1, 'high'),
('recovery_codes', 'Backup Recovery Codes', 'Static codes for account recovery', 6, 'critical');
