/*
  # Create Violations Schema

  1. New Tables
    - `violations`
      - `id` (uuid, primary key)
      - `pwsid` (text, foreign key)
      - `violation_id` (text, unique)
      - `violation_code` (text)
      - `violation_category_code` (text)
      - `contaminant_code` (text)
      - `non_compl_per_begin_date` (date)
      - `non_compl_per_end_date` (date)
      - `violation_status` (text)
      - `is_health_based_ind` (boolean)
      - `is_major_viol_ind` (boolean)
      - `description` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `violations` table
    - Add policy for public read access
    - Add policy for authenticated users to manage data
*/

CREATE TABLE IF NOT EXISTS violations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pwsid text NOT NULL REFERENCES water_systems(pwsid) ON DELETE CASCADE,
  violation_id text UNIQUE NOT NULL,
  violation_code text NOT NULL,
  violation_category_code text,
  contaminant_code text,
  non_compl_per_begin_date date NOT NULL,
  non_compl_per_end_date date,
  violation_status text DEFAULT 'Unaddressed',
  is_health_based_ind boolean DEFAULT false,
  is_major_viol_ind boolean DEFAULT false,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE violations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Violations are viewable by everyone"
  ON violations
  FOR SELECT
  USING (true);

CREATE POLICY "Violations are manageable by authenticated users"
  ON violations
  FOR ALL
  TO authenticated
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_violations_pwsid ON violations(pwsid);
CREATE INDEX IF NOT EXISTS idx_violations_status ON violations(violation_status);
CREATE INDEX IF NOT EXISTS idx_violations_health_based ON violations(is_health_based_ind);
CREATE INDEX IF NOT EXISTS idx_violations_begin_date ON violations(non_compl_per_begin_date);