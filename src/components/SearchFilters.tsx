import React from 'react';
import { Search, Filter, X } from 'lucide-react';

interface SearchFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filters: {
    systemType: string;
    ownerType: string;
    sourceType: string;
    complianceStatus: string;
    county: string;
  };
  onFilterChange: (filterName: string, value: string) => void;
  onClearFilters: () => void;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  searchTerm,
  onSearchChange,
  filters,
  onFilterChange,
  onClearFilters
}) => {
  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Filter className="w-5 h-5 mr-2" />
          Search & Filter
        </h3>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
          >
            <X className="w-4 h-4" />
            <span>Clear Filters</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search by system name, PWSID, or city..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Filter Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">System Type</label>
          <select
            value={filters.systemType}
            onChange={(e) => onFilterChange('systemType', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Types</option>
            <option value="CWS">Community</option>
            <option value="TNCWS">Transient Non-Community</option>
            <option value="NTNCWS">Non-Transient Non-Community</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Owner Type</label>
          <select
            value={filters.ownerType}
            onChange={(e) => onFilterChange('ownerType', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Owners</option>
            <option value="L">Local Government</option>
            <option value="P">Private</option>
            <option value="S">State Government</option>
            <option value="F">Federal</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Water Source</label>
          <select
            value={filters.sourceType}
            onChange={(e) => onFilterChange('sourceType', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Sources</option>
            <option value="GW">Ground Water</option>
            <option value="SW">Surface Water</option>
            <option value="GU">Ground Water Under Influence</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Compliance Status</label>
          <select
            value={filters.complianceStatus}
            onChange={(e) => onFilterChange('complianceStatus', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="compliant">Compliant</option>
            <option value="violation">Minor Issues</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">County</label>
          <select
            value={filters.county}
            onChange={(e) => onFilterChange('county', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Counties</option>
            <option value="Fulton">Fulton</option>
            <option value="Gwinnett">Gwinnett</option>
            <option value="Cobb">Cobb</option>
            <option value="Richmond">Richmond</option>
            <option value="Chatham">Chatham</option>
            <option value="Fannin">Fannin</option>
          </select>
        </div>
      </div>
    </div>
  );
};