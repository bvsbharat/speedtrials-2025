/*
  Fix violations table for CSV uploads
  
  This migration ensures the violations table allows anonymous uploads
  by creating proper RLS policies and handling foreign key constraints.
*/

-- First, drop all existing policies on violations table
DROP POLICY IF EXISTS "Violations are viewable by everyone" ON violations;
DROP POLICY IF EXISTS "Violations are manageable by authenticated users" ON violations;
DROP POLICY IF EXISTS "violations_select_policy" ON violations;
DROP POLICY IF EXISTS "violations_insert_policy" ON violations;
DROP POLICY IF EXISTS "violations_update_policy" ON violations;
DROP POLICY IF EXISTS "violations_delete_policy" ON violations;
DROP POLICY IF EXISTS "violations_public_access" ON violations;

-- Create a single permissive policy for all operations
CREATE POLICY "violations_allow_all_operations"
  ON violations
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE violations ENABLE ROW LEVEL SECURITY;

-- Also ensure the water_systems table allows public access for foreign key validation
DROP POLICY IF EXISTS "Water systems are viewable by everyone" ON water_systems;
DROP POLICY IF EXISTS "Water systems are manageable by authenticated users" ON water_systems;
DROP POLICY IF EXISTS "water_systems_public_access" ON water_systems;

CREATE POLICY "water_systems_allow_all_operations"
  ON water_systems
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

ALTER TABLE water_systems ENABLE ROW LEVEL SECURITY;