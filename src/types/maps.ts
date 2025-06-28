export interface MapMarker {
  id: string;
  position: {
    lat: number;
    lng: number;
  };
  title: string;
  type: 'water_system' | 'facility' | 'violation';
  status: 'compliant' | 'violation' | 'critical';
  data: any;
}

export interface MapFilters {
  systemType: string;
  complianceStatus: string;
  ownerType: string;
  sourceType: string;
  showViolations: boolean;
  showFacilities: boolean;
  showCompliant: boolean;
  showActiveViolations: boolean;
  showCriticalSystems: boolean;
  showViolationHeatmap: boolean;
  dateRange: {
    start: string;
    end: string;
  };
}

export interface HeatmapData {
  location: google.maps.LatLng;
  weight: number;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface PolygonSelection {
  id: string;
  polygon: google.maps.Polygon;
  bounds: google.maps.LatLngBounds;
  area: number; // in square kilometers
  systemsInside: WaterSystem[];
  violationsInside: any[];
  createdAt: Date;
}

export interface ZoneDetails {
  totalSystems: number;
  compliantSystems: number;
  violationSystems: number;
  criticalSystems: number;
  totalPopulation: number;
  activeViolations: number;
  healthBasedViolations: number;
  area: number;
  averageSystemSize: number;
}