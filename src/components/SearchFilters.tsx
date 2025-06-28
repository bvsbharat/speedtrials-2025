import React, { useState } from 'react';
import { Search, Filter, X, ChevronDown, ChevronUp } from 'lucide-react';

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
  onAdvancedSearch?: (query: string, searchType: string) => void;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  searchTerm,
  onSearchChange,
  filters,
  onFilterChange,
  onClearFilters,
  onAdvancedSearch
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [advancedQuery, setAdvancedQuery] = useState('');
  const [searchType, setSearchType] = useState('general');
  const hasActiveFilters = Object.values(filters).some(value => value !== '') || advancedQuery !== '';

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Filter className="w-5 h-5 mr-2" />
          Search & Filter
        </h3>
        {hasActiveFilters && (
          <button
            onClick={() => {
              onClearFilters();
              setAdvancedQuery('');
              setSearchType('general');
            }}
            className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
          >
            <X className="w-4 h-4" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="space-y-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by system name, PWSID, city, or any keyword..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        {/* Advanced Search Toggle */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            <span>Advanced Search</span>
            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {advancedQuery && (
            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
              Advanced query active
            </span>
          )}
        </div>
        
        {/* Advanced Search Panel */}
        {showAdvanced && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Type</label>
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="general">General Search</option>
                  <option value="exact">Exact Match</option>
                  <option value="contains">Contains Text</option>
                  <option value="starts_with">Starts With</option>
                  <option value="ends_with">Ends With</option>
                  <option value="regex">Regular Expression</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Advanced Query</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Enter advanced search query..."
                    value={advancedQuery}
                    onChange={(e) => setAdvancedQuery(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={() => onAdvancedSearch?.(advancedQuery, searchType)}
                    disabled={!advancedQuery.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>
            
            {/* Search Examples */}
            <div className="text-xs text-gray-600">
              <p className="font-medium mb-1">Examples:</p>
              <ul className="space-y-1">
                <li><strong>General:</strong> "Atlanta water" - searches across all fields</li>
                <li><strong>Exact:</strong> "GA1234567" - exact PWSID match</li>
                <li><strong>Contains:</strong> "Municipal" - systems containing this word</li>
                <li><strong>Regex:</strong> "^GA\\d{7}$" - Georgia PWS IDs pattern</li>
              </ul>
            </div>
          </div>
        )}
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