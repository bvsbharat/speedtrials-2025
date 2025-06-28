-- Create ref_code_values table
CREATE TABLE IF NOT EXISTS ref_code_values (
  id BIGSERIAL PRIMARY KEY,
  value_type VARCHAR(50) NOT NULL,
  value_code VARCHAR(50) NOT NULL,
  value_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Composite unique constraint
  CONSTRAINT ref_code_values_unique UNIQUE (value_type, value_code)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_ref_code_values_value_type ON ref_code_values(value_type);
CREATE INDEX IF NOT EXISTS idx_ref_code_values_value_code ON ref_code_values(value_code);
CREATE INDEX IF NOT EXISTS idx_ref_code_values_composite ON ref_code_values(value_type, value_code);

-- Enable Row Level Security
ALTER TABLE ref_code_values ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable read access for all users" ON ref_code_values
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON ref_code_values
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON ref_code_values
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON ref_code_values
  FOR DELETE USING (auth.role() = 'authenticated');

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ref_code_values_updated_at 
  BEFORE UPDATE ON ref_code_values 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE ref_code_values IS 'Reference codes and their descriptions used throughout the SDWA system';
COMMENT ON COLUMN ref_code_values.value_type IS 'Type or category of the reference code (e.g., VIOLATION_CODE, CONTAMINANT_CODE)';
COMMENT ON COLUMN ref_code_values.value_code IS 'The actual code value';
COMMENT ON COLUMN ref_code_values.value_description IS 'Human-readable description of what the code represents';