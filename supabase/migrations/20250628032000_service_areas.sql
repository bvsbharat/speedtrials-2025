-- Create service_areas table
CREATE TABLE IF NOT EXISTS service_areas (
  id BIGSERIAL PRIMARY KEY,
  pwsid TEXT NOT NULL,
  service_area_type_code TEXT NOT NULL,
  is_primary_service_area BOOLEAN DEFAULT false,
  first_reported_date DATE,
  last_reported_date DATE,
  submission_year_quarter TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Composite unique constraint
  CONSTRAINT unique_service_area UNIQUE (pwsid, service_area_type_code)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_service_areas_pwsid ON service_areas(pwsid);
CREATE INDEX IF NOT EXISTS idx_service_areas_type ON service_areas(service_area_type_code);
CREATE INDEX IF NOT EXISTS idx_service_areas_primary ON service_areas(is_primary_service_area);
CREATE INDEX IF NOT EXISTS idx_service_areas_quarter ON service_areas(submission_year_quarter);

-- Enable Row Level Security
ALTER TABLE service_areas ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
CREATE POLICY "Allow anonymous read access to service_areas" ON service_areas
  FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anonymous insert access to service_areas" ON service_areas
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anonymous update access to service_areas" ON service_areas
  FOR UPDATE TO anon USING (true);

CREATE POLICY "Allow anonymous delete access to service_areas" ON service_areas
  FOR DELETE TO anon USING (true);

-- Add foreign key constraint to public_water_systems if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'public_water_systems') THEN
    ALTER TABLE service_areas 
    ADD CONSTRAINT fk_service_areas_pwsid 
    FOREIGN KEY (pwsid) REFERENCES public_water_systems(pwsid) ON DELETE CASCADE;
  END IF;
END $$;