import { supabase, WaterSystemDB, ViolationDB, SampleResultDB, FacilityDB } from '../lib/supabase';
import { WaterSystem, Violation, SampleResult } from '../types/sdwis';

export class SupabaseService {
  // Data transformation helpers
  static transformWaterSystem(dbSystem: WaterSystemDB): WaterSystem {
    return {
      pwsid: dbSystem.pwsid,
      name: dbSystem.pws_name,
      type: dbSystem.pws_type_code as 'CWS' | 'TNCWS' | 'NTNCWS',
      status: 'A' as 'A' | 'I' | 'N' | 'M' | 'P',
      populationServed: dbSystem.population_served_count,
      ownerType: dbSystem.owner_type_code as 'F' | 'L' | 'M' | 'N' | 'P' | 'S',
      primarySource: dbSystem.primary_source_code as 'GW' | 'SW' | 'GU',
      city: dbSystem.city_name,
      county: dbSystem.county_served,
      state: dbSystem.state_code,
      zipCode: dbSystem.zip_code,
      lastReported: dbSystem.last_reported_date,
      complianceStatus: dbSystem.compliance_status as 'compliant' | 'violation' | 'critical'
    };
  }

  static transformViolation(dbViolation: ViolationDB): Violation {
    return {
      id: dbViolation.violation_id,
      pwsid: dbViolation.pwsid,
      systemName: '', // Will be populated by join
      violationCode: dbViolation.violation_code,
      violationType: dbViolation.violation_category_code,
      category: dbViolation.violation_category_code as 'MCL' | 'MRDL' | 'TT' | 'MR' | 'MON' | 'RPT',
      contaminant: dbViolation.contaminant_code,
      beginDate: dbViolation.non_compl_per_begin_date,
      endDate: dbViolation.non_compl_per_end_date,
      status: dbViolation.violation_status as 'Resolved' | 'Archived' | 'Addressed' | 'Unaddressed',
      isHealthBased: dbViolation.is_health_based_ind,
      isMajor: dbViolation.is_major_viol_ind,
      description: dbViolation.description
    };
  }

  static transformSampleResult(dbSample: SampleResultDB): SampleResult {
    return {
      id: dbSample.sample_id,
      pwsid: dbSample.pwsid,
      contaminant: dbSample.contaminant_code,
      result: dbSample.sample_measure,
      unit: dbSample.unit_of_measure,
      sampleDate: dbSample.sampling_start_date,
      mcl: dbSample.mcl,
      exceedsMcl: dbSample.exceeds_mcl
    };
  }

  // Water Systems
  static async getWaterSystems(filters?: {
    searchTerm?: string;
    systemType?: string;
    ownerType?: string;
    sourceType?: string;
    complianceStatus?: string;
    county?: string;
    dateRange?: { start: string; end: string };
    page?: number;
    limit?: number;
  }): Promise<{ data: WaterSystem[]; total: number; hasMore: boolean }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 25;
    const offset = (page - 1) * limit;

    let query = supabase.from('water_systems').select('*', { count: 'exact' });
    
    if (filters?.searchTerm) {
      query = query.or(`pws_name.ilike.%${filters.searchTerm}%,pwsid.ilike.%${filters.searchTerm}%,city_served.ilike.%${filters.searchTerm}%,county_served.ilike.%${filters.searchTerm}%`);
    }
    if (filters?.systemType) {
      query = query.eq('pws_type_code', filters.systemType);
    }
    if (filters?.ownerType) {
      query = query.eq('owner_type_code', filters.ownerType);
    }
    if (filters?.sourceType) {
      query = query.eq('primary_source_code', filters.sourceType);
    }
    if (filters?.complianceStatus) {
      query = query.eq('compliance_status', filters.complianceStatus);
    }
    if (filters?.county) {
      query = query.eq('county_served', filters.county);
    }
    if (filters?.dateRange) {
      query = query.gte('last_reported_date', filters.dateRange.start)
                   .lte('last_reported_date', filters.dateRange.end);
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;
    
    const total = count || 0;
    const hasMore = offset + limit < total;
    
    return {
      data: data ? data.map(this.transformWaterSystem) : [],
      total,
      hasMore
    };
  }

