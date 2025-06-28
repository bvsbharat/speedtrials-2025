/*
  # Create Additional SDWIS Tables

  1. New Tables
    - `geographic_areas`
      - Geographic service areas for water systems
    - `site_visits`
      - Inspection and site visit records

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access
    - Add policies for authenticated users to manage data
*/

-- Geographic Areas Table
CREATE TABLE IF NOT EXISTS geographic_areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pwsid text NOT NULL REFERENCES water_systems(pwsid) ON DELETE CASCADE,
  geo_id text NOT NULL,
  area_type_code text,
  city_served text,
  county_served text,
  state_served text DEFAULT 'GA',
  zip_code_served text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(pwsid, geo_id)
);

ALTER TABLE geographic_areas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Geographic areas are viewable by everyone"
  ON geographic_areas
  FOR SELECT
  USING (true);

CREATE POLICY "Geographic areas are manageable by authenticated users"
  ON geographic_areas
  FOR ALL
  TO authenticated
  USING (true);

-- Site Visits Table
CREATE TABLE IF NOT EXISTS site_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pwsid text NOT NULL REFERENCES water_systems(pwsid) ON DELETE CASCADE,
  visit_id text NOT NULL,
  visit_date date,
  visit_reason_code text,
  overall_rating text DEFAULT 'N',
  findings text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(pwsid, visit_id)
);

ALTER TABLE site_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site visits are viewable by everyone"
  ON site_visits
  FOR SELECT
  USING (true);

CREATE POLICY "Site visits are manageable by authenticated users"
  ON site_visits
  FOR ALL
  TO authenticated
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_geographic_areas_pwsid ON geographic_areas(pwsid);
CREATE INDEX IF NOT EXISTS idx_geographic_areas_area_type ON geographic_areas(area_type_code);
CREATE INDEX IF NOT EXISTS idx_geographic_areas_county ON geographic_areas(county_served);

CREATE INDEX IF NOT EXISTS idx_site_visits_pwsid ON site_visits(pwsid);
CREATE INDEX IF NOT EXISTS idx_site_visits_date ON site_visits(visit_date);
CREATE INDEX IF NOT EXISTS idx_site_visits_rating ON site_visits(overall_rating);