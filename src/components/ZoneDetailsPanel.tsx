import React from 'react';
import {
  MapPin,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  Square,
  X,
  Download,
} from 'lucide-react';
import { PolygonSelection, ZoneDetails } from '../types/maps';
import { WaterSystem } from '../types/sdwis';

interface ZoneDetailsPanelProps {
  selection: PolygonSelection | null;
  onClose: () => void;
  onExportZone?: () => void;
}

const ZoneDetailsPanel: React.FC<ZoneDetailsPanelProps> = ({
  selection,
  onClose,
  onExportZone,
}) => {
  if (!selection) return null;

  const calculateZoneDetails = (selection: PolygonSelection): ZoneDetails => {
    const systems = selection.systemsInside;
    const violations = selection.violationsInside;

    const compliantSystems = systems.filter(
      (s) => s.complianceStatus === 'compliant'
    ).length;
    const violationSystems = systems.filter(
      (s) => s.complianceStatus === 'violation'
    ).length;
    const criticalSystems = systems.filter(
      (s) => s.complianceStatus === 'critical'
    ).length;

    const totalPopulation = systems.reduce(
      (sum, s) => sum + (s.populationServed || 0),
      0
    );

    const activeViolations = violations.filter(
      (v) => v.status === 'Unaddressed' || v.status === 'Addressed'
    ).length;

    const healthBasedViolations = violations.filter(
      (v) => v.isHealthBased
    ).length;

    const averageSystemSize = systems.length > 0 ? totalPopulation / systems.length : 0;

    return {
      totalSystems: systems.length,
      compliantSystems,
      violationSystems,
      criticalSystems,
      totalPopulation,
      activeViolations,
      healthBasedViolations,
      area: selection.area,
      averageSystemSize,
    };
  };

  const details = calculateZoneDetails(selection);
  const complianceRate = details.totalSystems > 0 
    ? (details.compliantSystems / details.totalSystems) * 100 
    : 0;

  const formatArea = (area: number): string => {
    if (area < 1) {
      return `${(area * 1000000).toFixed(0)} m²`;
    } else if (area < 100) {
      return `${area.toFixed(2)} km²`;
    } else {
      return `${area.toFixed(0)} km²`;
    }
  };

  const handleSystemClick = (system: WaterSystem) => {
    // Scroll to system in list or show system details
    console.log('Selected system:', system);
  };

  return (
    <div className="absolute top-4 right-4 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[calc(100vh-2rem)] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-blue-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Square className="h-5 w-5 mr-2 text-blue-600" />
              Zone Analysis
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Selected area: {formatArea(details.area)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
            aria-label="Close zone details"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Summary Statistics */}
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {/* Total Systems */}
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-blue-700">Systems</h4>
                  <span className="text-xl font-bold text-blue-900">
                    {details.totalSystems}
                  </span>
                </div>
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
            </div>

            {/* Population */}
            <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-purple-700">Population</h4>
                  <span className="text-xl font-bold text-purple-900">
                    {details.totalPopulation.toLocaleString()}
                  </span>
                </div>
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Compliance Overview */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-900">Compliance Status</h4>
            
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2 rounded-lg bg-green-50 border border-green-200 text-center">
                <CheckCircle className="h-5 w-5 text-green-600 mx-auto mb-1" />
                <div className="text-lg font-bold text-green-900">
                  {details.compliantSystems}
                </div>
                <div className="text-xs text-green-700">Compliant</div>
              </div>
              
              <div className="p-2 rounded-lg bg-yellow-50 border border-yellow-200 text-center">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mx-auto mb-1" />
                <div className="text-lg font-bold text-yellow-900">
                  {details.violationSystems}
                </div>
                <div className="text-xs text-yellow-700">Violations</div>
              </div>
              
              <div className="p-2 rounded-lg bg-red-50 border border-red-200 text-center">
                <XCircle className="h-5 w-5 text-red-600 mx-auto mb-1" />
                <div className="text-lg font-bold text-red-900">
                  {details.criticalSystems}
                </div>
                <div className="text-xs text-red-700">Critical</div>
              </div>
            </div>

            {/* Compliance Rate Bar */}
            <div className="mt-3">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Compliance Rate</span>
                <span>{complianceRate.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${complianceRate}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Violation Details */}
          {details.activeViolations > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-900">Active Violations</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded-lg bg-orange-50 border border-orange-200">
                  <div className="text-sm text-orange-700">Total Active</div>
                  <div className="text-lg font-bold text-orange-900">
                    {details.activeViolations}
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-red-50 border border-red-200">
                  <div className="text-sm text-red-700">Health-Based</div>
                  <div className="text-lg font-bold text-red-900">
                    {details.healthBasedViolations}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Additional Metrics */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-900">Zone Metrics</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Average System Size:</span>
                <span className="font-medium">
                  {details.averageSystemSize.toLocaleString()} people
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Population Density:</span>
                <span className="font-medium">
                  {(details.totalPopulation / details.area).toFixed(0)} people/km²
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">System Density:</span>
                <span className="font-medium">
                  {(details.totalSystems / details.area).toFixed(2)} systems/km²
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Systems List */}
        {details.totalSystems > 0 && (
          <div className="border-t border-gray-200">
            <div className="p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                Water Systems in Zone ({details.totalSystems})
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selection.systemsInside.slice(0, 10).map((system) => (
                  <div
                    key={system.pwsid}
                    onClick={() => handleSystemClick(system)}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {system.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {system.county} County • {(system.populationServed || 0).toLocaleString()} people
                        </div>
                      </div>
                      <div className="ml-2">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            system.complianceStatus === 'compliant'
                              ? 'bg-green-500'
                              : system.complianceStatus === 'critical'
                              ? 'bg-red-500'
                              : 'bg-yellow-500'
                          }`}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
                {selection.systemsInside.length > 10 && (
                  <div className="text-xs text-gray-500 text-center py-2">
                    ... and {selection.systemsInside.length - 10} more systems
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Created: {selection.createdAt.toLocaleTimeString()}
          </div>
          {onExportZone && (
            <button
              onClick={onExportZone}
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              <span>Export Zone</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ZoneDetailsPanel;