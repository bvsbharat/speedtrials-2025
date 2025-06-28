import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AlertTriangle, CheckCircle, TrendingUp, Users } from 'lucide-react';
import { mockWaterSystems, mockViolations } from '../data/mockData';

export const Dashboard: React.FC = () => {
  // Calculate statistics
  const totalSystems = mockWaterSystems.length;
  const compliantSystems = mockWaterSystems.filter(s => s.complianceStatus === 'compliant').length;
  const violationSystems = mockWaterSystems.filter(s => s.complianceStatus === 'violation').length;
  const criticalSystems = mockWaterSystems.filter(s => s.complianceStatus === 'critical').length;
  const totalPopulation = mockWaterSystems.reduce((sum, s) => sum + s.populationServed, 0);

  // Compliance data for pie chart
  const complianceData = [
    { name: 'Compliant', value: compliantSystems, color: '#10B981' },
    { name: 'Minor Issues', value: violationSystems, color: '#F59E0B' },
    { name: 'Critical', value: criticalSystems, color: '#EF4444' },
  ];

  // System type distribution
  const systemTypeData = [
    { name: 'Community', count: mockWaterSystems.filter(s => s.type === 'CWS').length },
    { name: 'Transient Non-Community', count: mockWaterSystems.filter(s => s.type === 'TNCWS').length },
    { name: 'Non-Transient Non-Community', count: mockWaterSystems.filter(s => s.type === 'NTNCWS').length },
  ];

  // Recent violations by month (mock data)
  const violationTrendData = [
    { month: 'Oct', violations: 8 },
    { month: 'Nov', violations: 12 },
    { month: 'Dec', violations: 6 },
    { month: 'Jan', violations: 4 },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Georgia EPD Drinking Water Viewer</h1>
        <p className="text-blue-100">
          Monitor water system compliance, track violations, and ensure safe drinking water for all Georgians.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-500" />
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900">{totalSystems}</h3>
              <p className="text-sm text-gray-600">Water Systems</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900">{compliantSystems}</h3>
              <p className="text-sm text-gray-600">Compliant Systems</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <AlertTriangle className="w-8 h-8 text-amber-500" />
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900">{mockViolations.length}</h3>
              <p className="text-sm text-gray-600">Active Violations</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-purple-500" />
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900">{(totalPopulation / 1000000).toFixed(1)}M</h3>
              <p className="text-sm text-gray-600">Population Served</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compliance Status Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={complianceData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {complianceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* System Types Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Types</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={systemTypeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Violation Trends */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Violation Trends (Last 4 Months)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={violationTrendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="violations" fill="#F59E0B" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <div>
              <p className="text-sm font-medium text-gray-900">New MCL violation reported</p>
              <p className="text-xs text-gray-600">Mountain Valley Water - Nitrate levels exceeded - 2 hours ago</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-sm font-medium text-gray-900">Violation resolved</p>
              <p className="text-xs text-gray-600">Augusta Utilities - Coliform violation closed - 1 day ago</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-sm font-medium text-gray-900">Inspection completed</p>
              <p className="text-xs text-gray-600">City of Atlanta - Routine inspection completed - 3 days ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};