  static async getWaterSystemById(pwsid: string) {
    const { data, error } = await supabase
      .from('water_systems')
      .select('*')
      .eq('pwsid', pwsid)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async createWaterSystem(system: Omit<WaterSystemDB, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('water_systems')
      .insert(system)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateWaterSystem(pwsid: string, updates: Partial<WaterSystemDB>) {
    const { data, error } = await supabase
      .from('water_systems')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('pwsid', pwsid)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Violations
  static async getViolations(filters?: {
    pwsid?: string;
    status?: string;
    category?: string;
    isHealthBased?: boolean;
    dateRange?: { start: string; end: string };
    page?: number;
    limit?: number;
  }): Promise<{ data: Violation[]; total: number; hasMore: boolean }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 25;
    const offset = (page - 1) * limit;

    // First, test basic table access
    console.log('Testing basic table access...');
    const { data: basicTest, error: basicError, count: basicCount } = await supabase
      .from('violations')
      .select('*', { count: 'exact' })
      .limit(3);
    console.log('Basic table test:', { 
      hasData: !!basicTest?.length, 
      count: basicCount, 
      error: basicError,
      sample: basicTest?.[0]
    });

    let query = supabase.from('violations').select(`
      *
    `, { count: 'exact' });
    
    if (filters?.pwsid) {
      query = query.eq('pwsid', filters.pwsid);
    }
    if (filters?.status && filters.status !== 'all') {
      query = query.eq('violation_status', filters.status);
    }
    if (filters?.category && filters.category !== 'all') {
      query = query.eq('violation_category_code', filters.category);
    }
    if (filters?.isHealthBased !== undefined) {
      query = query.eq('is_health_based_ind', filters.isHealthBased);
    }
    if (filters?.dateRange) {
      query = query.gte('non_compl_per_begin_date', filters.dateRange.start)
                   .lte('non_compl_per_begin_date', filters.dateRange.end);
    }

    query = query.range(offset, offset + limit - 1).order('non_compl_per_begin_date', { ascending: false });

    const { data, error, count } = await query;
    console.log('Violations query result:', { data: data?.length, error, count, filters });
    console.log('First few violations:', data?.slice(0, 3));
    
    // Debug: Check what actual values exist in the database
    if (filters?.status && filters.status !== 'all') {
      const { data: statusCheck } = await supabase
        .from('violations')
        .select('violation_status')
        .limit(10);
      console.log('Available status values in DB:', [...new Set(statusCheck?.map(v => v.violation_status))]);
    }
    
    if (filters?.category && filters.category !== 'all') {
      const { data: categoryCheck } = await supabase
        .from('violations')
        .select('violation_category_code')
        .limit(10);
      console.log('Available category values in DB:', [...new Set(categoryCheck?.map(v => v.violation_category_code))]);
    }
    
    // Test basic connection
    if (!data || data.length === 0) {
      console.log('No data found with filters, testing basic connection...');
      const { data: testData, error: testError, count: testCount } = await supabase
        .from('violations')
        .select('*', { count: 'exact' })
        .limit(5);
      console.log('Basic violations test:', { 
        testData: testData?.length, 
        testError, 
        testCount,
        sampleData: testData?.slice(0, 2)
      });
      
      // Also test if table exists by checking schema
      const { data: tableInfo, error: schemaError } = await supabase
        .from('violations')
        .select('pwsid')
        .limit(1);
      console.log('Table schema test:', { tableExists: !schemaError, schemaError });
    }
    if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }
    
    const total = count || 0;
    const hasMore = offset + limit < total;
    
    // Fetch water system names separately since join isn't working
    const transformedData = [];
    if (data && data.length > 0) {
      const pwsids = [...new Set(data.map(item => item.pwsid))];
      const { data: waterSystems } = await supabase
        .from('water_systems')
        .select('pwsid, pws_name')
        .in('pwsid', pwsids);
      
      const waterSystemMap = new Map();
      if (waterSystems) {
        waterSystems.forEach(ws => {
          waterSystemMap.set(ws.pwsid, ws.pws_name);
        });
      }
      
      for (const item of data) {
        const violation = this.transformViolation(item);
        violation.systemName = waterSystemMap.get(item.pwsid) || 'Unknown System';
        transformedData.push(violation);
      }
    }
    
    // Simplified stats query for debugging
    console.log('Fetching stats...');
    const { data: allViolations, error: allError, count: allCount } = await supabase
      .from('violations')
      .select('violation_status, is_health_based_ind', { count: 'exact' });
    
    console.log('All violations for stats:', { 
      count: allCount, 
      dataLength: allViolations?.length, 
      error: allError,
      sample: allViolations?.slice(0, 3)
    });

    const stats = {
      total: allCount || 0,
      unaddressed: allViolations?.filter(v => v.violation_status === 'Unaddressed').length || 0,
      resolved: allViolations?.filter(v => v.violation_status === 'Resolved').length || 0,
      healthBased: allViolations?.filter(v => v.is_health_based_ind === true).length || 0
    };
    
    console.log('Calculated stats:', stats);
    
    return {
      data: transformedData,
      total,
      hasMore,
      stats
    };
  }

  static async createViolation(violation: Omit<ViolationDB, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('violations')
      .insert(violation)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Sample Results
  static async getSampleResults(filters?: {
    pwsid?: string;
    contaminant?: string;
    exceedsMcl?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ data: SampleResult[]; total: number; hasMore: boolean }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 25;
    const offset = (page - 1) * limit;

    let query = supabase.from('sample_results').select('*', { count: 'exact' });
    
    if (filters?.pwsid) {
      query = query.eq('pwsid', filters.pwsid);
    }
    if (filters?.contaminant) {
      query = query.eq('contaminant_code', filters.contaminant);
    }
    if (filters?.exceedsMcl !== undefined) {
      query = query.eq('exceeds_mcl', filters.exceedsMcl);
    }

    query = query.range(offset, offset + limit - 1).order('sampling_start_date', { ascending: false });

    const { data, error, count } = await query;
    if (error) throw error;
    
    const total = count || 0;
    const hasMore = offset + limit < total;
    
    return {
      data: data ? data.map(this.transformSampleResult) : [],
      total,
      hasMore
    };
  }

  // Analytics and Dashboard Methods
  static async getDashboardStats() {
    try {
      // Get water systems stats
      const { data: systemsData, error: systemsError } = await supabase
        .from('water_systems')
        .select('compliance_status, population_served_count, pws_type_code');
      
      if (systemsError) throw systemsError;

      // Get violations stats
      const { data: violationsData, error: violationsError } = await supabase
        .from('violations')
        .select('violation_status, is_health_based_ind, is_major_viol_ind');
      
      if (violationsError) throw violationsError;

      // Calculate statistics
      const totalSystems = systemsData?.length || 0;
      const compliantSystems = systemsData?.filter(s => s.compliance_status === 'compliant').length || 0;
      const violationSystems = systemsData?.filter(s => s.compliance_status === 'violation').length || 0;
      const criticalSystems = systemsData?.filter(s => s.compliance_status === 'critical').length || 0;
      const totalPopulation = systemsData?.reduce((sum, s) => sum + (s.population_served_count || 0), 0) || 0;

      const totalViolations = violationsData?.length || 0;
      const unaddressedViolations = violationsData?.filter(v => v.violation_status === 'Unaddressed').length || 0;
      const healthBasedViolations = violationsData?.filter(v => v.is_health_based_ind).length || 0;
      const resolvedViolations = violationsData?.filter(v => v.violation_status === 'Resolved').length || 0;

      // System type distribution
      const systemTypes = {
        CWS: systemsData?.filter(s => s.pws_type_code === 'CWS').length || 0,
        TNCWS: systemsData?.filter(s => s.pws_type_code === 'TNCWS').length || 0,
        NTNCWS: systemsData?.filter(s => s.pws_type_code === 'NTNCWS').length || 0
      };

      return {
        systems: {
          total: totalSystems,
          compliant: compliantSystems,
          violation: violationSystems,
          critical: criticalSystems,
          totalPopulation,
          types: systemTypes
        },
        violations: {
          total: totalViolations,
          unaddressed: unaddressedViolations,
          healthBased: healthBasedViolations,
          resolved: resolvedViolations
        }
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  // Compliance Analysis
  static async getComplianceAnalysis(page: number = 1, limit: number = 25) {
    try {
      const offset = (page - 1) * limit;
      
      const { data, error, count } = await supabase
        .from('water_system_analysis')
        .select('*', { count: 'exact' })
        .range(offset, offset + limit - 1)
        .order('total_violations', { ascending: false });
      
      if (error) throw error;
      
      const total = count || 0;
      const hasMore = offset + limit < total;
      
      return {
        data: data || [],
        total,
        hasMore
      };
    } catch (error) {
      console.error('Error fetching compliance analysis:', error);
      throw error;
    }
  }

  // Violation Trends
  static async getViolationTrends(months: number = 12) {
    try {
      const { data, error } = await supabase
        .from('violations')
        .select('non_compl_per_begin_date, violation_category_code, is_health_based_ind')
        .gte('non_compl_per_begin_date', new Date(Date.now() - months * 30 * 24 * 60 * 60 * 1000).toISOString());
      
      if (error) throw error;

      // Group by month
      const monthlyData = data?.reduce((acc, violation) => {
        const month = new Date(violation.non_compl_per_begin_date).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short' 
        });
        
        if (!acc[month]) {
          acc[month] = { month, total: 0, healthBased: 0 };
        }
        
        acc[month].total++;
        if (violation.is_health_based_ind) {
          acc[month].healthBased++;
        }
        
        return acc;
      }, {} as Record<string, { month: string; total: number; healthBased: number }>);

      return Object.values(monthlyData || {}).sort((a, b) => 
        new Date(a.month).getTime() - new Date(b.month).getTime()
      );
    } catch (error) {
      console.error('Error fetching violation trends:', error);
      throw error;
    }
  }

  // Contaminant Analysis
  static async getContaminantAnalysis() {
    try {
      const { data, error } = await supabase
        .from('violations_with_samples')
        .select('*')
        .not('contaminant_code', 'is', null);
      
      if (error) throw error;

      // Group by contaminant
      const contaminantData = data?.reduce((acc, item) => {
        const contaminant = item.contaminant_code;
        if (!acc[contaminant]) {
          acc[contaminant] = {
            contaminant,
            violations: 0,
            samples: 0,
            exceedances: 0,
            systems: new Set()
          };
        }
        
        acc[contaminant].violations++;
        if (item.sample_measure) {
          acc[contaminant].samples++;
          if (item.exceeds_mcl) {
            acc[contaminant].exceedances++;
          }
        }
        acc[contaminant].systems.add(item.pwsid);
        
        return acc;
      }, {} as Record<string, any>);

      return Object.values(contaminantData || {}).map(item => ({
        ...item,
        systemsAffected: item.systems.size,
        systems: undefined // Remove Set object
      }));
    } catch (error) {
      console.error('Error fetching contaminant analysis:', error);
      throw error;
    }
  }

  static async createSampleResult(sample: Omit<SampleResultDB, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('sample_results')
      .insert(sample)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Facilities
  static async getFacilities(filters?: {
    pwsid?: string;
    facilityType?: string;
    active?: boolean;
    limit?: number;
  }) {
    let query = supabase.from('facilities').select('*');
    
    if (filters?.pwsid) {
      query = query.eq('pwsid', filters.pwsid);
    }
    if (filters?.facilityType) {
      query = query.eq('facility_type_code', filters.facilityType);
    }
    if (filters?.active !== undefined) {
      query = query.eq('facility_activity_code', filters.active ? 'A' : 'I');
    }
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  // Bulk operations for data import
  static async bulkInsertWaterSystems(systems: Omit<WaterSystemDB, 'id' | 'created_at' | 'updated_at'>[]) {
    const { data, error } = await supabase
      .from('water_systems')
      .insert(systems)
      .select();
    
    if (error) throw error;
    return data;
  }

  static async bulkInsertViolations(violations: Omit<ViolationDB, 'id' | 'created_at' | 'updated_at'>[]) {
    const { data, error } = await supabase
      .from('violations')
      .insert(violations)
      .select();
    
    if (error) throw error;
    return data;
  }

  static async bulkInsertSampleResults(samples: Omit<SampleResultDB, 'id' | 'created_at' | 'updated_at'>[]) {
    const { data, error } = await supabase
      .from('sample_results')
      .insert(samples)
      .select();
    
    if (error) throw error;
    return data;
  }

  // Analytics and reporting
  static async getComplianceStats() {
    const { data, error } = await supabase
      .from('water_systems')
      .select('compliance_status')
      .then(result => {
        if (result.error) throw result.error;
        
        const stats = result.data.reduce((acc, system) => {
          acc[system.compliance_status] = (acc[system.compliance_status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        return { data: stats, error: null };
      });
    
    if (error) throw error;
    return data;
  }

  // Test database connection
  static async testConnection(): Promise<{ success: boolean; message: string; tableCount?: number }> {
    try {
      console.log('Testing Supabase connection...');
      
      // First test basic connection
      const { data, error, count } = await supabase
        .from('water_systems')
        .select('*', { count: 'exact' })
        .limit(5);
      
      console.log('Supabase query result:', { data, error, count });
      
      if (error) {
        console.error('Supabase error:', error);
        return {
          success: false,
          message: `Database connection failed: ${error.message}`,
          tableCount: 0
        };
      }
      
      console.log(`Found ${count} water systems in database`);
      if (data && data.length > 0) {
        console.log('Sample water system:', data[0]);
      }
      
      return {
        success: true,
        message: 'Database connection successful',
        tableCount: count || 0
      };
    } catch (error) {
      console.error('Connection test exception:', error);
      return {
        success: false,
        message: `Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        tableCount: 0
      };
    }
  }

}