import Papa from 'papaparse';
import { supabase } from '../lib/supabase';
import { SDWISFileMapping, CSVUploadResult, GeocodeResult } from '../types/upload';

export class CSVUploadService {
  private static readonly BATCH_SIZE = 100;
  private static readonly MAX_RETRIES = 3;

  // Define SDWIS file mappings
  static readonly FILE_MAPPINGS: SDWISFileMapping[] = [
    {
      fileName: 'SDWA_PUB_WATER_SYSTEMS.csv',
      tableName: 'water_systems',
      displayName: 'Public Water Systems',
      description: 'Main water system records with basic information',
      requiredColumns: ['PWSID', 'PWS_NAME', 'PWS_TYPE_CODE'],
      uniqueKeyColumn: 'pwsid',
      transform: CSVUploadService.transformWaterSystems
    },
    {
      fileName: 'SDWA_VIOLATIONS_ENFORCEMENT.csv',
      tableName: 'violations',
      displayName: 'Violations & Enforcement',
      description: 'Water system violations and enforcement actions',
      requiredColumns: ['PWSID', 'VIOLATION_ID', 'VIOLATION_CODE'],
      uniqueKeyColumn: 'violation_id',
      transform: CSVUploadService.transformViolations
    },
    {
      fileName: 'SDWA_LCR_SAMPLES.csv',
      tableName: 'sample_results',
      displayName: 'Sample Results',
      description: 'Water quality sample test results',
      requiredColumns: ['PWSID', 'SAMPLE_ID', 'CONTAMINANT_CODE'],
      uniqueKeyColumn: '',
      transform: CSVUploadService.transformSampleResults
    },
    {
      fileName: 'SDWA_FACILITIES.csv',
      tableName: 'facilities',
      displayName: 'Facilities',
      description: 'Water system facilities and infrastructure',
      requiredColumns: ['PWSID', 'FACILITY_ID', 'FACILITY_TYPE_CODE'],
      uniqueKeyColumn: 'pwsid,facility_id',
      transform: CSVUploadService.transformFacilities
    },
    {
      fileName: 'SDWA_GEOGRAPHIC_AREAS.csv',
      tableName: 'geographic_areas',
      displayName: 'Geographic Areas',
      description: 'Geographic service areas for water systems',
      requiredColumns: ['PWSID', 'GEO_ID'],
      uniqueKeyColumn: 'pwsid,geo_id',
      transform: CSVUploadService.transformGeographicAreas
    },
    {
      fileName: 'SDWA_SITE_VISITS.csv',
      tableName: 'site_visits',
      displayName: 'Site Visits',
      description: 'Inspection and site visit records',
      requiredColumns: ['PWSID', 'VISIT_ID'],
      uniqueKeyColumn: 'pwsid,visit_id',
      transform: CSVUploadService.transformSiteVisits
    },
    {
      fileName: 'SDWA_SERVICE_AREAS.csv',
      tableName: 'service_areas',
      displayName: 'Service Areas',
      description: 'Water system service area information',
      requiredColumns: ['PWSID', 'SERVICE_AREA_TYPE_CODE'],
      uniqueKeyColumn: 'pwsid,service_area_type_code',
      transform: CSVUploadService.transformServiceAreas
    },
    {
      fileName: 'SDWA_PN_VIOLATION_ASSOC.csv',
      tableName: 'pn_violation_assoc',
      displayName: 'PN Violation Associations',
      description: 'Public notification violation associations',
      requiredColumns: ['PWSID', 'PN_VIOLATION_ID'],
      uniqueKeyColumn: 'pwsid,pn_violation_id,related_violation_id',
      transform: CSVUploadService.transformPnViolationAssoc
    },
    {
      fileName: 'SDWA_EVENTS_MILESTONES.csv',
      tableName: 'events_milestones',
      displayName: 'Events & Milestones',
      description: 'Water system events and milestone tracking',
      requiredColumns: ['PWSID', 'EVENT_SCHEDULE_ID'],
      uniqueKeyColumn: 'pwsid,event_schedule_id',
      transform: CSVUploadService.transformEventsMilestones
    },
    {
      fileName: 'SDWA_REF_CODE_VALUES.csv',
      tableName: 'ref_code_values',
      displayName: 'Reference Code Values',
      description: 'Reference codes and their descriptions',
      requiredColumns: ['VALUE_TYPE', 'VALUE_CODE'],
      uniqueKeyColumn: 'value_type,value_code',
      transform: CSVUploadService.transformRefCodeValues
    }
  ];

