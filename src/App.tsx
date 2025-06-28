import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Header } from "./components/Header";
import { WaterSystemSearch } from "./components/WaterSystemSearch";
import { ViolationsTab } from "./components/ViolationsTab";
import { SampleResultsTab } from "./components/SampleResultsTab";
import { Dashboard } from "./components/Dashboard";
import { EnhancedDashboard } from "./components/EnhancedDashboard";
import { DataSharingHub } from "./components/DataSharingHub";
import { MapView } from "./components/MapView";
import { DataUpload } from "./components/DataUpload";
import { LandingPage } from "./components/LandingPage";
import { WaterSystem, UserRole } from "./types/sdwis";

function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>("admin");
  const [selectedSystem, setSelectedSystem] = useState<WaterSystem | null>(
    null
  );
  const navigate = useNavigate();
  const location = useLocation();

  // Load saved role from localStorage on component mount
  useEffect(() => {
    const savedRole = localStorage.getItem("selectedUserRole") as UserRole;
    if (savedRole && ["public", "staff", "admin"].includes(savedRole)) {
      setCurrentRole(savedRole);
    }
  }, []);

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    localStorage.setItem("selectedUserRole", role);
  };

  const handleTabChange = (tab: string) => {
    navigate(`/${tab === "home" ? "" : tab}`);
  };

  // Get current active tab from location
  const getActiveTab = () => {
    const path = location.pathname.slice(1);
    return path === "" ? "home" : path;
  };

  const activeTab = getActiveTab();

  const EnforcementPage = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">
        Enforcement Actions
      </h3>
      <p className="text-gray-600">
        This section would display enforcement actions, penalties, and
        compliance measures taken against water systems with violations.
        Available for staff and admin users.
      </p>
    </div>
  );

  const InspectionsPage = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">
        System Inspections
      </h3>
      <p className="text-gray-600">
        This section would show inspection schedules, reports, and findings for
        water system facilities. Available for staff and admin users.
      </p>
    </div>
  );

  const ManagementPage = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">
        System Management
      </h3>
      <p className="text-gray-600">
        This section would provide administrative tools for data management,
        user access control, and system configuration. Available for admin users
        only.
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onLogoClick={() => handleTabChange("home")}
      />
      <div className="pt-20">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/search"
            element={
              <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <WaterSystemSearch
                  selectedSystem={selectedSystem}
                  onSystemSelect={setSelectedSystem}
                  currentRole={currentRole}
                />
              </main>
            }
          />
          <Route path="/map" element={<MapView />} />
          <Route path="/research" element={<MapView />} />
          <Route
            path="/dashboard"
            element={
              <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <EnhancedDashboard />
              </main>
            }
          />
          <Route
            path="/violations"
            element={
              <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <ViolationsTab />
              </main>
            }
          />
          <Route
            path="/samples"
            element={
              <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <SampleResultsTab />
              </main>
            }
          />
          <Route
            path="/upload"
            element={
              <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <DataUpload />
              </main>
            }
          />
          <Route
            path="/enforcement"
            element={
              <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <EnforcementPage />
              </main>
            }
          />
          <Route
            path="/inspections"
            element={
              <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <InspectionsPage />
              </main>
            }
          />
          <Route
            path="/analytics"
            element={
              <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Dashboard />
              </main>
            }
          />
          <Route
            path="/sharing"
            element={
              <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <DataSharingHub />
              </main>
            }
          />
          <Route
            path="/management"
            element={
              <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <ManagementPage />
              </main>
            }
          />
        </Routes>
      </div>

      {/* System Detail Modal */}
      {selectedSystem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedSystem.name}
              </h2>
              <button
                onClick={() => setSelectedSystem(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="sr-only">Close</span>
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    System Information
                  </h3>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        PWSID
                      </dt>
                      <dd className="text-sm text-gray-900">
                        {selectedSystem.pwsid}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Type
                      </dt>
                      <dd className="text-sm text-gray-900">
                        {selectedSystem.type}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Population Served
                      </dt>
                      <dd className="text-sm text-gray-900">
                        {selectedSystem.populationServed.toLocaleString()}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Primary Source
                      </dt>
                      <dd className="text-sm text-gray-900">
                        {selectedSystem.primarySource}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Location
                  </h3>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        City
                      </dt>
                      <dd className="text-sm text-gray-900">
                        {selectedSystem.city}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        County
                      </dt>
                      <dd className="text-sm text-gray-900">
                        {selectedSystem.county}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        State
                      </dt>
                      <dd className="text-sm text-gray-900">
                        {selectedSystem.state}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        ZIP Code
                      </dt>
                      <dd className="text-sm text-gray-900">
                        {selectedSystem.zipCode}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  This modal would contain detailed system information, recent
                  violations, sample results, and other relevant data for the
                  selected water system.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
