import React, { useState, useEffect, useMemo } from 'react';
import { Share2, Download, Globe, Users, Lock, Eye, Calendar, Filter, Search, ExternalLink, Copy, Mail, MessageSquare } from 'lucide-react';
import { Pagination } from './Pagination';
import { SupabaseService } from '../services/supabaseService';
import { UserRole } from '../types/sdwis';

interface DataSharingHubProps {
  userRole: UserRole;
}

interface SharedDataset {
  id: string;
  title: string;
  description: string;
  dataType: 'violations' | 'samples' | 'systems' | 'analysis';
  visibility: 'public' | 'restricted' | 'private';
  createdBy: string;
  createdAt: string;
  downloadCount: number;
  lastUpdated: string;
  tags: string[];
  fileSize: string;
  format: 'JSON' | 'CSV' | 'PDF';
}

const mockSharedDatasets: SharedDataset[] = [
  {
    id: '1',
    title: 'Georgia Water Quality Violations 2024',
    description: 'Comprehensive dataset of all water quality violations reported in Georgia during 2024, including health-based and monitoring violations.',
    dataType: 'violations',
    visibility: 'public',
    createdBy: 'GA Environmental Protection Division',
    createdAt: '2024-01-15',
    downloadCount: 1247,
    lastUpdated: '2024-12-28',
    tags: ['violations', 'health-based', 'monitoring', '2024'],
    fileSize: '2.3 MB',
    format: 'CSV'
  },
  {
    id: '2',
    title: 'Community Water Systems Analysis',
    description: 'Statistical analysis of community water systems performance, compliance rates, and population served across Georgia counties.',
    dataType: 'analysis',
    visibility: 'public',
    createdBy: 'Georgia Water Research Institute',
    createdAt: '2024-02-20',
    downloadCount: 892,
    lastUpdated: '2024-12-25',
    tags: ['community-systems', 'compliance', 'analysis'],
    fileSize: '1.8 MB',
    format: 'PDF'
  },
  {
    id: '3',
    title: 'Contaminant Sample Results - Metro Atlanta',
    description: 'Laboratory sample results for contaminant testing in Metro Atlanta water systems, including chemical and microbiological parameters.',
    dataType: 'samples',
    visibility: 'restricted',
    createdBy: 'Atlanta Water Department',
    createdAt: '2024-03-10',
    downloadCount: 456,
    lastUpdated: '2024-12-27',
    tags: ['atlanta', 'contaminants', 'lab-results'],
    fileSize: '5.7 MB',
    format: 'JSON'
  }
];

