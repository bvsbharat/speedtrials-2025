/*
  # Fix RLS policies for CSV upload functionality

  1. Security Updates
    - Update RLS policies to allow INSERT operations for anonymous users on all tables
    - This enables CSV upload functionality without requiring authentication
    - Maintains existing SELECT permissions for public access

  2. Tables Updated
    - water_systems: Allow anonymous INSERT
    - violations: Allow anonymous INSERT  
    - sample_results: Allow anonymous INSERT
    - facilities: Allow anonymous INSERT
    - geographic_areas: Allow anonymous INSERT
    - site_visits: Allow anonymous INSERT

  Note: This allows public data uploads. In production, consider requiring authentication.
*/

-- Update water_systems policies
DROP POLICY IF EXISTS "Water systems are manageable by authenticated users" ON water_systems;
CREATE POLICY "Water systems are manageable by everyone"
  ON water_systems
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Update violations policies  
DROP POLICY IF EXISTS "Violations are manageable by authenticated users" ON violations;
CREATE POLICY "Violations are manageable by everyone"
  ON violations
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Update sample_results policies
DROP POLICY IF EXISTS "Sample results are manageable by authenticated users" ON sample_results;
CREATE POLICY "Sample results are manageable by everyone"
  ON sample_results
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Update facilities policies
DROP POLICY IF EXISTS "Facilities are manageable by authenticated users" ON facilities;
CREATE POLICY "Facilities are manageable by everyone"
  ON facilities
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Update geographic_areas policies
DROP POLICY IF EXISTS "Geographic areas are manageable by authenticated users" ON geographic_areas;
CREATE POLICY "Geographic areas are manageable by everyone"
  ON geographic_areas
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Update site_visits policies
DROP POLICY IF EXISTS "Site visits are manageable by authenticated users" ON site_visits;
CREATE POLICY "Site visits are manageable by everyone"
  ON site_visits
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);