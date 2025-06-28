import React, { useState, useRef, useEffect, useCallback } from "react";
import { Wrapper, Status } from "@googlemaps/react-wrapper";
import {
  Calendar,
  Download,
  Share2,
  Eye,
  ChevronDown,
  ChevronUp,
  BarChart3,
  TrendingUp,
  Clock,
  MapPin,
  Filter,
  Layers,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  Square,
  Trash2,
} from "lucide-react";
import { SupabaseService } from "../services/supabaseService";
import GeocodingService, {
  CoordinateResult,
} from "../services/geocodingService";
import { WaterSystem } from "../types/sdwis";
import {
  MapFilters,
  MapMarker,
  HeatmapData,
  PolygonSelection,
} from "../types/maps";
import TimelineSlider from "./TimelineSlider";
import ZoneDetailsPanel from "./ZoneDetailsPanel";

interface MapComponentProps {
  center: google.maps.LatLngLiteral;
  zoom: number;
  waterSystems: WaterSystem[];
  filters: MapFilters;
  violations: any[];
  onMarkerClick: (marker: MapMarker) => void;
  onPolygonComplete: (polygon: google.maps.Polygon) => void;
  drawingMode: boolean;
}

const MapComponent: React.FC<MapComponentProps> = ({
  center,
  zoom,
  waterSystems,
  filters,
  violations,
  onMarkerClick,
  onPolygonComplete,
  drawingMode,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map>();
  const [heatmap, setHeatmap] =
    useState<google.maps.visualization.HeatmapLayer>();
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [drawingManager, setDrawingManager] =
    useState<google.maps.drawing.DrawingManager>();

  useEffect(() => {
    if (ref.current && !map) {
      const newMap = new google.maps.Map(ref.current, {
        center,
        zoom,
        styles: [
          {
            featureType: "all",
            elementType: "geometry",
            stylers: [{ color: "#f5f5f5" }],
          },
          {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#c9d6ff" }],
          },
          {
            featureType: "landscape",
            elementType: "geometry",
            stylers: [{ color: "#f5f5f5" }],
          },
          {
            featureType: "road",
            elementType: "geometry",
            stylers: [{ color: "#ffffff" }],
          },
          {
            featureType: "road",
            elementType: "labels",
            stylers: [{ visibility: "on" }],
          },
          {
            featureType: "administrative",
            elementType: "labels",
            stylers: [{ visibility: "on" }],
          },
        ],
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        zoomControlOptions: {
          position: google.maps.ControlPosition.BOTTOM_LEFT,
        },
      });
      setMap(newMap);

      // Initialize drawing manager
      const newDrawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: null,
        drawingControl: false,
        polygonOptions: {
          fillColor: "#2563eb",
          fillOpacity: 0.2,
          strokeColor: "#2563eb",
          strokeWeight: 2,
          clickable: true,
          editable: true,
          zIndex: 1,
        },
      });

      newDrawingManager.setMap(newMap);
      setDrawingManager(newDrawingManager);

      // Handle polygon completion
      newDrawingManager.addListener(
        "polygoncomplete",
        (polygon: google.maps.Polygon) => {
          onPolygonComplete(polygon);
          // Disable drawing mode after polygon is created
          newDrawingManager.setDrawingMode(null);
        }
      );
    }
  }, [ref, map, center, zoom, onPolygonComplete]);

  // Handle drawing mode changes
  useEffect(() => {
    if (drawingManager) {
      drawingManager.setDrawingMode(
        drawingMode ? google.maps.drawing.OverlayType.POLYGON : null
      );
    }
  }, [drawingManager, drawingMode]);

  // Create markers with async coordinate fetching
  useEffect(() => {
    const createMarkersAsync = async () => {
      console.log("🗺️ Creating markers for", waterSystems.length, "systems");

      if (!map || waterSystems.length === 0) return;

      // Clear existing markers
      markers.forEach((marker) => marker.setMap(null));

      const newMarkers: google.maps.Marker[] = [];
      const heatmapData: google.maps.LatLng[] = [];

      // Process systems in batches to avoid overwhelming the geocoding service
      const batchSize = 10;
      for (let i = 0; i < waterSystems.length; i += batchSize) {
        const batch = waterSystems.slice(i, i + batchSize);

        const batchPromises = batch.map(async (system, batchIndex) => {
          const index = i + batchIndex;
          try {
            // Get coordinates for the system
            const coords = await getCoordinatesForSystem(system);

            // Get violation count for this system
            const systemViolations = violations.filter(
              (v) => v.pwsid === system.pwsid
            );
            const activeViolations = systemViolations.filter(
              (v) => v.status === "Unaddressed" || v.status === "Addressed"
            );
            const healthBasedViolations = activeViolations.filter(
              (v) => v.isHealthBased
            );

            // Debug logging for first few systems
            if (index < 3) {
              console.log(`System ${index} (${system.pwsid}):`, {
                totalViolations: systemViolations.length,
                activeViolations: activeViolations.length,
                healthBasedViolations: healthBasedViolations.length,
                sampleViolation: activeViolations[0],
              });
            }

            // Determine system status based on violations
            let systemStatus = "compliant";
            if (healthBasedViolations.length > 0) {
              systemStatus = "critical";
            } else if (activeViolations.length > 0) {
              systemStatus = "violation";
            }

            // Apply filters based on system status
            if (systemStatus === "compliant" && !filters.showCompliant)
              return null;
            if (systemStatus === "violation" && !filters.showActiveViolations)
              return null;
            if (systemStatus === "critical" && !filters.showCriticalSystems)
              return null;

            // Add to heatmap based on compliance status
            if (filters.showViolationHeatmap && systemStatus !== "compliant") {
              const weight =
                healthBasedViolations.length > 0
                  ? 5
                  : activeViolations.length > 3
                  ? 3
                  : activeViolations.length > 1
                  ? 2
                  : 1;
              heatmapData.push({
                location: new google.maps.LatLng(coords.lat, coords.lng),
                weight: weight,
              });
            }

            // Create marker with enhanced styling
            const markerSize = Math.max(
              8,
              Math.min(25, Math.sqrt((system.populationServed || 100) / 100))
            );
            const marker = new google.maps.Marker({
              position: coords,
              map: map,
              title: `${system.name}\nPopulation: ${(
                system.populationServed || 0
              ).toLocaleString()}\nActive Violations: ${
                activeViolations.length
              }`,
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: markerSize,
                fillColor: getMarkerColor(systemStatus),
                fillOpacity: 0.8,
                strokeColor:
                  systemStatus === "critical"
                    ? "#dc2626"
                    : systemStatus === "violation"
                    ? "#f59e0b"
                    : "#10b981",
                strokeWeight: systemStatus === "critical" ? 3 : 2,
              },
              zIndex:
                systemStatus === "critical"
                  ? 1000
                  : systemStatus === "violation"
                  ? 500
                  : 100,
            });

            marker.addListener("click", () => {
              onMarkerClick({
                id: system.pwsid,
                position: coords,
                title: system.name,
                type: "water_system",
                status: systemStatus,
                data: {
                  ...system,
                  complianceStatus: systemStatus,
                  violationCount: activeViolations.length,
                  healthBasedViolationCount: healthBasedViolations.length,
                  violations: systemViolations,
                },
              });
            });

            if (index < 5) {
              console.log(`Created marker ${index} for system:`, system.name);
            }

            return marker;
          } catch (error) {
            console.error(
              "Error creating marker for system:",
              system.name,
              error
            );
            return null;
          }
        });

        const batchMarkers = await Promise.all(batchPromises);
        const validMarkers = batchMarkers.filter(
          (marker) => marker !== null
        ) as google.maps.Marker[];
        newMarkers.push(...validMarkers);

        // Small delay between batches to be respectful to the geocoding service
        if (i + batchSize < waterSystems.length) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      setMarkers(newMarkers);
      console.log(`Total markers created: ${newMarkers.length}`);

      // Update heatmap
      if (heatmap) {
        heatmap.setMap(null);
      }

      if (heatmapData.length > 0 && filters.showViolations) {
        const newHeatmap = new google.maps.visualization.HeatmapLayer({
          data: heatmapData,
          map: map,
          radius: 80,
          opacity: 0.7,
          gradient: [
            "rgba(0, 0, 255, 0)",
            "rgba(0, 0, 255, 0.2)",
            "rgba(0, 100, 255, 0.4)",
            "rgba(0, 200, 255, 0.6)",
            "rgba(0, 255, 200, 0.7)",
            "rgba(0, 255, 100, 0.8)",
            "rgba(100, 255, 0, 0.8)",
            "rgba(200, 255, 0, 0.9)",
            "rgba(255, 200, 0, 0.9)",
            "rgba(255, 100, 0, 1.0)",
            "rgba(255, 50, 0, 1.0)",
            "rgba(255, 0, 0, 1.0)",
          ],
        });
        setHeatmap(newHeatmap);
      }
    };

    createMarkersAsync();
  }, [map, waterSystems, filters, violations]);

  return <div ref={ref} className="w-full h-full" />;
};

