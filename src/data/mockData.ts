import { WaterSystem, Violation, SampleResult, EnforcementAction, SiteVisit } from '../types/sdwis';

export const mockWaterSystems: WaterSystem[] = [
  {
    pwsid: 'GA1570003',
    name: 'City of Atlanta Water Department',
    type: 'CWS',
    status: 'A',
    populationServed: 1200000,
    ownerType: 'L',
    primarySource: 'SW',
    city: 'Atlanta',
    county: 'Fulton',
    state: 'GA',
    zipCode: '30309',
    lastReported: '2025-01-15',
    complianceStatus: 'compliant'
  },
  {
    pwsid: 'GA1350007',
    name: 'Augusta Utilities Department',
    type: 'CWS',
    status: 'A',
    populationServed: 200000,
    ownerType: 'L',
    primarySource: 'SW',
    city: 'Augusta',
    county: 'Richmond',
    state: 'GA',
    zipCode: '30901',
    lastReported: '2025-01-12',
    complianceStatus: 'violation'
  },
  {
    pwsid: 'GA1570045',
    name: 'Gwinnett County Water Resources',
    type: 'CWS',
    status: 'A',
    populationServed: 950000,
    ownerType: 'L',
    primarySource: 'SW',
    city: 'Lawrenceville',
    county: 'Gwinnett',
    state: 'GA',
    zipCode: '30046',
    lastReported: '2025-01-10',
    complianceStatus: 'compliant'
  },
  {
    pwsid: 'GA1151002',
    name: 'Cobb County Water System',
    type: 'CWS',
    status: 'A',
    populationServed: 760000,
    ownerType: 'L',
    primarySource: 'SW',
    city: 'Marietta',
    county: 'Cobb',
    state: 'GA',
    zipCode: '30060',
    lastReported: '2025-01-14',
    complianceStatus: 'compliant'
  },
  {
    pwsid: 'GA1350012',
    name: 'Mountain Valley Water',
    type: 'CWS',
    status: 'A',
    populationServed: 1500,
    ownerType: 'P',
    primarySource: 'GW',
    city: 'Blue Ridge',
    county: 'Fannin',
    state: 'GA',
    zipCode: '30513',
    lastReported: '2025-01-08',
    complianceStatus: 'critical'
  },
  {
    pwsid: 'GA1570089',
    name: 'Savannah Water & Sewer',
    type: 'CWS',
    status: 'A',
    populationServed: 145000,
    ownerType: 'L',
    primarySource: 'SW',
    city: 'Savannah',
    county: 'Chatham',
    state: 'GA',
    zipCode: '31401',
    lastReported: '2025-01-11',
    complianceStatus: 'compliant'
  }
];

export const mockViolations: Violation[] = [
  {
    id: 'V001',
    pwsid: 'GA1350007',
    systemName: 'Augusta Utilities Department',
    violationCode: 'TCR',
    violationType: 'Total Coliform Rule',
    category: 'MCL',
    contaminant: 'Total Coliform',
    beginDate: '2024-12-01',
    endDate: '2024-12-15',
    status: 'Resolved',
    isHealthBased: true,
    isMajor: true,
    description: 'Positive coliform sample detected in distribution system'
  },
  {
    id: 'V002',
    pwsid: 'GA1350012',
    systemName: 'Mountain Valley Water',
    violationCode: 'NITRATE',
    violationType: 'Nitrate MCL Violation',
    category: 'MCL',
    contaminant: 'Nitrate',
    beginDate: '2024-11-15',
    status: 'Unaddressed',
    isHealthBased: true,
    isMajor: true,
    description: 'Nitrate levels exceeded maximum contaminant level'
  },
  {
    id: 'V003',
    pwsid: 'GA1350007',
    systemName: 'Augusta Utilities Department',
    violationCode: 'MR',
    violationType: 'Monitoring and Reporting',
    category: 'MR',
    beginDate: '2024-10-01',
    endDate: '2024-11-01',
    status: 'Resolved',
    isHealthBased: false,
    isMajor: false,
    description: 'Late submission of monthly bacteriological results'
  }
];

export const mockSampleResults: SampleResult[] = [
  {
    id: 'S001',
    pwsid: 'GA1570003',
    contaminant: 'Lead',
    result: 0.008,
    unit: 'mg/L',
    sampleDate: '2025-01-10',
    mcl: 0.015,
    exceedsMcl: false
  },
  {
    id: 'S002',
    pwsid: 'GA1350012',
    contaminant: 'Nitrate',
    result: 12.5,
    unit: 'mg/L',
    sampleDate: '2024-11-15',
    mcl: 10.0,
    exceedsMcl: true
  },
  {
    id: 'S003',
    pwsid: 'GA1570003',
    contaminant: 'Chlorine',
    result: 1.2,
    unit: 'mg/L',
    sampleDate: '2025-01-12',
    mcl: 4.0,
    exceedsMcl: false
  }
];

export const mockEnforcementActions: EnforcementAction[] = [
  {
    id: 'E001',
    pwsid: 'GA1350007',
    systemName: 'Augusta Utilities Department',
    actionType: 'Notice of Violation',
    category: 'Formal',
    actionDate: '2024-12-20',
    description: 'Formal notice issued for coliform violation',
    relatedViolationId: 'V001'
  },
  {
    id: 'E002',
    pwsid: 'GA1350012',
    systemName: 'Mountain Valley Water',
    actionType: 'Administrative Order',
    category: 'Formal',
    actionDate: '2024-12-01',
    description: 'Administrative order requiring nitrate treatment system installation',
    relatedViolationId: 'V002'
  }
];

export const mockSiteVisits: SiteVisit[] = [
  {
    id: 'SV001',
    pwsid: 'GA1570003',
    systemName: 'City of Atlanta Water Department',
    visitDate: '2024-12-15',
    reason: 'Routine Inspection',
    inspector: 'John Smith, EPD',
    overallRating: 'N',
    findings: 'No deficiencies identified. System operating in full compliance.'
  },
  {
    id: 'SV002',
    pwsid: 'GA1350012',
    systemName: 'Mountain Valley Water',
    visitDate: '2024-11-20',
    reason: 'Complaint Investigation',
    inspector: 'Maria Garcia, EPD',
    overallRating: 'S',
    findings: 'Significant deficiencies in treatment system. Nitrate removal system inadequate.'
  }
];