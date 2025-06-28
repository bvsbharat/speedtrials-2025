/*
  # Create Facilities Schema

  1. New Tables
    - `facilities`
      - `id` (uuid, primary key)
      - `pwsid` (text, foreign key)
      - `facility_id` (text)
      - `facility_name` (text)
      - `facility_type_code` (text)
      - `facility_activity_code` (text)
      - `water_type_code` (text)
      - `latitude` (decimal)
      - `longitude` (decimal)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `facilities` table
    - Add policy for public read access
    - Add policy for authenticated users to manage data
*/

CREATE TABLE IF NOT EXISTS facilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pwsid text NOT NULL REFERENCES water_systems(pwsid) ON DELETE CASCADE,
  facility_id text NOT NULL,
  facility_name text,
  facility_type_code text NOT NULL,
  facility_activity_code text DEFAULT 'A',
  water_type_code text,
  latitude decimal,
  longitude decimal,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(pwsid, facility_id)
);

ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Facilities are viewable by everyone"
  ON facilities
  FOR SELECT
  USING (true);

CREATE POLICY "Facilities are manageable by authenticated users"
  ON facilities
  FOR ALL
  TO authenticated
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_facilities_pwsid ON facilities(pwsid);
CREATE INDEX IF NOT EXISTS idx_facilities_type ON facilities(facility_type_code);
CREATE INDEX IF NOT EXISTS idx_facilities_activity ON facilities(facility_activity_code);
CREATE INDEX IF NOT EXISTS idx_facilities_location ON facilities(latitude, longitude);