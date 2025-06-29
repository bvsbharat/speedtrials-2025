import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  MapPin,
  Filter,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Users,
  Calendar,
  TrendingUp,
  Eye,
  ChevronDown,
  ChevronUp,
  Navigation,
  Layers,
  Home,
  Building,
  Droplets,
  Shield,
  Clock,
  BarChart3,
  FileText,
  ExternalLink
} from 'lucide-react';
import { WaterSystem, Violation, SampleResult } from '../types/sdwis';
import { SupabaseService } from '../services/supabaseService';
import GeocodingService from '../services/geocodingService';
import { MapView } from './MapView';
import { WaterSystemCard } from './WaterSystemCard';
import { Pagination } from './Pagination';

interface InteractiveWaterDashboardProps {
  onSystemSelect?: (system: WaterSystem) => void;
}

interface SearchLocation {
  query: string;
  coordinates?: { lat: number; lng: number };
  city?: string;
  state?: string;
  zipCode?: string;
}

interface ContaminantInfo {
  name: string;
  description: string;
  healthEffects: string;
  sources: string;
  epaLink: string;
  mclg?: number;
  mcl?: number;
  unit: string;
}

// EPA Contaminant Reference Data
const CONTAMINANT_INFO: Record<string, ContaminantInfo> = {
  'LEAD': {
    name: 'Lead',
    description: 'A toxic metal that can be harmful to human health even at low exposure levels.',
    healthEffects: 'Can cause developmental delays in children, kidney problems, and high blood pressure in adults.',
    sources: 'Lead pipes, faucets, and fixtures; solder used in plumbing.',
    epaLink: 'https://www.epa.gov/ground-water-and-drinking-water/basic-information-about-lead-drinking-water',
    mclg: 0,
    mcl: 15,
    unit: 'ppb'
  },
  'COPPER': {
    name: 'Copper',
    description: 'An essential nutrient, but can be harmful at high levels.',
    healthEffects: 'Short-term exposure can cause gastrointestinal distress; long-term exposure can cause liver or kidney damage.',
    sources: 'Copper pipes; erosion of natural deposits.',
    epaLink: 'https://www.epa.gov/ground-water-and-drinking-water/basic-information-about-copper-drinking-water',
    mclg: 1.3,
    mcl: 1.3,
    unit: 'ppm'
  },
  'NITRATE': {
    name: 'Nitrate',
    description: 'A chemical compound that can be harmful, especially to infants.',
    healthEffects: 'Can cause blue baby syndrome in infants under 6 months.',
    sources: 'Fertilizer runoff; septic systems; erosion of natural deposits.',
    epaLink: 'https://www.epa.gov/ground-water-and-drinking-water/basic-information-about-nitrate-drinking-water',
    mclg: 10,
    mcl: 10,
    unit: 'ppm'
  },
  'COLIFORM': {
    name: 'Total Coliform',
    description: 'Bacteria that are naturally present in the environment and used as indicators.',
    healthEffects: 'Generally not harmful themselves, but indicate other harmful bacteria may be present.',
    sources: 'Soil, vegetation, and human or animal waste.',
    epaLink: 'https://www.epa.gov/ground-water-and-drinking-water/basic-information-about-coliform-bacteria-drinking-water',
    mclg: 0,
    mcl: 0,
    unit: 'presence/absence'
  }
};

const getViolationSeverity = (violation: Violation): 'low' | 'medium' | 'high' => {
  if (violation.isHealthBased && violation.category === 'MCL') return 'high';
  if (violation.isHealthBased) return 'medium';
  return 'low';
};

