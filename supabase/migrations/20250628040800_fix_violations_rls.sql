/*
  # Fix RLS policies for violations table

  The violations table currently has restrictive RLS policies that only allow
  authenticated users to insert/update/delete. This prevents anonymous CSV uploads.
  We need to allow all operations for everyone to enable CSV uploads.
*/

-- Drop existing policies
DROP POLICY IF EXISTS "violations_select_policy" ON "public"."violations";
DROP POLICY IF EXISTS "violations_insert_policy" ON "public"."violations";
DROP POLICY IF EXISTS "violations_update_policy" ON "public"."violations";
DROP POLICY IF EXISTS "violations_delete_policy" ON "public"."violations";
DROP POLICY IF EXISTS "violations_public_access" ON "public"."violations";

-- Create a single permissive policy for all operations
CREATE POLICY "violations_public_access" ON "public"."violations"
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);