/*
  # Create Water Systems Schema

  1. New Tables
    - `water_systems`
      - `id` (uuid, primary key)
      - `pwsid` (text, unique)
      - `pws_name` (text)
      - `pws_type_code` (text)
      - `population_served_count` (integer)
      - `owner_type_code` (text)
      - `primary_source_code` (text)
      - `city_name` (text)
      - `county_served` (text)
      - `state_code` (text)
      - `zip_code` (text)
      - `latitude` (decimal)
      - `longitude` (decimal)
      - `compliance_status` (text)
      - `last_reported_date` (date)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `water_systems` table
    - Add policy for public read access
    - Add policy for authenticated users to manage data
*/

CREATE TABLE IF NOT EXISTS water_systems (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pwsid text UNIQUE NOT NULL,
  pws_name text NOT NULL,
  pws_type_code text NOT NULL,
  population_served_count integer DEFAULT 0,
  owner_type_code text,
  primary_source_code text,
  city_name text,
  county_served text,
  state_code text DEFAULT 'GA',
  zip_code text,
  latitude decimal,
  longitude decimal,
  compliance_status text DEFAULT 'compliant',
  last_reported_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE water_systems ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Water systems are viewable by everyone"
  ON water_systems
  FOR SELECT
  USING (true);

CREATE POLICY "Water systems are manageable by authenticated users"
  ON water_systems
  FOR ALL
  TO authenticated
  USING (true);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_water_systems_pwsid ON water_systems(pwsid);
CREATE INDEX IF NOT EXISTS idx_water_systems_county ON water_systems(county_served);
CREATE INDEX IF NOT EXISTS idx_water_systems_compliance ON water_systems(compliance_status);
CREATE INDEX IF NOT EXISTS idx_water_systems_location ON water_systems(latitude, longitude);