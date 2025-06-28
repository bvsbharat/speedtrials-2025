/*
  # Temporarily disable foreign key constraints for CSV uploads

  This allows uploading data in any order without foreign key constraint violations.
  The constraints will be re-enabled after all data is uploaded.
*/

-- Temporarily drop the foreign key constraint on violations table
ALTER TABLE violations DROP CONSTRAINT IF EXISTS violations_pwsid_fkey;

-- Add a comment to remember to re-enable it later
COMMENT ON TABLE violations IS 'Foreign key constraint temporarily disabled for CSV uploads. Re-enable after data upload is complete.';