import React, { useState, useEffect } from 'react';
import { TestTube, Filter, Calendar, TrendingUp, AlertCircle, Beaker, CheckCircle } from 'lucide-react';
import { SampleResult } from '../types/sdwis';
import { SupabaseService } from '../services/supabaseService';
import { Pagination } from './Pagination';

export const SampleResultsTab: React.FC = () => {
  const [sampleResults, setSampleResults] = useState<SampleResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [contaminantFilter, setContaminantFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [totalItems, setTotalItems] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    const fetchSampleResults = async () => {
      try {
        setLoading(true);
        const filters: any = {
          page: currentPage,
          limit: itemsPerPage
        };
        
        if (contaminantFilter !== 'all') {
          filters.contaminant = contaminantFilter;
        }
        
        if (statusFilter !== 'all') {
          if (statusFilter === 'exceeds') {
            filters.exceedsMcl = true;
          } else if (statusFilter === 'compliant') {
            filters.exceedsMcl = false;
          }
        }
        
        const result = await SupabaseService.getSampleResults(filters);
        setSampleResults(result.data);
        setTotalItems(result.total);
        setHasMore(result.hasMore);
      } catch (error) {
        console.error('Error fetching sample results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSampleResults();
  }, [currentPage, itemsPerPage, contaminantFilter, statusFilter]);

  const stats = {
    total: totalItems,
    exceedances: sampleResults.filter(r => r.exceedsMcl).length,
    compliant: sampleResults.filter(r => !r.exceedsMcl).length,
    recent: sampleResults.filter(r => {
      const sampleDate = new Date(r.sampleDate);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return sampleDate >= thirtyDaysAgo;
    }).length,
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const handleFilterChange = (filterType: string, value: string) => {
    if (filterType === 'contaminant') {
      setContaminantFilter(value);
    } else if (filterType === 'status') {
      setStatusFilter(value);
    }
    setCurrentPage(1); // Reset to first page when changing filters
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const contaminants = Array.from(new Set(sampleResults.map(r => r.contaminant)));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <Beaker className="w-8 h-8 text-blue-500" />
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900">{stats.total}</h3>
              <p className="text-sm text-gray-600">Total Samples</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-green-500" />
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900">{stats.recent}</h3>
              <p className="text-sm text-gray-600">Recent (30 days)</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <AlertCircle className="w-8 h-8 text-red-500" />
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900">{stats.exceedances}</h3>
              <p className="text-sm text-gray-600">Exceeds MCL</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900">{stats.compliant}</h3>
              <p className="text-sm text-gray-600">Within Limits</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contaminant</label>
            <select
              value={contaminantFilter}
              onChange={(e) => handleFilterChange('contaminant', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Contaminants</option>
              {contaminants.map(contaminant => (
                <option key={contaminant} value={contaminant}>{contaminant}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Compliance Status</label>
            <select
              value={statusFilter}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="compliant">Within Limits</option>
              <option value="exceeds">Exceeds MCL</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sample Results Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Sample Results ({totalItems})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  System ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contaminant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Result
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  MCL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sample Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sampleResults.map(result => (
                <tr key={result.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {result.pwsid}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {result.contaminant}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {result.result} {result.unit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {result.mcl ? `${result.mcl} ${result.unit}` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {result.exceedsMcl ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Exceeds MCL
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Within Limits
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(result.sampleDate)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sampleResults.length === 0 && totalItems === 0 && (
          <div className="p-12 text-center">
            <Beaker className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No sample results found matching your criteria.</p>
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