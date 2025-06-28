import React from 'react';
import { X, MapPin, Users, Droplets, AlertTriangle, CheckCircle, Calendar, FileText, Activity } from 'lucide-react';
import { MapMarker } from '../types/maps';
import { WaterSystem, Violation } from '../types/sdwis';
import { formatPopulation, getSystemTypeLabel, getOwnerTypeLabel, getSourceTypeLabel } from '../utils/formatters';

interface MapSidebarProps {
  selectedMarker: MapMarker | null;
  onClose: () => void;
}

export const MapSidebar: React.FC<MapSidebarProps> = ({ selectedMarker, onClose }) => {
  if (!selectedMarker) return null;

  const system = selectedMarker.data as WaterSystem & {
    violationCount?: number;
    healthBasedViolationCount?: number;
    violations?: Violation[];
  };

  return (
    <div className="w-96 bg-white border-l border-gray-200 h-full overflow-y-auto">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">System Details</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 space-y-6">
        {/* System Header */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{system.name}</h3>
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-sm text-gray-600">PWSID: {system.pwsid}</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              system.complianceStatus === 'compliant' ? 'bg-green-100 text-green-800' :
              system.complianceStatus === 'violation' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {system.complianceStatus === 'compliant' ? 'Compliant' : 
               system.complianceStatus === 'violation' ? 'Minor Issues' : 'Critical'}
            </span>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center">
              <Users className="w-5 h-5 text-blue-600 mr-2" />
              <div>
                <p className="text-sm text-blue-600">Population Served</p>
                <p className="text-lg font-semibold text-blue-900">
                  {formatPopulation(system.populationServed)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-3 rounded-lg">
            <div className="flex items-center">
              <Droplets className="w-5 h-5 text-green-600 mr-2" />
              <div>
                <p className="text-sm text-green-600">Water Source</p>
                <p className="text-lg font-semibold text-green-900">
                  {getSourceTypeLabel(system.primarySource)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* System Information */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3">System Information</h4>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-sm font-medium text-gray-500">Type</dt>
              <dd className="text-sm text-gray-900">{getSystemTypeLabel(system.type)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm font-medium text-gray-500">Owner Type</dt>
              <dd className="text-sm text-gray-900">{getOwnerTypeLabel(system.ownerType)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm font-medium text-gray-500">Primary Source</dt>
              <dd className="text-sm text-gray-900">{getSourceTypeLabel(system.primarySource)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm font-medium text-gray-500">Last Reported</dt>
              <dd className="text-sm text-gray-900">{system.lastReported}</dd>
            </div>
          </dl>
        </div>

        {/* Location */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Location
          </h4>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-sm font-medium text-gray-500">City</dt>
              <dd className="text-sm text-gray-900">{system.city}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm font-medium text-gray-500">County</dt>
              <dd className="text-sm text-gray-900">{system.county}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm font-medium text-gray-500">State</dt>
              <dd className="text-sm text-gray-900">{system.state}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm font-medium text-gray-500">ZIP Code</dt>
              <dd className="text-sm text-gray-900">{system.zipCode}</dd>
            </div>
          </dl>
        </div>

        {/* Compliance Status */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Compliance Status
          </h4>
          <div className="space-y-3">
            {system.complianceStatus === 'compliant' ? (
              <div className="flex items-center p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-green-900">System is Compliant</p>
                  <p className="text-xs text-green-700">No active violations or issues</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className={`flex items-center p-3 rounded-lg ${
                  system.complianceStatus === 'critical' ? 'bg-red-50' : 'bg-yellow-50'
                }`}>
                  <AlertTriangle className={`w-5 h-5 mr-3 ${
                    system.complianceStatus === 'critical' ? 'text-red-600' : 'text-yellow-600'
                  }`} />
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${
                      system.complianceStatus === 'critical' ? 'text-red-900' : 'text-yellow-900'
                    }`}>
                      {system.complianceStatus === 'critical' ? 'Critical Issues' : 'Minor Issues'}
                    </p>
                    <p className={`text-xs ${
                      system.complianceStatus === 'critical' ? 'text-red-700' : 'text-yellow-700'
                    }`}>
                      {system.violationCount || 0} active violations
                      {system.healthBasedViolationCount ? ` (${system.healthBasedViolationCount} health-based)` : ''}
                    </p>
                  </div>
                </div>
                
                {/* Violation Summary */}
                {system.violations && system.violations.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <h5 className="text-sm font-medium text-gray-900 mb-2">Recent Violations</h5>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {system.violations.slice(0, 5).map((violation, index) => (
                        <div key={index} className="text-xs">
                          <div className="flex justify-between items-start">
                            <span className={`font-medium ${
                              violation.isHealthBased ? 'text-red-700' : 'text-orange-700'
                            }`}>
                              {violation.violationCode}
                            </span>
                            <span className={`px-1 py-0.5 rounded text-xs ${
                              violation.status === 'resolved' ? 'bg-green-100 text-green-700' :
                              violation.status === 'unresolved' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {violation.status}
                            </span>
                          </div>
                          <p className="text-gray-600 mt-1">
                            {violation.contaminantCode} - {violation.category}
                          </p>
                          {violation.beginDate && (
                            <p className="text-gray-500 mt-1">
                              Started: {new Date(violation.beginDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      ))}
                      {system.violations.length > 5 && (
                        <p className="text-xs text-gray-500 text-center pt-1">
                          +{system.violations.length - 5} more violations
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Quick Actions
          </h4>
          <div className="space-y-2">
            <button className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              View Detailed Report
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2" />
              View Violations History ({system.violations?.length || 0})
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md flex items-center">
              <Droplets className="w-4 h-4 mr-2" />
              View Sample Results
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Inspection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};