export interface WaterSystem {
  pwsid: string;
  name: string;
  type: 'CWS' | 'TNCWS' | 'NTNCWS';
  status: 'A' | 'I' | 'N' | 'M' | 'P';
  populationServed: number;
  ownerType: 'F' | 'L' | 'M' | 'N' | 'P' | 'S';
  primarySource: 'GW' | 'SW' | 'GU';
  city: string;
  county: string;
  state: string;
  zipCode: string;
  lastReported: string;
  complianceStatus: 'compliant' | 'violation' | 'critical';
}

export interface Violation {
  id: string;
  pwsid: string;
  systemName: string;
  violationCode: string;
  violationType: string;
  category: 'MCL' | 'MRDL' | 'TT' | 'MR' | 'MON' | 'RPT';
  contaminant?: string;
  beginDate: string;
  endDate?: string;
  status: 'Resolved' | 'Archived' | 'Addressed' | 'Unaddressed';
  isHealthBased: boolean;
  isMajor: boolean;
  description: string;
}

export interface SampleResult {
  id: string;
  pwsid: string;
  contaminant: string;
  result: number;
  unit: string;
  sampleDate: string;
  mcl?: number;
  exceedsMcl: boolean;
}

export interface EnforcementAction {
  id: string;
  pwsid: string;
  systemName: string;
  actionType: string;
  category: 'Formal' | 'Informal' | 'Resolving';
  actionDate: string;
  description: string;
  relatedViolationId?: string;
}

export interface SiteVisit {
  id: string;
  pwsid: string;
  systemName: string;
  visitDate: string;
  reason: string;
  inspector: string;
  overallRating: 'N' | 'R' | 'M' | 'S';
  findings: string;
}

export type UserRole = 'public' | 'staff' | 'admin';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  agency?: string;
}