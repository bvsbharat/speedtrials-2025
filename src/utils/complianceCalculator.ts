import { Violation, WaterSystem } from '../types/sdwis';

/**
 * Calculate compliance status for a water system based on its violations
 * @param violations - Array of violations for the water system
 * @returns 'compliant' | 'violation' | 'critical'
 */
export const calculateComplianceStatus = (violations: Violation[]): 'compliant' | 'violation' | 'critical' => {
  if (!violations || violations.length === 0) {
    return 'compliant';
  }

  // Filter for active violations (not resolved or archived)
  const activeViolations = violations.filter(
    violation => violation.status === 'Unaddressed' || violation.status === 'Addressed'
  );

  if (activeViolations.length === 0) {
    return 'compliant';
  }

  // Check for critical violations (unaddressed or health-based)
  const criticalViolations = activeViolations.filter(
    violation => violation.status === 'Unaddressed' || violation.isHealthBased
  );

  if (criticalViolations.length > 0) {
    return 'critical';
  }

  // If there are active violations but none are critical
  return 'violation';
};

/**
 * Calculate zone compliance metrics based on systems and their violations
 * @param systems - Array of water systems in the zone
 * @param allViolations - Array of all violations
 * @returns Object with compliance counts and details
 */
export const calculateZoneCompliance = (
  systems: WaterSystem[],
  allViolations: Violation[]
) => {
  const systemCompliance = systems.map(system => {
    const systemViolations = allViolations.filter(v => v.pwsid === system.pwsid);
    const calculatedStatus = calculateComplianceStatus(systemViolations);
    
    return {
      ...system,
      calculatedComplianceStatus: calculatedStatus,
      activeViolations: systemViolations.filter(
        v => v.status === 'Unaddressed' || v.status === 'Addressed'
      ).length,
      criticalViolations: systemViolations.filter(
        v => v.status === 'Unaddressed' || v.isHealthBased
      ).length
    };
  });

  const compliantSystems = systemCompliance.filter(
    s => s.calculatedComplianceStatus === 'compliant'
  ).length;
  
  const violationSystems = systemCompliance.filter(
    s => s.calculatedComplianceStatus === 'violation'
  ).length;
  
  const criticalSystems = systemCompliance.filter(
    s => s.calculatedComplianceStatus === 'critical'
  ).length;

  const totalActiveViolations = allViolations.filter(
    v => v.status === 'Unaddressed' || v.status === 'Addressed'
  ).length;

  const healthBasedViolations = allViolations.filter(
    v => v.isHealthBased && (v.status === 'Unaddressed' || v.status === 'Addressed')
  ).length;

  return {
    totalSystems: systems.length,
    compliantSystems,
    violationSystems,
    criticalSystems,
    totalActiveViolations,
    healthBasedViolations,
    systemCompliance,
    complianceRate: systems.length > 0 ? (compliantSystems / systems.length) * 100 : 0
  };
};

/**
 * Get compliance status display text
 * @param status - Compliance status
 * @returns Display text for the status
 */
export const getComplianceStatusText = (status: 'compliant' | 'violation' | 'critical'): string => {
  switch (status) {
    case 'compliant':
      return 'Compliant';
    case 'violation':
      return 'Minor Issues';
    case 'critical':
      return 'Critical Issues';
    default:
      return 'Unknown';
  }
};

/**
 * Get compliance status color classes for Tailwind CSS
 * @param status - Compliance status
 * @returns Tailwind CSS classes for styling
 */
export const getComplianceStatusClasses = (status: 'compliant' | 'violation' | 'critical'): string => {
  switch (status) {
    case 'compliant':
      return 'bg-green-100 text-green-800';
    case 'violation':
      return 'bg-yellow-100 text-yellow-800';
    case 'critical':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};