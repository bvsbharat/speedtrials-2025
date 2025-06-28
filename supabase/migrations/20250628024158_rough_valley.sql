/*
  # Create Sample Results Schema

  1. New Tables
    - `sample_results`
      - `id` (uuid, primary key)
      - `pwsid` (text, foreign key)
      - `sample_id` (text)
      - `contaminant_code` (text)
      - `sample_measure` (decimal)
      - `unit_of_measure` (text)
      - `sampling_start_date` (date)
      - `sampling_end_date` (date)
      - `mcl` (decimal)
      - `exceeds_mcl` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `sample_results` table
    - Add policy for public read access
    - Add policy for authenticated users to manage data
*/

CREATE TABLE IF NOT EXISTS sample_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pwsid text NOT NULL REFERENCES water_systems(pwsid) ON DELETE CASCADE,
  sample_id text NOT NULL,
  contaminant_code text NOT NULL,
  sample_measure decimal NOT NULL,
  unit_of_measure text,
  sampling_start_date date NOT NULL,
  sampling_end_date date,
  mcl decimal,
  exceeds_mcl boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE sample_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sample results are viewable by everyone"
  ON sample_results
  FOR SELECT
  USING (true);

CREATE POLICY "Sample results are manageable by authenticated users"
  ON sample_results
  FOR ALL
  TO authenticated
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sample_results_pwsid ON sample_results(pwsid);
CREATE INDEX IF NOT EXISTS idx_sample_results_contaminant ON sample_results(contaminant_code);
CREATE INDEX IF NOT EXISTS idx_sample_results_exceeds_mcl ON sample_results(exceeds_mcl);
CREATE INDEX IF NOT EXISTS idx_sample_results_date ON sample_results(sampling_start_date);