export const DataSharingHub: React.FC<DataSharingHubProps> = ({ userRole }) => {
  const [datasets, setDatasets] = useState<SharedDataset[]>(mockSharedDatasets);
  const [filteredDatasets, setFilteredDatasets] = useState<SharedDataset[]>(mockSharedDatasets);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDataType, setSelectedDataType] = useState<string>('all');
  const [selectedVisibility, setSelectedVisibility] = useState<string>('all');
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState<SharedDataset | null>(null);
  const [shareMethod, setShareMethod] = useState<'link' | 'email' | 'embed'>('link');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  const filteredData = useMemo(() => {
    let filtered = datasets;

    if (searchTerm) {
      filtered = filtered.filter(dataset => 
        dataset.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dataset.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dataset.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedDataType !== 'all') {
      filtered = filtered.filter(dataset => dataset.dataType === selectedDataType);
    }

    if (selectedVisibility !== 'all') {
      filtered = filtered.filter(dataset => dataset.visibility === selectedVisibility);
    }

    // Filter based on user role
    if (userRole === 'public') {
      filtered = filtered.filter(dataset => dataset.visibility === 'public');
    }

    return filtered;
  }, [searchTerm, selectedDataType, selectedVisibility, datasets, userRole]);

  const paginatedDatasets = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  useEffect(() => {
    setFilteredDatasets(filteredData);
    setCurrentPage(1);
  }, [filteredData]);

  const handleDownload = async (dataset: SharedDataset) => {
    try {
      // In a real implementation, this would download the actual dataset
      const mockData = {
        dataset: dataset.title,
        description: dataset.description,
        downloadedAt: new Date().toISOString(),
        downloadedBy: userRole,
        format: dataset.format,
        data: 'Mock data would be here in real implementation'
      };

      const blob = new Blob([JSON.stringify(mockData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${dataset.title.replace(/\s+/g, '-').toLowerCase()}.${dataset.format.toLowerCase()}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Update download count
      setDatasets(prev => prev.map(d => 
        d.id === dataset.id ? { ...d, downloadCount: d.downloadCount + 1 } : d
      ));
    } catch (error) {
      console.error('Error downloading dataset:', error);
    }
  };

  const handleShare = (dataset: SharedDataset) => {
    setSelectedDataset(dataset);
    setShowShareModal(true);
  };

  const generateShareLink = (dataset: SharedDataset) => {
    return `${window.location.origin}/shared-data/${dataset.id}`;
  };

  const handleCopyLink = async (dataset: SharedDataset) => {
    const link = generateShareLink(dataset);
    try {
      await navigator.clipboard.writeText(link);
      alert('Link copied to clipboard!');
    } catch (error) {
      console.error('Error copying link:', error);
    }
  };

  const handleEmailShare = (dataset: SharedDataset) => {
    const subject = encodeURIComponent(`Georgia Water Quality Data: ${dataset.title}`);
    const body = encodeURIComponent(
      `I wanted to share this water quality dataset with you:\n\n` +
      `${dataset.title}\n` +
      `${dataset.description}\n\n` +
      `Access the data here: ${generateShareLink(dataset)}\n\n` +
      `This data is provided by the Georgia Water Quality Management System.`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const generateEmbedCode = (dataset: SharedDataset) => {
    return `<iframe src="${generateShareLink(dataset)}/embed" width="100%" height="400" frameborder="0"></iframe>`;
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public': return <Globe className="w-4 h-4 text-green-500" />;
      case 'restricted': return <Users className="w-4 h-4 text-yellow-500" />;
      case 'private': return <Lock className="w-4 h-4 text-red-500" />;
      default: return <Eye className="w-4 h-4 text-gray-500" />;
    }
  };

  const getDataTypeColor = (dataType: string) => {
    switch (dataType) {
      case 'violations': return 'bg-red-100 text-red-800';
      case 'samples': return 'bg-blue-100 text-blue-800';
      case 'systems': return 'bg-green-100 text-green-800';
      case 'analysis': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Water Quality Data Sharing Hub</h1>
            <p className="text-green-100 mb-4">
              Access, download, and share Georgia's water quality data to promote transparency and public health awareness
            </p>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <Globe className="w-4 h-4 mr-1" />
                Open Data Initiative
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                Community Access: {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
              </div>
            </div>
          </div>
          {userRole !== 'public' && (
            <button className="flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
              <Share2 className="w-4 h-4 mr-2" />
              Share New Dataset
            </button>
          )}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search datasets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={selectedDataType}
            onChange={(e) => setSelectedDataType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Data Types</option>
            <option value="violations">Violations</option>
            <option value="samples">Sample Results</option>
            <option value="systems">Water Systems</option>
            <option value="analysis">Analysis Reports</option>
          </select>

          <select
            value={selectedVisibility}
            onChange={(e) => setSelectedVisibility(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Access Levels</option>
            <option value="public">Public</option>
            {userRole !== 'public' && <option value="restricted">Restricted</option>}
            {userRole === 'admin' && <option value="private">Private</option>}
          </select>

          <div className="text-sm text-gray-600 flex items-center">
            <Filter className="w-4 h-4 mr-1" />
            {filteredData.length} datasets found
            {filteredData.length > itemsPerPage && (
              <span className="ml-2 text-gray-500">
                (showing {Math.min(itemsPerPage, filteredData.length - (currentPage - 1) * itemsPerPage)} on this page)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Datasets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {paginatedDatasets.map((dataset) => (
          <div key={dataset.id} className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {getVisibilityIcon(dataset.visibility)}
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDataTypeColor(dataset.dataType)}`}>
                    {dataset.dataType}
                  </span>
                </div>
                <span className="text-xs text-gray-500">{dataset.format}</span>
              </div>

              {/* Title and Description */}
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{dataset.title}</h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">{dataset.description}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {dataset.tags.slice(0, 3).map((tag, index) => (
                  <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                    {tag}
                  </span>
                ))}
                {dataset.tags.length > 3 && (
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                    +{dataset.tags.length - 3} more
                  </span>
                )}
              </div>

              {/* Metadata */}
              <div className="space-y-2 text-xs text-gray-500 mb-4">
                <div className="flex justify-between">
                  <span>Created by:</span>
                  <span className="font-medium">{dataset.createdBy}</span>
                </div>
                <div className="flex justify-between">
                  <span>Last updated:</span>
                  <span>{new Date(dataset.lastUpdated).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Downloads:</span>
                  <span>{dataset.downloadCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>File size:</span>
                  <span>{dataset.fileSize}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={() => handleDownload(dataset)}
                  className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </button>
                <button
                  onClick={() => handleShare(dataset)}
                  className="flex items-center justify-center px-3 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleCopyLink(dataset)}
                  className="flex items-center justify-center px-3 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {filteredData.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={filteredData.length}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
          itemsPerPageOptions={[10, 25, 50, 100]}
        />
      )}

      {/* Share Modal */}
      {showShareModal && selectedDataset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Share Dataset</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-1">{selectedDataset.title}</h4>
              <p className="text-sm text-gray-600">{selectedDataset.description}</p>
            </div>

            <div className="space-y-3">
              <div className="flex space-x-2">
                <button
                  onClick={() => setShareMethod('link')}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-md ${
                    shareMethod === 'link' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Link
                </button>
                <button
                  onClick={() => setShareMethod('email')}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-md ${
                    shareMethod === 'email' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Email
                </button>
                <button
                  onClick={() => setShareMethod('embed')}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-md ${
                    shareMethod === 'embed' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Embed
                </button>
              </div>

              {shareMethod === 'link' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Share Link</label>
                  <div className="flex">
                    <input
                      type="text"
                      value={generateShareLink(selectedDataset)}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50 text-sm"
                    />
                    <button
                      onClick={() => handleCopyLink(selectedDataset)}
                      className="px-3 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {shareMethod === 'email' && (
                <div>
                  <button
                    onClick={() => handleEmailShare(selectedDataset)}
                    className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Open Email Client
                  </button>
                </div>
              )}

              {shareMethod === 'embed' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Embed Code</label>
                  <textarea
                    value={generateEmbedCode(selectedDataset)}
                    readOnly
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm font-mono"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Public Access Notice */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start">
          <Globe className="w-5 h-5 text-green-500 mt-0.5 mr-3" />
          <div>
            <h4 className="text-sm font-medium text-green-800">Open Data Initiative</h4>
            <p className="text-sm text-green-700 mt-1">
              Georgia is committed to transparency in water quality management. Public datasets are freely available 
              to researchers, journalists, community organizations, and citizens to promote water safety awareness 
              and informed decision-making.
            </p>
            <div className="mt-3 flex space-x-4 text-xs text-green-600">
              <span>• Real-time updates</span>
              <span>• Multiple formats available</span>
              <span>• API access for developers</span>
              <span>• Community feedback encouraged</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};