// Cache for storing coordinate results during the session
const coordinateCache = new Map<string, google.maps.LatLngLiteral>();

const getCoordinatesForSystem = async (
  system: WaterSystem
): Promise<google.maps.LatLngLiteral> => {
  const cacheKey = `${system.county || ""}_${system.city || ""}_${
    system.name || ""
  }`;

  // Check session cache first
  if (coordinateCache.has(cacheKey)) {
    return coordinateCache.get(cacheKey)!;
  }

  try {
    const result = await GeocodingService.getCoordinatesForSystem({
      county: system.county,
      city: system.city,
      name: system.name,
    });

    const coordinates = { lat: result.lat, lng: result.lng };
    coordinateCache.set(cacheKey, coordinates);

    // Log the source and confidence for debugging
    if (result.source === "google_maps") {
      console.log(
        `🗺️ Google Maps result for ${system.name}: ${result.lat}, ${result.lng} (confidence: ${result.confidence})`
      );
    } else if (result.source === "cache") {
      console.log(
        `💾 Cached result for ${system.name}: ${result.lat}, ${result.lng}`
      );
    } else {
      console.log(
        `⚠️ Fallback coordinates for ${system.name}: ${result.lat}, ${result.lng}`
      );
    }

    return coordinates;
  } catch (error) {
    console.error("Error getting coordinates for system:", system.name, error);
    // Fallback to Georgia center with slight offset based on system ID
    const idSum = (system.pwsid || "")
      .split("")
      .reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const latOffset = ((idSum % 200) - 100) / 1000; // Smaller offset for fallback
    const lngOffset = (((idSum * 13) % 200) - 100) / 1000;

    const fallback = {
      lat: 32.1656 + latOffset,
      lng: -82.9001 + lngOffset,
    };
    coordinateCache.set(cacheKey, fallback);
    return fallback;
  }
};

