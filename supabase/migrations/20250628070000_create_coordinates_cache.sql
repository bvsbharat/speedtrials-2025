-- Create coordinates cache table for storing geocoded locations
CREATE TABLE IF NOT EXISTS coordinates_cache (
  id SERIAL PRIMARY KEY,
  location_key TEXT UNIQUE NOT NULL, -- Combination of county, city, name for unique identification
  county TEXT,
  city TEXT,
  name TEXT,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  source TEXT DEFAULT 'google_maps', -- Source of coordinates (google_maps, manual, etc.)
  confidence_score DECIMAL(3, 2) DEFAULT 1.0, -- Confidence in the geocoding result (0.0 to 1.0)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_coordinates_cache_location_key ON coordinates_cache(location_key);
CREATE INDEX IF NOT EXISTS idx_coordinates_cache_county ON coordinates_cache(county);
CREATE INDEX IF NOT EXISTS idx_coordinates_cache_city ON coordinates_cache(city);

-- Enable RLS (Row Level Security)
ALTER TABLE coordinates_cache ENABLE ROW LEVEL SECURITY;

-- Create policy to allow read access to all users
CREATE POLICY "Allow read access to coordinates_cache" ON coordinates_cache
  FOR SELECT USING (true);

-- Create policy to allow insert/update for authenticated users
CREATE POLICY "Allow insert/update to coordinates_cache" ON coordinates_cache
  FOR ALL USING (true);

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_coordinates_cache_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update the updated_at field
CREATE TRIGGER update_coordinates_cache_updated_at_trigger
  BEFORE UPDATE ON coordinates_cache
  FOR EACH ROW
  EXECUTE FUNCTION update_coordinates_cache_updated_at();

-- Insert some initial Georgia coordinates from the existing hardcoded data
INSERT INTO coordinates_cache (location_key, county, city, name, latitude, longitude, source, confidence_score) VALUES
  ('SAVANNAH_SAVANNAH_', 'SAVANNAH', 'SAVANNAH', '', 32.0835, -81.0998, 'manual', 1.0),
  ('FULTON__', 'FULTON', '', '', 33.749, -84.388, 'manual', 1.0),
  ('GWINNETT__', 'GWINNETT', '', '', 33.9526, -84.0807, 'manual', 1.0),
  ('COBB__', 'COBB', '', '', 33.8839, -84.5144, 'manual', 1.0),
  ('DEKALB__', 'DEKALB', '', '', 33.7673, -84.2806, 'manual', 1.0),
  ('CLAYTON__', 'CLAYTON', '', '', 33.5404, -84.3733, 'manual', 1.0),
  ('RICHMOND__', 'RICHMOND', '', '', 33.4735, -82.0105, 'manual', 1.0),
  ('CHATHAM__', 'CHATHAM', '', '', 32.0835, -81.0998, 'manual', 1.0),
  ('MUSCOGEE__', 'MUSCOGEE', '', '', 32.4609, -84.9877, 'manual', 1.0),
  ('BIBB__', 'BIBB', '', '', 32.8407, -83.6324, 'manual', 1.0)
ON CONFLICT (location_key) DO NOTHING;