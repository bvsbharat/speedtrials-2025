import React, { useState, useEffect } from 'react';
import { WaterSystem } from '../types/sdwis';
import { SupabaseService } from '../services/supabaseService';
import { WaterSystemCard } from './WaterSystemCard';
import { SearchFilters } from './SearchFilters';
import { Pagination } from './Pagination';

interface WaterSystemSearchProps {
  onSystemSelect: (system: WaterSystem) => void;
}

export const WaterSystemSearch: React.FC<WaterSystemSearchProps> = ({ onSystemSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    systemType: '',
    ownerType: '',
    sourceType: '',
    complianceStatus: '',
    county: ''
  });
  const [waterSystems, setWaterSystems] = useState<WaterSystem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [totalItems, setTotalItems] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    const fetchWaterSystems = async () => {
      try {
        setLoading(true);
        const result = await SupabaseService.getWaterSystems({
          page: currentPage,
          limit: itemsPerPage,
          searchTerm,
          systemType: filters.systemType,
          ownerType: filters.ownerType,
          sourceType: filters.sourceType,
          complianceStatus: filters.complianceStatus,
          county: filters.county
        });
        setWaterSystems(result.data);
        setTotalItems(result.total);
        setHasMore(result.hasMore);
      } catch (error) {
        console.error('Error fetching water systems:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWaterSystems();
  }, [currentPage, itemsPerPage, searchTerm, filters]);



  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const handleFilterChange = (filterName: string, value: string) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when search changes
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const handleClearFilters = () => {
    setFilters({
      systemType: '',
      ownerType: '',
      sourceType: '',
      complianceStatus: '',
      county: ''
    });
    setSearchTerm('');
    setCurrentPage(1); // Reset to first page when clearing filters
  };

  return (
    <div className="space-y-6">
      <SearchFilters
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          Water Systems ({totalItems})
        </h2>
        <div className="text-sm text-gray-600">
          {totalItems} systems found
          {totalItems > itemsPerPage && (
            <span className="ml-2 text-sm text-gray-500">
              (showing {Math.min(itemsPerPage, waterSystems.length)} on this page)
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {waterSystems.map(system => (
          <WaterSystemCard
            key={system.pwsid}
            system={system}
            onClick={onSystemSelect}
          />
        ))}
      </div>

      {waterSystems.length === 0 && totalItems === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No water systems found matching your criteria.</p>
          <button
            onClick={handleClearFilters}
            className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear filters to see all systems
          </button>
        </div>
      )}

      {totalItems > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
          itemsPerPageOptions={[10, 25, 50, 100]}
        />
      )}
    </div>
  );
};