const getMarkerSize = (population: number): number => {
  if (population > 500000) return 12;
  if (population > 100000) return 10;
  if (population > 10000) return 8;
  return 6;
};

const getMarkerColor = (status: string): string => {
  switch (status) {
    case "compliant":
      return "#10B981";
    case "violation":
      return "#F59E0B";
    case "critical":
      return "#EF4444";
    default:
      return "#6B7280";
  }
};

const render = (status: Status) => {
  if (status === Status.LOADING)
    return (
      <div className="flex items-center justify-center h-full">
        Loading map...
      </div>
    );
  if (status === Status.FAILURE)
    return (
      <div className="flex items-center justify-center h-full text-red-600">
        Error loading map
      </div>
    );
  return null;
};

export const MapView: React.FC = () => {
  const [waterSystems, setWaterSystems] = useState<WaterSystem[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("2024-01");
  const [drawingMode, setDrawingMode] = useState(false);
  const [polygonSelections, setPolygonSelections] = useState<
    PolygonSelection[]
  >([]);
  const [activeSelection, setActiveSelection] =
    useState<PolygonSelection | null>(null);

  // Handle date range changes from timeline slider
  const handleDateRangeChange = (dateRange: { start: string; end: string }) => {
    setFilters((prev) => ({
      ...prev,
      dateRange,
    }));
  };
  const [activeStage, setActiveStage] = useState("stages");
  const [showTransitions, setShowTransitions] = useState(false);

  const [filters, setFilters] = useState<MapFilters>({
    systemType: "all",
    complianceStatus: "all",
    ownerType: "all",
    sourceType: "all",
    showViolations: true,
    showFacilities: false,
    showCompliant: true,
    showActiveViolations: true,
    showCriticalSystems: true,
    showViolationHeatmap: true,
    dateRange: {
      start: "2024-01-01",
      end: "2024-01-31",
    },
  });

  const [stats, setStats] = useState({
    totalSystems: 0,
    compliantSystems: 0,
    violationSystems: 0,
    criticalSystems: 0,
    populationServed: 0,
    activeViolations: 0,
    healthBasedViolations: 0,
    lastUpdated: new Date().toLocaleDateString(),
    produced: { active: 1247, inOut: 12, expanded: false },
    inStore: { active: 892, inOut: 8, expanded: false },
    sold: { active: 1456, inOut: 15, expanded: false, timeSpent: 2.5 },
    recycled: { active: 234, inOut: -3, expanded: false },
  });

  const [violations, setViolations] = useState([]);
  const [selectedSystemType, setSelectedSystemType] = useState("all");
  const [selectedComplianceStatus, setSelectedComplianceStatus] =
    useState("all");

  useEffect(() => {
    const loadWaterSystems = async () => {
      try {
        setLoading(true);
        console.log("=== MapView: Starting data load ===");
        console.log("Environment variables check:");
        console.log(
          "VITE_SUPABASE_URL:",
          import.meta.env.VITE_SUPABASE_URL ? "Set" : "Missing"
        );
        console.log(
          "VITE_SUPABASE_ANON_KEY:",
          import.meta.env.VITE_SUPABASE_ANON_KEY ? "Set" : "Missing"
        );

        // Build filters based on current state
        const systemFilters = {
          systemType:
            filters.systemType !== "all" ? filters.systemType : undefined,
          complianceStatus:
            filters.complianceStatus !== "all"
              ? filters.complianceStatus
              : undefined,
          ownerType:
            filters.ownerType !== "all" ? filters.ownerType : undefined,
          sourceType:
            filters.sourceType !== "all" ? filters.sourceType : undefined,
          dateRange: filters.dateRange,
          limit: 1000, // Load more systems for comprehensive map view
        };

        console.log(
          "Calling SupabaseService.getWaterSystems() with filters:",
          systemFilters
        );
        const result = await SupabaseService.getWaterSystems(systemFilters);
        setWaterSystems(result.data);

        console.log(`=== Loaded ${result.data.length} water systems ===`);
        if (result.data.length > 0) {
          console.log("✅ Sample system:", result.data[0]);
        } else {
          console.log(
            "❌ No water systems loaded - checking database connection..."
          );
          // Test basic Supabase connection
          const testResult = await SupabaseService.testConnection();
          console.log("Database connection test:", testResult);
        }
      } catch (error) {
        console.error("=== Error loading water systems ===", error);
        // Test connection when there's an error
        try {
          const testResult = await SupabaseService.testConnection();
          console.log("Connection test result after error:", testResult);
        } catch (testError) {
          console.error("Connection test failed:", testError);
        }
        // Fallback to empty array to prevent crashes
        setWaterSystems([]);
      } finally {
        setLoading(false);
      }
    };

    loadWaterSystems();
  }, [
    filters.systemType,
    filters.complianceStatus,
    filters.ownerType,
    filters.sourceType,
    filters.dateRange,
    filters.showViolations,
  ]);

  // Calculate statistics from loaded water systems
  useEffect(() => {
    const calculateStats = async () => {
      if (waterSystems.length === 0) return;

      const totalSystems = waterSystems.length;
      const compliantSystems = waterSystems.filter(
        (s) => s.complianceStatus === "compliant"
      ).length;
      const violationSystems = waterSystems.filter(
        (s) => s.complianceStatus === "violation"
      ).length;
      const criticalSystems = waterSystems.filter(
        (s) => s.complianceStatus === "critical"
      ).length;
      const populationServed = waterSystems.reduce(
        (sum, s) => sum + (s.populationServed || 0),
        0
      );

      // Fetch violations data for additional statistics
      try {
        const violationsResult = await SupabaseService.getViolations({
          limit: 1000,
          dateRange: filters.dateRange,
        });
        const activeViolations = violationsResult.data.filter(
          (v) => v.status === "Unaddressed" || v.status === "Addressed"
        ).length;
        const healthBasedViolations = violationsResult.data.filter(
          (v) =>
            v.isHealthBased &&
            (v.status === "Unaddressed" || v.status === "Addressed")
        ).length;

        console.log("📊 Violations loaded:", {
          total: violationsResult.data.length,
          activeViolations,
          healthBasedViolations,
          sampleStatuses: violationsResult.data
            .slice(0, 5)
            .map((v) => ({ status: v.status, isHealthBased: v.isHealthBased })),
        });

        setViolations(violationsResult.data);
        setStats({
          totalSystems,
          compliantSystems,
          violationSystems,
          criticalSystems,
          populationServed,
          activeViolations,
          healthBasedViolations,
          lastUpdated: new Date().toLocaleDateString(),
          produced: { active: 1247, inOut: 12, expanded: false },
          inStore: { active: 892, inOut: 8, expanded: false },
          sold: { active: 1456, inOut: 15, expanded: false, timeSpent: 2.5 },
          recycled: { active: 234, inOut: -3, expanded: false },
        });
      } catch (error) {
        console.error("Error fetching violations:", error);
        // Update stats without violation data
        setStats((prev) => ({
          ...prev,
          totalSystems,
          compliantSystems,
          violationSystems,
          criticalSystems,
          populationServed,
        }));
      }
    };

    calculateStats();
  }, [waterSystems]);

  const handleMarkerClick = useCallback((marker: MapMarker) => {
    setSelectedMarker(marker);
  }, []);

  // Utility function to check if a point is inside a polygon
  const isPointInPolygon = (
    point: google.maps.LatLngLiteral,
    polygon: google.maps.Polygon
  ): boolean => {
    return google.maps.geometry.poly.containsLocation(
      new google.maps.LatLng(point.lat, point.lng),
      polygon
    );
  };

  // Calculate polygon area in square kilometers
  const calculatePolygonArea = (polygon: google.maps.Polygon): number => {
    const area = google.maps.geometry.spherical.computeArea(polygon.getPath());
    return area / 1000000; // Convert from square meters to square kilometers
  };

  // Handle polygon completion
  const handlePolygonComplete = useCallback(
    (polygon: google.maps.Polygon) => {
      const bounds = new google.maps.LatLngBounds();
      polygon.getPath().forEach((latLng) => {
        bounds.extend(latLng);
      });

      // Find systems inside the polygon (applying current filters)
      const systemsInside = waterSystems.filter((system) => {
        // Get coordinates for the system (using cached coordinates)
        const cacheKey = `${system.county || ""}_${system.city || ""}_${
          system.name || ""
        }`;
        const coords = coordinateCache.get(cacheKey);
        if (!coords) return false;

        if (!isPointInPolygon(coords, polygon)) return false;

        // Apply the same filter logic as markers
        const systemViolations = violations.filter(
          (v) => v.pwsid === system.pwsid
        );
        const activeViolations = systemViolations.filter(
          (v) => v.status === "Unaddressed" || v.status === "Addressed"
        );
        const healthBasedViolations = activeViolations.filter(
          (v) => v.isHealthBased
        );

        // Determine system status
        let systemStatus = "compliant";
        if (healthBasedViolations.length > 0) {
          systemStatus = "critical";
        } else if (activeViolations.length > 0) {
          systemStatus = "violation";
        }

        // Apply current filter settings
        if (systemStatus === "compliant" && !filters.showCompliant)
          return false;
        if (systemStatus === "violation" && !filters.showActiveViolations)
          return false;
        if (systemStatus === "critical" && !filters.showCriticalSystems)
          return false;

        return true;
      });

      // Find violations inside the polygon (only for systems that pass filters)
      const violationsInside = violations.filter((violation) => {
        // Find the system for this violation
        const system = systemsInside.find((s) => s.pwsid === violation.pwsid);
        if (!system) return false;

        // Only include violations that match the current filter criteria
        const isActiveViolation =
          violation.status === "Unaddressed" ||
          violation.status === "Addressed";
        if (!isActiveViolation) return false;

        return true;
      });

      const selection: PolygonSelection = {
        id: `polygon_${Date.now()}`,
        polygon,
        bounds,
        area: calculatePolygonArea(polygon),
        systemsInside,
        violationsInside,
        createdAt: new Date(),
      };

      setPolygonSelections((prev) => [...prev, selection]);
      setActiveSelection(selection);
      setDrawingMode(false);

      // Add click listener to polygon for reselection
      polygon.addListener("click", () => {
        setActiveSelection(selection);
      });
    },
    [waterSystems, violations]
  );

  // Handle drawing mode toggle
  const handleToggleDrawing = () => {
    setDrawingMode(!drawingMode);
    if (activeSelection) {
      setActiveSelection(null);
    }
  };

  // Handle clearing all polygons
  const handleClearPolygons = () => {
    polygonSelections.forEach((selection) => {
      selection.polygon.setMap(null);
    });
    setPolygonSelections([]);
    setActiveSelection(null);
  };

  // Handle closing zone details
  const handleCloseZoneDetails = () => {
    setActiveSelection(null);
  };

  // Handle exporting zone data
  const handleExportZone = () => {
    if (!activeSelection) return;

    const data = {
      zone: {
        id: activeSelection.id,
        area: activeSelection.area,
        createdAt: activeSelection.createdAt,
      },
      systems: activeSelection.systemsInside,
      violations: activeSelection.violationsInside,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `zone_analysis_${activeSelection.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    // Implement PDF export functionality
    console.log("Exporting PDF...");
  };

  const stages = [
    { name: "Produced", color: "bg-blue-600", active: true },
    { name: "In Store", color: "bg-yellow-500", active: false },
    { name: "Sold", color: "bg-green-600", active: false },
    { name: "Recycled", color: "bg-gray-600", active: false },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading water systems data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar */}
      <div className="w-80 bg-white shadow-lg flex flex-col overflow-y-auto scrollbar-slim">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Georgia Drinking Water Systems
          </h1>
          <p className="text-sm text-gray-600">
            Real-time SDWIS data monitoring
          </p>
          <div className="mt-2 text-xs text-gray-500">
            Last updated: {stats.lastUpdated}
          </div>
        </div>

        {/* Real-time Statistics */}
        <div className="p-4 space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            System Overview
          </h2>

          {/* Total Systems */}
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-blue-700">
                  Total Water Systems
                </h3>
                <span className="text-2xl font-bold text-blue-900">
                  {stats.totalSystems.toLocaleString()}
                </span>
              </div>
              <MapPin className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          {/* Compliance Status */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2 rounded-lg bg-green-50 border border-green-200">
              <div className="text-xs font-medium text-green-700">
                Compliant
              </div>
              <div className="text-lg font-bold text-green-900">
                {stats.compliantSystems}
              </div>
            </div>
            <div className="p-2 rounded-lg bg-yellow-50 border border-yellow-200">
              <div className="text-xs font-medium text-yellow-700">
                Violations
              </div>
              <div className="text-lg font-bold text-yellow-900">
                {stats.violationSystems}
              </div>
            </div>
            <div className="p-2 rounded-lg bg-red-50 border border-red-200">
              <div className="text-xs font-medium text-red-700">Critical</div>
              <div className="text-lg font-bold text-red-900">
                {stats.criticalSystems}
              </div>
            </div>
          </div>

          {/* Population Served */}
          <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-purple-700">
                  Population Served
                </h3>
                <span className="text-xl font-bold text-purple-900">
                  {stats.populationServed.toLocaleString()}
                </span>
              </div>
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
          </div>

          {/* Violations Summary */}
          <div className="p-3 rounded-lg bg-orange-50 border border-orange-200">
            <h3 className="text-sm font-medium text-orange-700 mb-2">
              Active Violations
            </h3>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-orange-600">Total Active:</span>
                <span className="font-semibold text-orange-900">
                  {stats.activeViolations}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-orange-600">Health-Based:</span>
                <span className="font-semibold text-orange-900">
                  {stats.healthBasedViolations}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-t border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                System Type
              </label>
              <select
                value={selectedSystemType}
                onChange={(e) => {
                  setSelectedSystemType(e.target.value);
                  const newSystemTypes =
                    e.target.value === "all"
                      ? ["community", "non-transient", "transient"]
                      : e.target.value === "community"
                      ? ["community"]
                      : e.target.value === "non-community"
                      ? ["non-transient", "transient"]
                      : ["community", "non-transient", "transient"];
                  setFilters((prev) => ({
                    ...prev,
                    systemTypes: newSystemTypes,
                  }));
                }}
                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Systems</option>
                <option value="community">Community (CWS)</option>
                <option value="non-community">
                  Non-Community (TNCWS/NTNCWS)
                </option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Compliance Status
              </label>
              <select
                value={selectedComplianceStatus}
                onChange={(e) => {
                  setSelectedComplianceStatus(e.target.value);
                  setFilters((prev) => ({
                    ...prev,
                    showViolations: e.target.value !== "compliant",
                    showCompliant: e.target.value !== "violations",
                  }));
                }}
                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="compliant">Compliant Only</option>
                <option value="violations">With Violations</option>
                <option value="critical">Critical Issues</option>
              </select>
            </div>

            {/* Map Display Options */}
            <div className="pt-2 border-t border-gray-100">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Map Display Options
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.showCompliant}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        showCompliant: e.target.checked,
                      }))
                    }
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 flex items-center">
                    <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                    Compliant Systems
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.showActiveViolations}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        showActiveViolations: e.target.checked,
                      }))
                    }
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 flex items-center">
                    <span className="w-3 h-3 bg-orange-500 rounded-full mr-2"></span>
                    Active Violations
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.showCriticalSystems}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        showCriticalSystems: e.target.checked,
                      }))
                    }
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 flex items-center">
                    <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                    Critical Systems
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.showViolationHeatmap}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        showViolationHeatmap: e.target.checked,
                      }))
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Violation Heatmap
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Map Area */}
      <div className="flex-1 relative">
        <Wrapper
          apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
          render={render}
          libraries={["visualization", "drawing", "geometry"]}
        >
          <MapComponent
            center={{ lat: 32.1656, lng: -82.9001 }}
            zoom={7}
            waterSystems={waterSystems}
            filters={filters}
            violations={violations}
            onMarkerClick={handleMarkerClick}
            onPolygonComplete={handlePolygonComplete}
            drawingMode={drawingMode}
          />
        </Wrapper>

        {/* Zone Details Panel */}
        {activeSelection && (
          <ZoneDetailsPanel
            selection={activeSelection}
            onClose={handleCloseZoneDetails}
            onExport={handleExportZone}
          />
        )}
      </div>

      {/* Right Sidebar - Manufacturing Stages */}
      <div className="w-80 bg-white shadow-lg flex flex-col">
        {/* Timeline Controls */}
        <div className="flex-1 p-4">
          <div className="space-y-6">
            {/* Timeline Slider */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Timeline Control
              </h3>
              <TimelineSlider
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                onDateRangeChange={handleDateRangeChange}
                violationsData={violations}
                className=""
              />
              <div className="mt-2 text-xs text-gray-500">
                Showing data for: {selectedDate}
                <br />
                <span className="text-blue-600 font-medium">
                  {new Date(filters.dateRange.start).toLocaleDateString()} -{" "}
                  {new Date(filters.dateRange.end).toLocaleDateString()}
                </span>
                <br />
                <span className="text-gray-400 text-xs">
                  Based on violation occurrence dates
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* Zone Drawing Controls */}
        <div className="p-4 border-t border-gray-200">
          <div className="space-y-3">
            <div className="flex gap-2">
              <button
                onClick={handleToggleDrawing}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                  drawingMode
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                <Square className="w-4 h-4" />
                {drawingMode ? "Cancel Drawing" : "Draw Zone"}
              </button>

              {polygonSelections.length > 0 && (
                <button
                  onClick={handleClearPolygons}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear
                </button>
              )}
            </div>

            <button
              onClick={handleExportPDF}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium text-sm w-full"
            >
              <Download className="w-4 h-4" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
