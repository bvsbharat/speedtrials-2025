import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import { AlertTriangle, CheckCircle, TrendingUp, Users, Download, Share2, Filter, Calendar, MapPin, Activity } from 'lucide-react';
import { SupabaseService } from '../services/supabaseService';
import { UserRole } from '../types/sdwis';
import { Pagination } from './Pagination';

interface DashboardProps {
  userRole: UserRole;
}

interface DashboardStats {
  systems: {
    total: number;
    compliant: number;
    violation: number;
    critical: number;
    totalPopulation: number;
    types: {
      CWS: number;
      TNCWS: number;
      NTNCWS: number;
    };
  };
  violations: {
    total: number;
    unaddressed: number;
    healthBased: number;
    resolved: number;
  };
}

export const EnhancedDashboard: React.FC<DashboardProps> = ({ userRole }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [violationTrends, setViolationTrends] = useState<any[]>([]);
  const [contaminantAnalysis, setContaminantAnalysis] = useState<any[]>([]);
  const [complianceAnalysis, setComplianceAnalysis] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('12');
  const [activeTab, setActiveTab] = useState('overview');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  const paginatedComplianceData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return complianceAnalysis.slice(startIndex, endIndex);
  }, [complianceAnalysis, currentPage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsData, trendsData, contaminantData, complianceData] = await Promise.all([
          SupabaseService.getDashboardStats(),
          SupabaseService.getViolationTrends(parseInt(selectedTimeframe)),
          SupabaseService.getContaminantAnalysis(),
          SupabaseService.getComplianceAnalysis()
        ]);

        setStats(statsData);
        setViolationTrends(trendsData);
        setContaminantAnalysis(contaminantData.slice(0, 10)); // Top 10 contaminants
        setComplianceAnalysis(complianceData.slice(0, 20)); // Top 20 systems
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [selectedTimeframe]);

  const handleExportData = async () => {
    try {
      const exportData = {
        stats,
        violationTrends,
        contaminantAnalysis,
        complianceAnalysis,
        exportDate: new Date().toISOString(),
        userRole
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `water-quality-analysis-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const handleShareData = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Georgia Water Quality Dashboard',
          text: `Water Quality Analysis - ${stats?.systems.total} systems monitored, ${stats?.violations.unaddressed} unaddressed violations`,
          url: window.location.href
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      const shareText = `Georgia Water Quality Dashboard\n${stats?.systems.total} systems monitored\n${stats?.violations.unaddressed} unaddressed violations\n${window.location.href}`;
      navigator.clipboard.writeText(shareText);
      alert('Dashboard link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const complianceData = stats ? [
    { name: 'Compliant', value: stats.systems.compliant, color: '#10B981' },
    { name: 'Minor Issues', value: stats.systems.violation, color: '#F59E0B' },
    { name: 'Critical', value: stats.systems.critical, color: '#EF4444' },
  ] : [];

  const systemTypeData = stats ? [
    { name: 'Community', count: stats.systems.types.CWS },
    { name: 'Transient Non-Community', count: stats.systems.types.TNCWS },
    { name: 'Non-Transient Non-Community', count: stats.systems.types.NTNCWS },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Georgia Water Quality Management Dashboard</h1>
            <p className="text-blue-100 mb-4">
              Real-time monitoring and analysis of drinking water systems across Georgia
            </p>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <Activity className="w-4 h-4 mr-1" />
                Last Updated: {new Date().toLocaleString()}
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                Role: {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
              </div>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleExportData}
              className="flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
            <button
              onClick={handleShareData}
              className="flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Overview', icon: TrendingUp },
            { id: 'compliance', name: 'Compliance Analysis', icon: CheckCircle },
            { id: 'contaminants', name: 'Contaminant Analysis', icon: AlertTriangle },
            { id: 'trends', name: 'Trends & Patterns', icon: Calendar }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-500" />
                <div className="ml-4">
                  <h3 className="text-2xl font-bold text-gray-900">{stats?.systems.total.toLocaleString()}</h3>
                  <p className="text-sm text-gray-600">Water Systems</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <div className="ml-4">
                  <h3 className="text-2xl font-bold text-gray-900">{stats?.systems.compliant.toLocaleString()}</h3>
                  <p className="text-sm text-gray-600">Compliant Systems</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <AlertTriangle className="w-8 h-8 text-red-500" />
                <div className="ml-4">
                  <h3 className="text-2xl font-bold text-gray-900">{stats?.violations.unaddressed.toLocaleString()}</h3>
                  <p className="text-sm text-gray-600">Unaddressed Violations</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <MapPin className="w-8 h-8 text-purple-500" />
                <div className="ml-4">
                  <h3 className="text-2xl font-bold text-gray-900">{stats?.systems.totalPopulation.toLocaleString()}</h3>
                  <p className="text-sm text-gray-600">Population Served</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Compliance Status Pie Chart */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">System Compliance Status</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={complianceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {complianceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value.toLocaleString(), 'Systems']} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* System Types Bar Chart */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">System Type Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={systemTypeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [value.toLocaleString(), 'Systems']} />
                  <Bar dataKey="count" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Trends Tab */}
      {activeTab === 'trends' && (
        <div className="space-y-6">
          {/* Time Range Selector */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Violation Trends</h3>
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="6">Last 6 months</option>
                <option value="12">Last 12 months</option>
                <option value="24">Last 24 months</option>
              </select>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={violationTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="total" stackId="1" stroke="#EF4444" fill="#FEE2E2" name="Total Violations" />
                <Area type="monotone" dataKey="healthBased" stackId="2" stroke="#DC2626" fill="#EF4444" name="Health-Based" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Contaminants Tab */}
      {activeTab === 'contaminants' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Top Contaminants by Violations</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={contaminantAnalysis} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="contaminant" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="violations" fill="#EF4444" name="Violations" />
                <Bar dataKey="exceedances" fill="#DC2626" name="MCL Exceedances" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Compliance Tab */}
      {activeTab === 'compliance' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">System Compliance Analysis</h3>
              <div className="text-sm text-gray-600">
                {complianceAnalysis.length} systems total
                {complianceAnalysis.length > itemsPerPage && (
                  <span className="ml-2 text-gray-500">
                    (showing {Math.min(itemsPerPage, complianceAnalysis.length - (currentPage - 1) * itemsPerPage)} on this page)
                  </span>
                )}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">System</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Violations</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Health-Based</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Population</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedComplianceData.map((system, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {system.pws_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {system.total_violations}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {system.health_based_violations}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {system.population_served_count?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          system.compliance_status === 'compliant' 
                            ? 'bg-green-100 text-green-800'
                            : system.compliance_status === 'critical'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {system.compliance_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {complianceAnalysis.length > 0 && (
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalItems={complianceAnalysis.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                  itemsPerPageOptions={[10, 25, 50, 100]}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Public Data Sharing Notice */}
      {userRole === 'public' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <Share2 className="w-5 h-5 text-blue-500 mt-0.5 mr-3" />
            <div>
              <h4 className="text-sm font-medium text-blue-800">Public Data Access</h4>
              <p className="text-sm text-blue-700 mt-1">
                This dashboard provides public access to Georgia's drinking water quality data. 
                You can export and share this information to help promote water safety awareness in your community.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};