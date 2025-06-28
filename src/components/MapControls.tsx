import React from 'react';
import { Layers, Filter, Download, Search, RotateCcw } from 'lucide-react';
import { MapFilters } from '../types/maps';

interface MapControlsProps {
  filters: MapFilters;
  onFiltersChange: (filters: MapFilters) => void;
  map?: google.maps.Map;
}

export const MapControls: React.FC<MapControlsProps> = ({ 
  filters, 
  onFiltersChange, 
  map 
}) => {
  const [showFilters, setShowFilters] = React.useState(false);

  const handleFilterChange = (key: keyof MapFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const resetFilters = () => {
    onFiltersChange({
      systemType: '',
      complianceStatus: '',
      ownerType: '',
      sourceType: '',
      showViolations: true,
      showFacilities: false
    });
  };

  const zoomToGeorgia = () => {
    if (map) {
      map.setCenter({ lat: 32.1656, lng: -82.9001 });
      map.setZoom(7);
    }
  };

  return (
    <>
      {/* Main Controls */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-2 space-y-2">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md w-full"
        >
          <Filter className="w-4 h-4" />
          <span>Filters</span>
        </button>
        
        <button
          onClick={zoomToGeorgia}
          className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md w-full"
        >
          <Search className="w-4 h-4" />
          <span>Zoom to GA</span>
        </button>

        <button
          onClick={resetFilters}
          className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md w-full"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset</span>
        </button>
      </div>

      {/* Layer Controls */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3">
        <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
          <Layers className="w-4 h-4 mr-2" />
          Map Layers
        </h3>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.showViolations}
              onChange={(e) => handleFilterChange('showViolations', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Violation Heatmap</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.showFacilities}
              onChange={(e) => handleFilterChange('showFacilities', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Facilities</span>
          </label>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Legend</h3>
        <div className="space-y-1">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-xs text-gray-700">Compliant</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
            <span className="text-xs text-gray-700">Minor Issues</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span className="text-xs text-gray-700">Critical</span>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="absolute top-16 left-4 bg-white rounded-lg shadow-lg p-4 w-80">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Water Systems</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                System Type
              </label>
              <select
                value={filters.systemType}
                onChange={(e) => handleFilterChange('systemType', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Types</option>
                <option value="CWS">Community</option>
                <option value="TNCWS">Transient Non-Community</option>
                <option value="NTNCWS">Non-Transient Non-Community</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Compliance Status
              </label>
              <select
                value={filters.complianceStatus}
                onChange={(e) => handleFilterChange('complianceStatus', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Status</option>
                <option value="compliant">Compliant</option>
                <option value="violation">Minor Issues</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Owner Type
              </label>
              <select
                value={filters.ownerType}
                onChange={(e) => handleFilterChange('ownerType', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Owners</option>
                <option value="L">Local Government</option>
                <option value="P">Private</option>
                <option value="S">State Government</option>
                <option value="F">Federal</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Water Source
              </label>
              <select
                value={filters.sourceType}
                onChange={(e) => handleFilterChange('sourceType', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Sources</option>
                <option value="GW">Ground Water</option>
                <option value="SW">Surface Water</option>
                <option value="GU">Ground Water Under Influence</option>
              </select>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => setShowFilters(false)}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </>
  );
};