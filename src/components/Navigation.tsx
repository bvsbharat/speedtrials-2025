import React from 'react';
import { 
  Search, 
  AlertTriangle, 
  FileText, 
  MapPin, 
  BarChart3, 
  Calendar,
  Shield,
  Database,
  Upload,
  Home
} from 'lucide-react';
import { UserRole } from '../types/sdwis';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userRole: UserRole;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange, userRole }) => {
  const publicTabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'search', label: 'Water Systems', icon: Search },
    { id: 'map', label: 'Map View', icon: MapPin },
    { id: 'violations', label: 'Violations', icon: AlertTriangle },
    { id: 'samples', label: 'Water Quality', icon: FileText },
  ];

  const staffTabs = [
    ...publicTabs,
    { id: 'enforcement', label: 'Enforcement', icon: Shield },
    { id: 'inspections', label: 'Inspections', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'upload', label: 'Data Upload', icon: Upload },
  ];

  const adminTabs = [
    ...staffTabs,
    { id: 'management', label: 'Management', icon: Database },
  ];

  const getTabs = () => {
    switch (userRole) {
      case 'admin':
        return adminTabs;
      case 'staff':
        return staffTabs;
      default:
        return publicTabs;
    }
  };

  const tabs = getTabs();

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};