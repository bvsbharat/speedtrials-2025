/*
  Clean Fix for Foreign Key Relationships
  
  This migration:
  1. Drops conflicting policies safely
  2. Adds proper foreign key constraints
  3. Creates analysis views
*/

-- Clean up any conflicting policies first
DROP POLICY IF EXISTS "Allow all operations for everyone" ON ref_code_values;
DROP POLICY IF EXISTS "ref_code_values_public_access" ON ref_code_values;

-- Create a single comprehensive policy for ref_code_values
CREATE POLICY "ref_code_values_all_access"
  ON ref_code_values
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Add missing foreign key constraints

-- Fix service_areas foreign key (drop and recreate to avoid conflicts)
ALTER TABLE service_areas 
DROP CONSTRAINT IF EXISTS fk_service_areas_pwsid;

ALTER TABLE service_areas 
ADD CONSTRAINT fk_service_areas_pwsid 
FOREIGN KEY (pwsid) REFERENCES water_systems(pwsid) ON DELETE CASCADE;

-- Fix pn_violation_assoc foreign key to water_systems
ALTER TABLE pn_violation_assoc 
DROP CONSTRAINT IF EXISTS fk_pn_violation_assoc_pwsid;

ALTER TABLE pn_violation_assoc 
ADD CONSTRAINT fk_pn_violation_assoc_pwsid 
FOREIGN KEY (pwsid) REFERENCES water_systems(pwsid) ON DELETE CASCADE;

-- Fix events_milestones foreign key
ALTER TABLE events_milestones 
DROP CONSTRAINT IF EXISTS fk_events_milestones_pwsid;

ALTER TABLE events_milestones 
ADD CONSTRAINT fk_events_milestones_pwsid 
FOREIGN KEY (pwsid) REFERENCES water_systems(pwsid) ON DELETE CASCADE;

-- Link pn_violation_assoc to violations via violation_id
ALTER TABLE pn_violation_assoc 
DROP CONSTRAINT IF EXISTS fk_pn_violation_related;

ALTER TABLE pn_violation_assoc 
ADD CONSTRAINT fk_pn_violation_related 
FOREIGN KEY (related_violation_id) REFERENCES violations(violation_id) ON DELETE SET NULL;

-- Create indexes for better query performance on contaminant relationships
CREATE INDEX IF NOT EXISTS idx_violations_contaminant_code ON violations(contaminant_code);
CREATE INDEX IF NOT EXISTS idx_sample_results_contaminant_code ON sample_results(contaminant_code);

-- Create a comprehensive analysis view
CREATE OR REPLACE VIEW water_system_analysis AS
SELECT 
    ws.pwsid,
    ws.pws_name,
    ws.pws_type_code,
    ws.population_served_count,
    COUNT(DISTINCT v.violation_id) as total_violations,
    COUNT(DISTINCT CASE WHEN v.is_health_based_ind = true THEN v.violation_id END) as health_based_violations,
    COUNT(DISTINCT sr.sample_id) as total_samples,
    COUNT(DISTINCT f.facility_id) as total_facilities
FROM water_systems ws
LEFT JOIN violations v ON ws.pwsid = v.pwsid
LEFT JOIN sample_results sr ON ws.pwsid = sr.pwsid
LEFT JOIN facilities f ON ws.pwsid = f.pwsid
GROUP BY ws.pwsid, ws.pws_name, ws.pws_type_code, ws.population_served_count;

-- Create view for violations with related sample data
CREATE OR REPLACE VIEW violations_with_samples AS
SELECT 
    v.pwsid,
    v.violation_id,
    v.violation_code,
    v.contaminant_code,
    v.violation_status,
    v.is_health_based_ind,
    v.non_compl_per_begin_date,
    sr.sample_id,
    sr.sample_measure,
    sr.unit_of_measure,
    sr.mcl,
    sr.exceeds_mcl,
    sr.sampling_start_date,
    ws.pws_name
FROM violations v
LEFT JOIN sample_results sr ON v.pwsid = sr.pwsid AND v.contaminant_code = sr.contaminant_code
LEFT JOIN water_systems ws ON v.pwsid = ws.pwsid;

-- Add helpful comments
COMMENT ON VIEW water_system_analysis IS 'Comprehensive analysis view showing water system statistics';
COMMENT ON VIEW violations_with_samples IS 'View joining violations with related sample results for analysis';