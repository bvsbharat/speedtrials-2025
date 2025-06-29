import React, { useState, useEffect } from "react";
import {
  User,
  Search,
  AlertTriangle,
  MapPin,
  BarChart3,
  Calendar,
  Shield,
  Database,
  Upload,
  Crown,
  Users,
  Globe,
  FileText,
  ChevronDown,
} from "lucide-react";
import { UserRole } from "../types/sdwis";

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogoClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  activeTab,
  onTabChange,
  onLogoClick,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
  const [isStaffDropdownOpen, setIsStaffDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Show header when scrolling up or at the top
      if (currentScrollY < lastScrollY || currentScrollY < 10) {
        setIsVisible(true);
      } else {
        // Hide header when scrolling down
        setIsVisible(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".dropdown-container")) {
        setIsRoleDropdownOpen(false);
        setIsAdminDropdownOpen(false);
        setIsStaffDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const mainTabs = [
    { id: "dashboard", label: "Interactive Dashboard", icon: BarChart3 },
    { id: "search", label: "Water Systems", icon: Search },
    { id: "map", label: "Map View", icon: MapPin },
    { id: "violations", label: "Violations", icon: AlertTriangle },
    { id: "samples", label: "Water Quality", icon: FileText },
  ];

  const staffTabs = [
    { id: "enforcement", label: "Enforcement", icon: Shield },
    { id: "inspections", label: "Inspections", icon: Calendar },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "upload", label: "Data Upload", icon: Upload },
  ];

  const adminSecondaryTabs = [
    { id: "management", label: "System Management", icon: Database },
    { id: "users", label: "User Management", icon: Users },
  ];

  const getVisibleTabs = () => {
    return mainTabs;
  };

  const tabs = getVisibleTabs();

  const handleLogoClick = () => {
    onTabChange("home");
    if (onLogoClick) {
      onLogoClick();
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case "public":
        return Globe;
      case "staff":
        return Users;
      case "admin":
        return Crown;
      default:
        return Globe;
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case "public":
        return "text-green-600";
      case "staff":
        return "text-blue-600";
      case "admin":
        return "text-purple-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <header
      className={`bg-transparent backdrop-blur-md shadow-lg border border-white/20 fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out ${
        isVisible ? "transform translate-y-0" : "transform -translate-y-full"
      }`}
    >
      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLogoClick}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">GA</span>
              </div>
              <div>
                <h1 className={`text-xl font-bold ${
                  activeTab === 'home' ? 'text-white' : 'text-gray-900'
                }`}>Georgia EPD</h1>
                <p className={`text-sm ${
                  activeTab === 'home' ? 'text-white/80' : 'text-gray-600'
                }`}>Drinking Water Viewer</p>
              </div>
            </button>
          </div>

          <div className="flex items-center space-x-8">
            {/* Navigation Tabs */}
            <nav className="flex space-x-6">
              {getVisibleTabs().map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`flex items-center space-x-2 py-2 px-3 rounded-lg font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? "bg-blue-100 text-blue-700"
                        : activeTab === 'home'
                        ? "text-white hover:text-gray-200 hover:bg-white/10"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Staff Dropdown */}
            {(currentRole === "staff" || currentRole === "admin") && (
              <div className="relative dropdown-container">
                <button
                  onClick={() => setIsStaffDropdownOpen(!isStaffDropdownOpen)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'home'
                      ? 'text-white hover:text-gray-200 hover:bg-white/10'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Shield className="h-4 w-4" />
                  <span className="font-medium">Staff</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      isStaffDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isStaffDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    {staffTabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => {
                            onTabChange(tab.id);
                            setIsStaffDropdownOpen(false);
                          }}
                          className={`w-full flex items-center space-x-2 px-4 py-2 text-left transition-colors ${
                            activeTab === tab.id
                              ? "bg-blue-50 text-blue-700"
                              : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center space-x-4">
              {/* Role Dropdown */}
              <div className="relative dropdown-container">
                <button
                  onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
                    currentRole === "public"
                      ? "bg-green-50 border-green-200 text-green-800"
                      : currentRole === "staff"
                      ? "bg-blue-50 border-blue-200 text-blue-800"
                      : "bg-purple-50 border-purple-200 text-purple-800"
                  } hover:shadow-sm`}
                >
                  {React.createElement(getRoleIcon(currentRole), {
                    className: "w-4 h-4",
                  })}
                  <span className="text-sm font-medium">
                    {currentRole.charAt(0).toUpperCase() + currentRole.slice(1)}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      isRoleDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isRoleDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    {currentRole !== "public" && (
                      <button
                        onClick={() => {
                          onRoleChange("public");
                          setIsRoleDropdownOpen(false);
                        }}
                        className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Globe className="w-4 h-4 text-green-600" />
                        <span>Public User</span>
                      </button>
                    )}
                    {currentRole !== "staff" && (
                      <button
                        onClick={() => {
                          onRoleChange("staff");
                          setIsRoleDropdownOpen(false);
                        }}
                        className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Users className="w-4 h-4 text-blue-600" />
                        <span>Staff User</span>
                      </button>
                    )}
                    {currentRole !== "admin" && (
                      <button
                        onClick={() => {
                          onRoleChange("admin");
                          setIsRoleDropdownOpen(false);
                        }}
                        className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Crown className="w-4 h-4 text-purple-600" />
                        <span>Admin User</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
