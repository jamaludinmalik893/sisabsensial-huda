
-- Create enum for guru roles
CREATE TYPE guru_role AS ENUM ('admin', 'guru', 'wali_kelas');

-- Create junction table for guru roles (many-to-many relationship)
CREATE TABLE IF NOT EXISTS guru_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_guru UUID REFERENCES guru(id_guru) ON DELETE CASCADE NOT NULL,
    role guru_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(id_guru, role)
);

-- Migrate existing data from guru.status to guru_roles table
INSERT INTO guru_roles (id_guru, role)
SELECT id_guru, 
       CASE 
           WHEN status = 'admin' THEN 'admin'::guru_role
           WHEN status = 'guru' THEN 'guru'::guru_role
           ELSE 'guru'::guru_role
       END as role
FROM guru
ON CONFLICT (id_guru, role) DO NOTHING;

-- Add wali_kelas role for teachers who are class guardians
INSERT INTO guru_roles (id_guru, role)
SELECT id_guru, 'wali_kelas'::guru_role
FROM guru
WHERE wali_kelas IS NOT NULL
ON CONFLICT (id_guru, role) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_guru_roles_guru ON guru_roles(id_guru);
CREATE INDEX IF NOT EXISTS idx_guru_roles_role ON guru_roles(role);

-- Create helper function to check if guru has specific role
CREATE OR REPLACE FUNCTION guru_has_role(guru_id UUID, check_role guru_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM guru_roles 
        WHERE id_guru = guru_id AND role = check_role
    );
$$;

-- Create helper function to get all roles for a guru
CREATE OR REPLACE FUNCTION get_guru_roles(guru_id UUID)
RETURNS guru_role[]
LANGUAGE SQL
STABLE
AS $$
    SELECT ARRAY_AGG(role) FROM guru_roles WHERE id_guru = guru_id;
$$;
