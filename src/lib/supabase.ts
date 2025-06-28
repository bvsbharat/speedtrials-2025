import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase config:', { 
  url: supabaseUrl ? 'Set' : 'Missing', 
  key: supabaseAnonKey ? 'Set' : 'Missing' 
});

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types based on SDWIS schema
export interface WaterSystemDB {
  id?: number;
  pwsid: string;
  pws_name: string;
  pws_type_code: string;
  population_served_count: number;
  owner_type_code: string;
  primary_source_code: string;
  city_name: string;
  county_served: string;
  state_code: string;
  zip_code: string;
  latitude?: number;
  longitude?: number;
  compliance_status: string;
  last_reported_date: string;
  created_at?: string;
  updated_at?: string;
}

export interface ViolationDB {
  id?: number;
  pwsid: string;
  violation_id: string;
  violation_code: string;
  violation_category_code: string;
  contaminant_code?: string;
  non_compl_per_begin_date: string;
  non_compl_per_end_date?: string;
  violation_status: string;
  is_health_based_ind: boolean;
  is_major_viol_ind: boolean;
  description: string;
  created_at?: string;
  updated_at?: string;
}

export interface SampleResultDB {
  id?: number;
  pwsid: string;
  sample_id: string;
  contaminant_code: string;
  sample_measure: number;
  unit_of_measure: string;
  sampling_start_date: string;
  sampling_end_date: string;
  mcl?: number;
  exceeds_mcl: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface FacilityDB {
  id?: number;
  pwsid: string;
  facility_id: string;
  facility_name: string;
  facility_type_code: string;
  facility_activity_code: string;
  water_type_code?: string;
  latitude?: number;
  longitude?: number;
  created_at?: string;
  updated_at?: string;
}