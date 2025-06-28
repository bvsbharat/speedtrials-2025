/*
  # Fix RLS policies for events_milestones table

  The events_milestones table currently has restrictive RLS policies that only allow
  authenticated users to insert/update/delete. This prevents anonymous CSV uploads.
  We need to allow all operations for everyone to enable CSV uploads.
*/

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON events_milestones;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON events_milestones;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON events_milestones;

-- Create permissive policy for all operations
CREATE POLICY "events_milestones_public_access"
  ON events_milestones
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);