import React, { useState, useEffect } from 'react';
import { AlertTriangle, Filter, Calendar, MapPin, TrendingDown, TrendingUp, Shield, FileText } from 'lucide-react';
import { Violation } from '../types/sdwis';
import { SupabaseService } from '../services/supabaseService';
import { Pagination } from './Pagination';

export const ViolationsTab: React.FC = () => {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    unaddressed: 0,
    healthBased: 0,
    resolved: 0
  });

  useEffect(() => {
    const fetchViolations = async () => {
      setLoading(true);
      try {
        console.log('ViolationsTab: Fetching violations with filters:', {
          status: statusFilter,
          category: categoryFilter,
          page: currentPage,
          limit: itemsPerPage
        });
        
        const result = await SupabaseService.getViolations({
          status: statusFilter,
          category: categoryFilter,
          page: currentPage,
          limit: itemsPerPage
        });
        
        console.log('ViolationsTab: Received result:', {
          dataLength: result.data?.length,
          total: result.total,
          hasMore: result.hasMore,
          stats: result.stats
        });
        
        setViolations(result.data);
        setTotalItems(result.total);
        setHasMore(result.hasMore);
        setStats(result.stats);
      } catch (error) {
        console.error('ViolationsTab: Error fetching violations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchViolations();
  }, [statusFilter, categoryFilter, currentPage, itemsPerPage]);



  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const handleFilterChange = (filterType: string, value: string) => {
    if (filterType === 'status') {
      setStatusFilter(value);
    } else if (filterType === 'category') {
      setCategoryFilter(value);
    }
    setCurrentPage(1); // Reset to first page when changing filters
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getViolationStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'unaddressed': return 'bg-red-100 text-red-800';
      case 'addressed': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <AlertTriangle className="w-8 h-8 text-red-500" />
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900">{stats.total}</h3>
              <p className="text-sm text-gray-600">Total Violations</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <Shield className="w-8 h-8 text-amber-500" />
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900">{stats.unaddressed}</h3>
              <p className="text-sm text-gray-600">Unaddressed</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <FileText className="w-8 h-8 text-red-500" />
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900">{stats.healthBased}</h3>
              <p className="text-sm text-gray-600">Health-Based</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-green-500" />
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900">{stats.resolved}</h3>
              <p className="text-sm text-gray-600">Resolved</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="Unaddressed">Unaddressed</option>
              <option value="Addressed">Addressed</option>
              <option value="Resolved">Resolved</option>
              <option value="Archived">Archived</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="MCL">Maximum Contaminant Level</option>
              <option value="TT">Treatment Technique</option>
              <option value="MR">Monitoring & Reporting</option>
              <option value="MON">Monitoring</option>
              <option value="RPT">Reporting</option>
            </select>
          </div>
        </div>
      </div>

      {/* Violations List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Violations ({totalItems})
          </h3>
          

        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading violations...</p>
          </div>
        ) : violations.length === 0 ? (
          <div className="p-12 text-center">
            <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No violations found matching your criteria.</p>
            <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or upload violation data.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    System
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PWSID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Violation Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Begin Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    End Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Flags
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {violations.map((violation, index) => (
                  <tr key={violation.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{violation.systemName}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs" title={violation.description}>
                        {violation.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {violation.pwsid}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {violation.violationType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {violation.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(violation.beginDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {violation.endDate ? formatDate(violation.endDate) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getViolationStatusColor(violation.status)}`}>
                        {violation.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-1">
                        {violation.isHealthBased && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                            Health-Based
                          </span>
                        )}
                        {violation.isMajor && (
                          <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                            Major
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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