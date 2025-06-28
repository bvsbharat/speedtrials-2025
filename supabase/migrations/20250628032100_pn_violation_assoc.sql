-- Create pn_violation_assoc table
CREATE TABLE IF NOT EXISTS pn_violation_assoc (
  id BIGSERIAL PRIMARY KEY,
  pwsid TEXT NOT NULL,
  pn_violation_id TEXT NOT NULL,
  related_violation_id TEXT,
  compl_per_begin_date DATE,
  compl_per_end_date DATE,
  non_compl_per_begin_date DATE,
  non_compl_per_end_date DATE,
  violation_code TEXT,
  contaminant_code TEXT,
  first_reported_date DATE,
  last_reported_date DATE,
  submission_year_quarter TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Composite unique constraint
  CONSTRAINT unique_pn_violation_assoc UNIQUE (pwsid, pn_violation_id, related_violation_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_pn_violation_assoc_pwsid ON pn_violation_assoc(pwsid);
CREATE INDEX IF NOT EXISTS idx_pn_violation_assoc_pn_violation_id ON pn_violation_assoc(pn_violation_id);
CREATE INDEX IF NOT EXISTS idx_pn_violation_assoc_related_violation_id ON pn_violation_assoc(related_violation_id);
CREATE INDEX IF NOT EXISTS idx_pn_violation_assoc_violation_code ON pn_violation_assoc(violation_code);
CREATE INDEX IF NOT EXISTS idx_pn_violation_assoc_contaminant ON pn_violation_assoc(contaminant_code);
CREATE INDEX IF NOT EXISTS idx_pn_violation_assoc_quarter ON pn_violation_assoc(submission_year_quarter);

-- Enable Row Level Security
ALTER TABLE pn_violation_assoc ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
CREATE POLICY "Allow anonymous read access to pn_violation_assoc" ON pn_violation_assoc
  FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anonymous insert access to pn_violation_assoc" ON pn_violation_assoc
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anonymous update access to pn_violation_assoc" ON pn_violation_assoc
  FOR UPDATE TO anon USING (true);

CREATE POLICY "Allow anonymous delete access to pn_violation_assoc" ON pn_violation_assoc
  FOR DELETE TO anon USING (true);

-- Add foreign key constraint to public_water_systems if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'public_water_systems') THEN
    ALTER TABLE pn_violation_assoc 
    ADD CONSTRAINT fk_pn_violation_assoc_pwsid 
    FOREIGN KEY (pwsid) REFERENCES public_water_systems(pwsid) ON DELETE CASCADE;
  END IF;
END $$;