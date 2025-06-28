import React, { useState, useEffect } from "react";
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
  const [activeTab, setActiveTab] = useState("home");
  const [currentRole, setCurrentRole] = useState<UserRole>("admin");
  const [selectedSystem, setSelectedSystem] = useState<WaterSystem | null>(
    null
  );

  // Load saved role and active tab from localStorage on component mount
  useEffect(() => {
    const savedRole = localStorage.getItem("selectedUserRole") as UserRole;
    if (savedRole && ["public", "staff", "admin"].includes(savedRole)) {
      setCurrentRole(savedRole);
    }

    // Clear any saved tab and always start with home view
    localStorage.removeItem("activeTab");
    setActiveTab("home");
    console.log("Setting activeTab to home");
  }, []);

  // Debug log to see current activeTab value
  useEffect(() => {
    console.log("Current activeTab:", activeTab);
  }, [activeTab]);

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    localStorage.setItem("selectedUserRole", role);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    localStorage.setItem("activeTab", tab);
  };

  const renderTabContent = () => {
    console.log('renderTabContent called with activeTab:', activeTab);
    switch (activeTab) {
      case "home":
        return <LandingPage />;
      case "search":
        return <WaterSystemSearch onSystemSelect={setSelectedSystem} />;
      case "map":
        console.log('Rendering MapView');
        return <MapView onSystemSelect={setSelectedSystem} />;
      case "violations":
        return <ViolationsTab />;
      case "samples":
        return <SampleResultsTab />;
      case "upload":
        return <DataUpload />;
      case "enforcement":
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Enforcement Actions
            </h3>
            <p className="text-gray-600">
              This section would display enforcement actions, administrative
              orders, and compliance tracking. Available for staff and admin
              users only.
            </p>
          </div>
        );
      case "inspections":
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Site Inspections
            </h3>
            <p className="text-gray-600">
              This section would display site visit reports, inspection
              schedules, and findings. Available for staff and admin users only.
            </p>
          </div>
        );
      case "analytics":
        console.log('Rendering EnhancedDashboard');
        return <EnhancedDashboard userRole={currentRole} />;
      case "sharing":
        return <DataSharingHub userRole={currentRole} />;
      case "management":
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              System Management
            </h3>
            <p className="text-gray-600">
              This section would provide administrative tools for data
              management, user access control, and system configuration.
              Available for admin users only.
            </p>
          </div>
        );
      default:
        return <LandingPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        currentRole={currentRole} 
        onRoleChange={handleRoleChange}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onLogoClick={() => handleTabChange('home')}
      />
      <div className="pt-20">
        {activeTab === "map" || activeTab === "home" ? (
          renderTabContent()
        ) : (
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {renderTabContent()}
          </main>
        )}
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