const getSystemStatusColor = (system: WaterSystem): string => {
  switch (system.complianceStatus) {
    case 'compliant': return 'text-green-600 bg-green-50 border-green-200';
    case 'violation': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'critical': return 'text-red-600 bg-red-50 border-red-200';
    default: return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

const getSystemStatusIcon = (status: string) => {
  switch (status) {
    case 'compliant': return <CheckCircle className="w-5 h-5" />;
    case 'violation': return <AlertTriangle className="w-5 h-5" />;
    case 'critical': return <XCircle className="w-5 h-5" />;
    default: return <Info className="w-5 h-5" />;
  }
};

const formatSystemType = (type: string): string => {
  switch (type) {
    case 'CWS': return 'Community Water System';
    case 'TNCWS': return 'Transient Non-Community';
    case 'NTNCWS': return 'Non-Transient Non-Community';
    default: return type;
  }
};

export const InteractiveWaterDashboard: React.FC<InteractiveWaterDashboardProps> = ({
  onSystemSelect
}) => {
  // State management
  const [searchLocation, setSearchLocation] = useState<SearchLocation>({ query: '' });
  const [waterSystems, setWaterSystems] = useState<WaterSystem[]>([]);
  const [selectedSystem, setSelectedSystem] = useState<WaterSystem | null>(null);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [sampleResults, setSampleResults] = useState<SampleResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [expandedContaminant, setExpandedContaminant] = useState<string | null>(null);
  
  // Filters
  const [filters, setFilters] = useState({
    systemType: '',
    complianceStatus: '',
    ownerType: '',
    sourceType: '',
    populationMin: '',
    populationMax: ''
  });

  // Search functionality
  const handleLocationSearch = async () => {
    if (!searchLocation.query.trim()) return;
    
    setSearchLoading(true);
    try {
      // Try geocoding the search query
      const geocodeResult = await GeocodingService.geocodeAddress(searchLocation.query);
      
      if (geocodeResult.success && geocodeResult.coordinates) {
        setSearchLocation(prev => ({
          ...prev,
          coordinates: geocodeResult.coordinates,
          city: geocodeResult.city,
          state: geocodeResult.state,
          zipCode: geocodeResult.zipCode
        }));
        
        // Search for nearby water systems
        await searchNearbyWaterSystems(geocodeResult.coordinates);
      } else {
        // Fallback to text search
        await searchWaterSystemsByText(searchLocation.query);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const searchNearbyWaterSystems = async (coordinates: { lat: number; lng: number }) => {
    setLoading(true);
    try {
      const result = await SupabaseService.getWaterSystemsNearLocation(
        coordinates.lat,
        coordinates.lng,
        50 // 50km radius
      );
      setWaterSystems(result.data || []);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error fetching nearby water systems:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchWaterSystemsByText = async (query: string) => {
    setLoading(true);
    try {
      const result = await SupabaseService.getWaterSystems({
        searchTerm: query,
        page: 1,
        limit: 50
      });
      setWaterSystems(result.data || []);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error searching water systems:', error);
    } finally {
      setLoading(false);
    }
  };

  // System selection
  const handleSystemSelect = async (system: WaterSystem) => {
    setSelectedSystem(system);
    onSystemSelect?.(system);
    
    // Load additional data for selected system
    try {
      const [violationsData, samplesData] = await Promise.all([
        SupabaseService.getViolationsBySystem(system.pwsid),
        SupabaseService.getSampleResultsBySystem(system.pwsid)
      ]);
      
      setViolations(violationsData || []);
      setSampleResults(samplesData || []);
    } catch (error) {
      console.error('Error loading system details:', error);
    }
  };

  // Filter water systems
  const filteredSystems = useMemo(() => {
    return waterSystems.filter(system => {
      if (filters.systemType && system.type !== filters.systemType) return false;
      if (filters.complianceStatus && system.complianceStatus !== filters.complianceStatus) return false;
      if (filters.ownerType && system.ownerType !== filters.ownerType) return false;
      if (filters.sourceType && system.primarySource !== filters.sourceType) return false;
      if (filters.populationMin && system.populationServed < parseInt(filters.populationMin)) return false;
      if (filters.populationMax && system.populationServed > parseInt(filters.populationMax)) return false;
      return true;
    });
  }, [waterSystems, filters]);

  // Pagination
  const paginatedSystems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredSystems.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredSystems, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredSystems.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Search Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Search Input */}
              <div className="flex-1 max-w-2xl">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Enter ZIP code, city, or address to find local water systems..."
                    value={searchLocation.query}
                    onChange={(e) => setSearchLocation(prev => ({ ...prev, query: e.target.value }))}
                    onKeyPress={(e) => e.key === 'Enter' && handleLocationSearch()}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                  />
                  <button
                    onClick={handleLocationSearch}
                    disabled={searchLoading}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50"
                  >
                    {searchLoading ? 'Searching...' : 'Search'}
                  </button>
                </div>
              </div>
              
              {/* View Toggle & Filters */}
              <div className="flex items-center gap-3">
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('map')}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      viewMode === 'map' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                  </button>
                </div>
                
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                  {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            {/* Filters Panel */}
            {showFilters && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">System Type</label>
                    <select
                      value={filters.systemType}
                      onChange={(e) => setFilters(prev => ({ ...prev, systemType: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Types</option>
                      <option value="CWS">Community</option>
                      <option value="TNCWS">Transient Non-Community</option>
                      <option value="NTNCWS">Non-Transient Non-Community</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={filters.complianceStatus}
                      onChange={(e) => setFilters(prev => ({ ...prev, complianceStatus: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Statuses</option>
                      <option value="compliant">Compliant</option>
                      <option value="violation">Minor Issues</option>
                      <option value="critical">Critical Issues</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Owner Type</label>
                    <select
                      value={filters.ownerType}
                      onChange={(e) => setFilters(prev => ({ ...prev, ownerType: e.target.value }))}
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Water Source</label>
                    <select
                      value={filters.sourceType}
                      onChange={(e) => setFilters(prev => ({ ...prev, sourceType: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Sources</option>
                      <option value="GW">Ground Water</option>
                      <option value="SW">Surface Water</option>
                      <option value="GU">Ground Water Under Influence</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Population</label>
                    <input
                      type="number"
                      value={filters.populationMin}
                      onChange={(e) => setFilters(prev => ({ ...prev, populationMin: e.target.value }))}
                      placeholder="0"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Population</label>
                    <input
                      type="number"
                      value={filters.populationMax}
                      onChange={(e) => setFilters(prev => ({ ...prev, populationMax: e.target.value }))}
                      placeholder="No limit"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {viewMode === 'map' ? (
          /* Map View */
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="h-[600px]">
              <MapView 
                onSystemSelect={handleSystemSelect}
                waterSystems={filteredSystems}
                center={searchLocation.coordinates || { lat: 32.1656, lng: -82.9001 }} // Georgia center
                zoom={searchLocation.coordinates ? 12 : 7}
              />
            </div>
          </div>
        ) : (
          /* List View */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Systems List */}
            <div className="lg:col-span-2 space-y-4">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : filteredSystems.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                  <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No water systems found</h3>
                  <p className="text-gray-600">
                    {searchLocation.query ? 
                      'Try searching with a different location or adjusting your filters.' :
                      'Enter a ZIP code, city, or address to find local water systems.'
                    }
                  </p>
                </div>
              ) : (
                <>
                  {/* Results Summary */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                          {filteredSystems.length} Water System{filteredSystems.length !== 1 ? 's' : ''} Found
                        </h2>
                        {searchLocation.city && (
                          <p className="text-sm text-gray-600">
                            Near {searchLocation.city}, {searchLocation.state}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-gray-600">
                            {filteredSystems.filter(s => s.complianceStatus === 'compliant').length} Compliant
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <span className="text-gray-600">
                            {filteredSystems.filter(s => s.complianceStatus === 'violation').length} Minor Issues
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <span className="text-gray-600">
                            {filteredSystems.filter(s => s.complianceStatus === 'critical').length} Critical
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Water Systems Cards */}
                  {paginatedSystems.map((system) => (
                    <div
                      key={system.pwsid}
                      onClick={() => handleSystemSelect(system)}
                      className={`bg-white rounded-lg border-2 transition-all duration-200 cursor-pointer hover:shadow-md ${
                        selectedSystem?.pwsid === system.pwsid 
                          ? 'border-blue-500 shadow-md' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{system.name}</h3>
                              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${
                                getSystemStatusColor(system)
                              }`}>
                                {getSystemStatusIcon(system.complianceStatus)}
                                {system.complianceStatus === 'compliant' ? 'Compliant' :
                                 system.complianceStatus === 'violation' ? 'Minor Issues' : 'Critical Issues'}
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">PWSID: {system.pwsid}</p>
                            <p className="text-sm text-gray-600">
                              {system.city}, {system.county} County, {system.state} {system.zipCode}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Building className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-gray-600">Type</p>
                              <p className="font-medium">{formatSystemType(system.type)}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-gray-600">Population</p>
                              <p className="font-medium">{system.populationServed.toLocaleString()}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Droplets className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-gray-600">Source</p>
                              <p className="font-medium">
                                {system.primarySource === 'GW' ? 'Ground Water' :
                                 system.primarySource === 'SW' ? 'Surface Water' : 'Ground Water Under Influence'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-gray-600">Last Reported</p>
                              <p className="font-medium">{new Date(system.lastReported).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center">
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        itemsPerPage={itemsPerPage}
                        totalItems={filteredSystems.length}
                        onItemsPerPageChange={() => {}} // Not implemented for this view
                      />
                    </div>
                  )}
                </>
              )}
            </div>

            {/* System Details Sidebar */}
            <div className="lg:col-span-1">
              {selectedSystem ? (
                <div className="bg-white rounded-lg border border-gray-200 sticky top-24">
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-2 rounded-lg ${
                        selectedSystem.complianceStatus === 'compliant' ? 'bg-green-100' :
                        selectedSystem.complianceStatus === 'violation' ? 'bg-yellow-100' : 'bg-red-100'
                      }`}>
                        {getSystemStatusIcon(selectedSystem.complianceStatus)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{selectedSystem.name}</h3>
                        <p className="text-sm text-gray-600">{selectedSystem.city}, {selectedSystem.state}</p>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">{violations.length}</div>
                        <div className="text-xs text-gray-600">Active Violations</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">{sampleResults.length}</div>
                        <div className="text-xs text-gray-600">Recent Tests</div>
                      </div>
                    </div>

                    {/* Recent Violations */}
                    {violations.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          Recent Violations
                        </h4>
                        <div className="space-y-2">
                          {violations.slice(0, 3).map((violation) => (
                            <div key={violation.id} className="p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-2 mb-1">
                                <div className={`w-2 h-2 rounded-full ${
                                  getViolationSeverity(violation) === 'high' ? 'bg-red-500' :
                                  getViolationSeverity(violation) === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                                }`}></div>
                                <span className="text-sm font-medium text-gray-900">{violation.violationType}</span>
                              </div>
                              <p className="text-xs text-gray-600">{violation.description}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(violation.beginDate).toLocaleDateString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recent Sample Results */}
                    {sampleResults.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Recent Test Results
                        </h4>
                        <div className="space-y-2">
                          {sampleResults.slice(0, 3).map((sample) => (
                            <div key={sample.id} className="p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-gray-900">{sample.contaminant}</span>
                                <div className={`w-2 h-2 rounded-full ${
                                  sample.exceedsMcl ? 'bg-red-500' : 'bg-green-500'
                                }`}></div>
                              </div>
                              <div className="flex items-center justify-between text-xs text-gray-600">
                                <span>{sample.result} {sample.unit}</span>
                                <span>{new Date(sample.sampleDate).toLocaleDateString()}</span>
                              </div>
                              {sample.mcl && (
                                <p className="text-xs text-gray-500 mt-1">
                                  MCL: {sample.mcl} {sample.unit}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Contaminant Information */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        Contaminant Information
                      </h4>
                      <div className="space-y-2">
                        {Object.entries(CONTAMINANT_INFO).map(([key, info]) => (
                          <div key={key} className="border border-gray-200 rounded-lg">
                            <button
                              onClick={() => setExpandedContaminant(expandedContaminant === key ? null : key)}
                              className="w-full p-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                            >
                              <span className="text-sm font-medium text-gray-900">{info.name}</span>
                              {expandedContaminant === key ? 
                                <ChevronUp className="w-4 h-4 text-gray-400" /> : 
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                              }
                            </button>
                            {expandedContaminant === key && (
                              <div className="px-3 pb-3 border-t border-gray-200">
                                <p className="text-xs text-gray-600 mb-2">{info.description}</p>
                                <p className="text-xs text-gray-600 mb-2">
                                  <strong>Health Effects:</strong> {info.healthEffects}
                                </p>
                                <p className="text-xs text-gray-600 mb-2">
                                  <strong>Common Sources:</strong> {info.sources}
                                </p>
                                {info.mcl && (
                                  <p className="text-xs text-gray-600 mb-2">
                                    <strong>Maximum Contaminant Level:</strong> {info.mcl} {info.unit}
                                  </p>
                                )}
                                <a
                                  href={info.epaLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                                >
                                  Learn more from EPA
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg border border-gray-200 p-8 text-center sticky top-24">
                  <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Water System</h3>
                  <p className="text-gray-600">
                    Click on a water system from the list to view detailed information, violations, and test results.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};