  static async parseCSVFile(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim(),
        complete: (results) => {
          if (results.errors.length > 0) {
            reject(new Error(`CSV parsing errors: ${results.errors.map(e => e.message).join(', ')}`));
          } else {
            resolve(results.data);
          }
        },
        error: (error) => reject(error)
      });
    });
  }

  // Add this method to the CSVUploadService class
  static async validateViolationsData(violations: any[]): Promise<{ valid: any[], invalid: any[], errors: string[] }> {
    const valid: any[] = [];
    const invalid: any[] = [];
    const errors: string[] = [];
  
    // Get all existing water system PWS IDs
    const { data: waterSystems } = await supabase
      .from('water_systems')
      .select('pwsid');
    
    const validPwsids = new Set(waterSystems?.map(ws => ws.pwsid) || []);
  
    violations.forEach((violation, index) => {
      const rowErrors: string[] = [];
  
      // Check required fields
      if (!violation.pwsid) rowErrors.push('Missing PWSID');
      if (!violation.violation_id) rowErrors.push('Missing violation_id');
      if (!violation.violation_code) rowErrors.push('Missing violation_code');
  
      // Check foreign key constraint
      if (violation.pwsid && !validPwsids.has(violation.pwsid)) {
        rowErrors.push(`Invalid PWSID: ${violation.pwsid} not found in water_systems`);
      }
  
      // Check date format
      if (violation.non_compl_per_begin_date && isNaN(Date.parse(violation.non_compl_per_begin_date))) {
        rowErrors.push('Invalid date format for non_compl_per_begin_date');
      }
  
      if (rowErrors.length > 0) {
        invalid.push(violation);
        errors.push(`Row ${index + 1}: ${rowErrors.join(', ')}`);
      } else {
        valid.push(violation);
      }
    });
  
    return { valid, invalid, errors };
  }
  
  // Deduplicate batch based on unique key column
  private static deduplicateBatch(batch: any[], uniqueKeyColumn: string): any[] {
    const seen = new Set();
    const deduplicated: any[] = [];
    
    for (const item of batch) {
      const keyValue = item[uniqueKeyColumn];
      if (keyValue && !seen.has(keyValue)) {
        seen.add(keyValue);
        deduplicated.push(item);
      }
    }
    
    return deduplicated;
  }

  // Update the uploadCSVData method to use validation
  static async uploadCSVData(
    file: File,
    onProgress?: (progress: number, message: string) => void
  ): Promise<{ success: boolean; message: string; errors?: string[] }> {
    try {
      // Find the appropriate mapping for this file
      const mapping = this.FILE_MAPPINGS.find(m => 
        file.name.toLowerCase().includes(m.fileName.toLowerCase().replace('.csv', ''))
      );
  
      if (!mapping) {
        throw new Error(`No mapping found for file: ${file.name}`);
      }
  
      // Parse CSV file
      const rawData = await this.parseCSVFile(file);
      
      if (rawData.length === 0) {
        throw new Error('CSV file is empty');
      }
  
      // Validate required columns
      const firstRow = rawData[0];
      const missingColumns = mapping.requiredColumns.filter(col => !(col in firstRow));
      if (missingColumns.length > 0) {
        throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
      }
  
      // Transform data according to mapping
      const transformedData = mapping.transform(rawData);
      
      // Upload in batches using upsert to handle duplicates
      let insertedRows = 0;
      const errors: string[] = [];
      const totalRows = transformedData.length;
  
      for (let i = 0; i < transformedData.length; i += this.BATCH_SIZE) {
        const batch = transformedData.slice(i, i + this.BATCH_SIZE);
        
        // Deduplicate batch if unique key column is specified
        const deduplicatedBatch = mapping.uniqueKeyColumn 
          ? CSVUploadService.deduplicateBatch(batch, mapping.uniqueKeyColumn)
          : batch;
        
        try {
          const { error } = mapping.uniqueKeyColumn 
            ? await supabase
                .from(mapping.tableName)
                .upsert(deduplicatedBatch, { 
                  onConflict: mapping.uniqueKeyColumn,
                  ignoreDuplicates: false 
                })
            : await supabase
                .from(mapping.tableName)
                .insert(deduplicatedBatch);
  
          if (error) {
            errors.push(`Batch ${Math.floor(i / this.BATCH_SIZE) + 1}: ${error.message}`);
          } else {
            insertedRows += deduplicatedBatch.length;
          }
        } catch (err) {
          errors.push(`Batch ${Math.floor(i / this.BATCH_SIZE) + 1}: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }

        // Report progress
        const processedRows = Math.min(i + this.BATCH_SIZE, totalRows);
        const progress = (processedRows / totalRows) * 100;
        onProgress?.(progress, processedRows, totalRows);
      }
  
      return {
        success: errors.length === 0,
        fileName: file.name,
        totalRows,
        insertedRows,
        errors
      };
  
    } catch (error) {
      return {
        success: false,
        fileName: file.name,
        totalRows: 0,
        insertedRows: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  // Geocoding service for addresses
  static async geocodeAddress(address: string): Promise<GeocodeResult | null> {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
      );
      
      const data = await response.json();
      
      if (data.status === 'OK' && data.results.length > 0) {
        const result = data.results[0];
        return {
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng,
          formatted_address: result.formatted_address
        };
      }
      
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }

  // Data transformation functions
  private static transformWaterSystems(data: any[]): any[] {
    return data.map(row => ({
      pwsid: row.PWSID?.trim(),
      pws_name: row.PWS_NAME?.trim(),
      pws_type_code: row.PWS_TYPE_CODE?.trim(),
      population_served_count: parseInt(row.POPULATION_SERVED_COUNT) || 0,
      owner_type_code: row.OWNER_TYPE_CODE?.trim(),
      primary_source_code: row.PRIMARY_SOURCE_CODE?.trim(),
      city_name: row.CITY_NAME?.trim(),
      county_served: CSVUploadService.extractCountyFromGeographic(row),
      state_code: row.STATE_CODE?.trim() || 'GA',
      zip_code: row.ZIP_CODE?.trim(),
      latitude: CSVUploadService.parseCoordinate(row.LATITUDE),
      longitude: CSVUploadService.parseCoordinate(row.LONGITUDE),
      compliance_status: CSVUploadService.determineComplianceStatus(row),
      last_reported_date: CSVUploadService.parseDate(row.LAST_REPORTED_DATE)
    })).filter(row => row.pwsid); // Filter out rows without PWSID
  }

  private static transformViolations(data: any[]): any[] {
    return data.map(row => ({
      pwsid: row.PWSID?.trim(),
      violation_id: row.VIOLATION_ID?.trim(),
      violation_code: row.VIOLATION_CODE?.trim(),
      violation_category_code: row.VIOLATION_CATEGORY_CODE?.trim(),
      contaminant_code: row.CONTAMINANT_CODE?.trim(),
      non_compl_per_begin_date: CSVUploadService.parseDate(row.NON_COMPL_PER_BEGIN_DATE),
      non_compl_per_end_date: CSVUploadService.parseDate(row.NON_COMPL_PER_END_DATE),
      violation_status: row.VIOLATION_STATUS?.trim() || 'Unaddressed',
      is_health_based_ind: CSVUploadService.parseBoolean(row.IS_HEALTH_BASED_IND),
      is_major_viol_ind: CSVUploadService.parseBoolean(row.IS_MAJOR_VIOL_IND),
      description: CSVUploadService.generateViolationDescription(row)
    })).filter(row => row.pwsid && row.violation_id);
  }

  private static transformSampleResults(data: any[]): any[] {
    return data.map(row => ({
      pwsid: row.PWSID?.trim(),
      sample_id: row.SAMPLE_ID?.trim(),
      contaminant_code: row.CONTAMINANT_CODE?.trim(),
      sample_measure: parseFloat(row.SAMPLE_MEASURE) || 0,
      unit_of_measure: row.UNIT_OF_MEASURE?.trim(),
      sampling_start_date: CSVUploadService.parseDate(row.SAMPLING_START_DATE),
      sampling_end_date: CSVUploadService.parseDate(row.SAMPLING_END_DATE),
      mcl: parseFloat(row.FEDERAL_MCL) || null,
      exceeds_mcl: CSVUploadService.determineExceedsMCL(row)
    })).filter(row => row.pwsid && row.sample_id);
  }

  private static transformFacilities(data: any[]): any[] {
    return data.map(row => ({
      pwsid: row.PWSID?.trim(),
      facility_id: row.FACILITY_ID?.trim(),
      facility_name: row.FACILITY_NAME?.trim(),
      facility_type_code: row.FACILITY_TYPE_CODE?.trim(),
      facility_activity_code: row.FACILITY_ACTIVITY_CODE?.trim() || 'A',
      water_type_code: row.WATER_TYPE_CODE?.trim(),
      latitude: CSVUploadService.parseCoordinate(row.LATITUDE),
      longitude: CSVUploadService.parseCoordinate(row.LONGITUDE)
    })).filter(row => row.pwsid && row.facility_id);
  }

  private static transformGeographicAreas(data: any[]): any[] {
    return data.map(row => ({
      pwsid: row.PWSID?.trim(),
      geo_id: row.GEO_ID?.trim(),
      area_type_code: row.AREA_TYPE_CODE?.trim(),
      city_served: row.CITY_SERVED?.trim(),
      county_served: row.COUNTY_SERVED?.trim(),
      state_served: row.STATE_SERVED?.trim() || 'GA',
      zip_code_served: row.ZIP_CODE_SERVED?.trim()
    })).filter(row => row.pwsid && row.geo_id);
  }

  private static transformSiteVisits(data: any[]): any[] {
    return data.map(row => ({
      pwsid: row.PWSID?.trim(),
      visit_id: row.VISIT_ID?.trim(),
      visit_date: CSVUploadService.parseDate(row.VISIT_DATE),
      visit_reason_code: row.VISIT_REASON_CODE?.trim(),
      overall_rating: CSVUploadService.determineOverallRating(row),
      findings: row.VISIT_COMMENTS?.trim() || 'No findings recorded'
    })).filter(row => row.pwsid && row.visit_id);
  }

  private static transformServiceAreas(data: any[]): any[] {
    return data.map(row => ({
      pwsid: row.PWSID?.trim(),
      service_area_type_code: row.SERVICE_AREA_TYPE_CODE?.trim(),
      is_primary_service_area: row.IS_PRIMARY_SERVICE_AREA_CODE?.trim() === 'Y',
      first_reported_date: CSVUploadService.parseDate(row.FIRST_REPORTED_DATE),
      last_reported_date: CSVUploadService.parseDate(row.LAST_REPORTED_DATE),
      submission_year_quarter: row.SUBMISSIONYEARQUARTER?.trim()
    })).filter(row => row.pwsid && row.service_area_type_code);
  }

  private static transformPnViolationAssoc(data: any[]): any[] {
    return data.map(row => ({
      pwsid: row.PWSID?.trim(),
      pn_violation_id: row.PN_VIOLATION_ID?.trim(),
      related_violation_id: row.RELATED_VIOLATION_ID?.trim(),
      compl_per_begin_date: CSVUploadService.parseDate(row.COMPL_PER_BEGIN_DATE),
      compl_per_end_date: CSVUploadService.parseDate(row.COMPL_PER_END_DATE),
      non_compl_per_begin_date: CSVUploadService.parseDate(row.NON_COMPL_PER_BEGIN_DATE),
      non_compl_per_end_date: CSVUploadService.parseDate(row.NON_COMPL_PER_END_DATE),
      violation_code: row.VIOLATION_CODE?.trim(),
      contaminant_code: row.CONTAMINANT_CODE?.trim(),
      first_reported_date: CSVUploadService.parseDate(row.FIRST_REPORTED_DATE),
      last_reported_date: CSVUploadService.parseDate(row.LAST_REPORTED_DATE),
      submission_year_quarter: row.SUBMISSIONYEARQUARTER?.trim()
    })).filter(row => row.pwsid && row.pn_violation_id);
  }

  private static transformEventsMilestones(data: any[]): any[] {
    return data.map(row => ({
      pwsid: row.PWSID?.trim(),
      event_schedule_id: row.EVENT_SCHEDULE_ID?.trim(),
      event_end_date: CSVUploadService.parseDate(row.EVENT_END_DATE),
      event_actual_date: CSVUploadService.parseDate(row.EVENT_ACTUAL_DATE),
      event_comments_text: row.EVENT_COMMENTS_TEXT?.trim(),
      event_milestone_code: row.EVENT_MILESTONE_CODE?.trim(),
      event_reason_code: row.EVENT_REASON_CODE?.trim(),
      first_reported_date: CSVUploadService.parseDate(row.FIRST_REPORTED_DATE),
      last_reported_date: CSVUploadService.parseDate(row.LAST_REPORTED_DATE),
      submission_year_quarter: row.SUBMISSIONYEARQUARTER?.trim()
    })).filter(row => row.pwsid && row.event_schedule_id);
  }

  private static transformRefCodeValues(data: any[]): any[] {
    return data.map(row => ({
      value_type: row.VALUE_TYPE?.trim(),
      value_code: row.VALUE_CODE?.trim(),
      value_description: row.VALUE_DESCRIPTION?.trim()
    })).filter(row => row.value_type && row.value_code);
  }

  // Helper functions
  private static parseDate(dateStr: string): string | null {
    if (!dateStr) return null;
    
    try {
      // Handle MM/DD/YYYY format
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        const [month, day, year] = parts;
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      
      // Try parsing as ISO date
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    } catch (error) {
      console.warn('Date parsing error:', dateStr, error);
    }
    
    return null;
  }

  private static parseCoordinate(coord: string): number | null {
    if (!coord) return null;
    const parsed = parseFloat(coord);
    return isNaN(parsed) ? null : parsed;
  }

  private static parseBoolean(value: string): boolean {
    return value?.trim().toLowerCase() === 'y' || value?.trim().toLowerCase() === 'yes';
  }

  private static determineComplianceStatus(row: any): string {
    // Logic to determine compliance status based on violation data
    if (row.VIOLATION_STATUS === 'Unaddressed' || row.IS_HEALTH_BASED_IND === 'Y') {
      return 'critical';
    } else if (row.VIOLATION_STATUS === 'Addressed') {
      return 'violation';
    }
    return 'compliant';
  }

  private static determineExceedsMCL(row: any): boolean {
    const sampleMeasure = parseFloat(row.SAMPLE_MEASURE);
    const mcl = parseFloat(row.FEDERAL_MCL);
    
    if (isNaN(sampleMeasure) || isNaN(mcl)) return false;
    return sampleMeasure > mcl;
  }

  private static extractCountyFromGeographic(row: any): string | null {
    // Extract county information from various possible fields
    return row.COUNTY_SERVED?.trim() || 
           row.CITY_NAME?.trim() || 
           null;
  }

  private static generateViolationDescription(row: any): string {
    const violationType = row.VIOLATION_CODE || 'Unknown';
    const contaminant = row.CONTAMINANT_CODE || '';
    const category = row.VIOLATION_CATEGORY_CODE || '';
    
    return `${violationType} violation${contaminant ? ` for ${contaminant}` : ''}${category ? ` (${category})` : ''}`;
  }

  private static determineOverallRating(row: any): string {
    // Determine overall rating based on evaluation codes
    const evaluations = [
      row.COMPLIANCE_EVAL_CODE,
      row.TREATMENT_EVAL_CODE,
      row.DISTRIBUTION_EVAL_CODE,
      row.SOURCE_WATER_EVAL_CODE
    ].filter(Boolean);

    if (evaluations.includes('S')) return 'S'; // Significant
    if (evaluations.includes('M')) return 'M'; // Minor
    if (evaluations.includes('R')) return 'R'; // Recommendations
    return 'N'; // None
  }

  static async clearTable(tableName: string): Promise<void> {
    const { error } = await supabase
      .from(tableName)
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

    if (error) {
      throw new Error(`Failed to clear table ${tableName}: ${error.message}`);
    }
  }
}