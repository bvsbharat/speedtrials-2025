-- Create events_milestones table
CREATE TABLE IF NOT EXISTS events_milestones (
  id BIGSERIAL PRIMARY KEY,
  pwsid VARCHAR(15) NOT NULL,
  event_schedule_id VARCHAR(50) NOT NULL,
  event_end_date DATE,
  event_actual_date DATE,
  event_comments_text TEXT,
  event_milestone_code VARCHAR(20),
  event_reason_code VARCHAR(20),
  first_reported_date DATE,
  last_reported_date DATE,
  submission_year_quarter VARCHAR(10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Composite unique constraint
  CONSTRAINT events_milestones_unique UNIQUE (pwsid, event_schedule_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_events_milestones_pwsid ON events_milestones(pwsid);
CREATE INDEX IF NOT EXISTS idx_events_milestones_event_schedule_id ON events_milestones(event_schedule_id);
CREATE INDEX IF NOT EXISTS idx_events_milestones_event_milestone_code ON events_milestones(event_milestone_code);
CREATE INDEX IF NOT EXISTS idx_events_milestones_event_reason_code ON events_milestones(event_reason_code);
CREATE INDEX IF NOT EXISTS idx_events_milestones_submission_year_quarter ON events_milestones(submission_year_quarter);
CREATE INDEX IF NOT EXISTS idx_events_milestones_event_end_date ON events_milestones(event_end_date);
CREATE INDEX IF NOT EXISTS idx_events_milestones_event_actual_date ON events_milestones(event_actual_date);

-- Enable Row Level Security
ALTER TABLE events_milestones ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable read access for all users" ON events_milestones
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON events_milestones
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON events_milestones
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON events_milestones
  FOR DELETE USING (auth.role() = 'authenticated');

-- Add conditional foreign key constraint (only if public_water_systems table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'public_water_systems') THEN
    ALTER TABLE events_milestones 
    ADD CONSTRAINT fk_events_milestones_pwsid 
    FOREIGN KEY (pwsid) REFERENCES public_water_systems(pwsid) ON DELETE CASCADE;
  END IF;
END $$;

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_events_milestones_updated_at 
  BEFORE UPDATE ON events_milestones 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE events_milestones IS 'Water system events and milestone tracking data';
COMMENT ON COLUMN events_milestones.pwsid IS 'Public Water System ID';
COMMENT ON COLUMN events_milestones.event_schedule_id IS 'Unique identifier for the event schedule';
COMMENT ON COLUMN events_milestones.event_end_date IS 'Scheduled end date for the event';
COMMENT ON COLUMN events_milestones.event_actual_date IS 'Actual completion date of the event';
COMMENT ON COLUMN events_milestones.event_comments_text IS 'Comments or notes about the event';
COMMENT ON COLUMN events_milestones.event_milestone_code IS 'Code identifying the type of milestone';
COMMENT ON COLUMN events_milestones.event_reason_code IS 'Code identifying the reason for the event';
COMMENT ON COLUMN events_milestones.submission_year_quarter IS 'Year and quarter when data was submitted (e.g., 2025Q1)';