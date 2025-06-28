import React from 'react';
import { MapPin, Users, Droplets, Building2 } from 'lucide-react';
import { WaterSystem } from '../types/sdwis';
import { 
  formatPopulation, 
  getSystemTypeLabel, 
  getOwnerTypeLabel, 
  getSourceTypeLabel,
  getComplianceStatusColor 
} from '../utils/formatters';

interface WaterSystemCardProps {
  system: WaterSystem;
  onClick: (system: WaterSystem) => void;
}

export const WaterSystemCard: React.FC<WaterSystemCardProps> = ({ system, onClick }) => {
  return (
    <div 
      className="bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer p-6"
      onClick={() => onClick(system)}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{system.name}</h3>
          <p className="text-sm text-gray-600">PWSID: {system.pwsid}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getComplianceStatusColor(system.complianceStatus)}`}>
          {system.complianceStatus === 'compliant' ? 'Compliant' : 
           system.complianceStatus === 'violation' ? 'Minor Issues' : 'Critical'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-700">{formatPopulation(system.populationServed)} served</span>
        </div>
        <div className="flex items-center space-x-2">
          <Building2 className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-700">{getOwnerTypeLabel(system.ownerType)}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Droplets className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-700">{getSourceTypeLabel(system.primarySource)}</span>
        </div>
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-700">{system.city}, {system.county} Co.</span>
        </div>
      </div>

      <div className="text-xs text-gray-500">
        Type: {getSystemTypeLabel(system.type)} • Status: Active
      </div>
    </div>
  );
};