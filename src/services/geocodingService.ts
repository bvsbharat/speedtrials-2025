import { supabase } from '../lib/supabase';

interface CoordinateResult {
  lat: number;
  lng: number;
  source: 'cache' | 'google_maps' | 'fallback';
  confidence: number;
}

interface CachedCoordinate {
  id: number;
  location_key: string;
  county: string | null;
  city: string | null;
  name: string | null;
  latitude: number;
  longitude: number;
  source: string;
  confidence_score: number;
  created_at: string;
  updated_at: string;
}

class GeocodingService {
  private static readonly GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  private static readonly GEORGIA_CENTER = { lat: 32.1656, lng: -82.9001 };
  
  // Cache for in-memory storage during session
  private static coordinateCache = new Map<string, CoordinateResult>();

  /**
   * Generate a unique key for caching coordinates
   */
  private static generateLocationKey(county?: string, city?: string, name?: string): string {
    const cleanCounty = county?.toUpperCase().replace(/\s+/g, '_') || '';
    const cleanCity = city?.toUpperCase().replace(/\s+/g, '_') || '';
    const cleanName = name?.toUpperCase().replace(/\s+/g, '_') || '';
    return `${cleanCounty}_${cleanCity}_${cleanName}`;
  }

  /**
   * Get coordinates for a water system, using cache first, then Google Maps API
   */
  static async getCoordinatesForSystem(system: {
    county?: string;
    city?: string;
    name?: string;
  }): Promise<CoordinateResult> {
    const locationKey = this.generateLocationKey(system.county, system.city, system.name);
    
    console.log('🔍 Getting coordinates for:', {
      county: system.county,
      city: system.city,
      name: system.name,
      locationKey
    });

    // Check in-memory cache first
    if (this.coordinateCache.has(locationKey)) {
      console.log('✅ Found in memory cache');
      return this.coordinateCache.get(locationKey)!;
    }

    // Check database cache
    try {
      const cachedResult = await this.getFromDatabase(locationKey);
      if (cachedResult) {
        console.log('✅ Found in database cache');
        const result: CoordinateResult = {
          lat: cachedResult.latitude,
          lng: cachedResult.longitude,
          source: 'cache',
          confidence: cachedResult.confidence_score
        };
        this.coordinateCache.set(locationKey, result);
        return result;
      }
    } catch (error) {
      console.warn('⚠️ Error checking database cache:', error);
    }

    // Try Google Maps Geocoding API
    try {
      const geocodedResult = await this.geocodeWithGoogleMaps(system);
      if (geocodedResult) {
        console.log('✅ Found via Google Maps API');
        
        // Cache the result in database
        await this.saveToDatabase({
          location_key: locationKey,
          county: system.county || null,
          city: system.city || null,
          name: system.name || null,
          latitude: geocodedResult.lat,
          longitude: geocodedResult.lng,
          source: 'google_maps',
          confidence_score: geocodedResult.confidence
        });

        const result: CoordinateResult = {
          lat: geocodedResult.lat,
          lng: geocodedResult.lng,
          source: 'google_maps',
          confidence: geocodedResult.confidence
        };
        this.coordinateCache.set(locationKey, result);
        return result;
      }
    } catch (error) {
      console.warn('⚠️ Error with Google Maps geocoding:', error);
    }

    // Fallback to Georgia center
    console.log('❌ No coordinates found, using Georgia center');
    const fallbackResult: CoordinateResult = {
      lat: this.GEORGIA_CENTER.lat,
      lng: this.GEORGIA_CENTER.lng,
      source: 'fallback',
      confidence: 0.1
    };
    
    this.coordinateCache.set(locationKey, fallbackResult);
    return fallbackResult;
  }

  /**
   * Get coordinates from database cache
   */
  private static async getFromDatabase(locationKey: string): Promise<CachedCoordinate | null> {
    const { data, error } = await supabase
      .from('coordinates_cache')
      .select('*')
      .eq('location_key', locationKey)
      .single();

    if (error) {
      if (error.code !== 'PGRST116') { // Not found error
        throw error;
      }
      return null;
    }

    return data;
  }

  /**
   * Save coordinates to database cache
   */
  private static async saveToDatabase(coordinate: Omit<CachedCoordinate, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
    const { error } = await supabase
      .from('coordinates_cache')
      .upsert(coordinate, {
        onConflict: 'location_key'
      });

    if (error) {
      console.warn('⚠️ Error saving to database cache:', error);
    }
  }

  /**
   * Geocode using Google Maps API
   */
  private static async geocodeWithGoogleMaps(system: {
    county?: string;
    city?: string;
    name?: string;
  }): Promise<{ lat: number; lng: number; confidence: number } | null> {
    if (!this.GOOGLE_MAPS_API_KEY) {
      console.warn('⚠️ Google Maps API key not configured');
      return null;
    }

    // Build search queries in order of preference
    const searchQueries = this.buildSearchQueries(system);
    
    for (const query of searchQueries) {
      try {
        console.log(`🔍 Trying Google Maps geocoding for: "${query}"`);
        
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${this.GOOGLE_MAPS_API_KEY}`
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.status === 'OK' && data.results.length > 0) {
          const result = data.results[0];
          const location = result.geometry.location;
          
          // Check if result is in Georgia (rough bounds)
          if (this.isInGeorgia(location.lat, location.lng)) {
            const confidence = this.calculateConfidence(result, query);
            console.log(`✅ Google Maps result: ${location.lat}, ${location.lng} (confidence: ${confidence})`);
            
            return {
              lat: location.lat,
              lng: location.lng,
              confidence
            };
          } else {
            console.log(`⚠️ Result outside Georgia bounds: ${location.lat}, ${location.lng}`);
          }
        } else {
          console.log(`❌ No results for query: "${query}" (status: ${data.status})`);
        }
      } catch (error) {
        console.warn(`⚠️ Error geocoding "${query}":`, error);
      }
    }
    
    return null;
  }

  /**
   * Build search queries in order of preference
   */
  private static buildSearchQueries(system: {
    county?: string;
    city?: string;
    name?: string;
  }): string[] {
    const queries: string[] = [];
    const state = 'Georgia, USA';
    
    // Most specific to least specific
    if (system.name && system.city && system.county) {
      queries.push(`${system.name}, ${system.city}, ${system.county} County, ${state}`);
    }
    
    if (system.city && system.county) {
      queries.push(`${system.city}, ${system.county} County, ${state}`);
    }
    
    if (system.name && system.county) {
      queries.push(`${system.name}, ${system.county} County, ${state}`);
    }
    
    if (system.city) {
      queries.push(`${system.city}, ${state}`);
    }
    
    if (system.county) {
      queries.push(`${system.county} County, ${state}`);
    }
    
    return queries.filter(q => q.trim().length > state.length + 2);
  }

  /**
   * Check if coordinates are within Georgia bounds
   */
  private static isInGeorgia(lat: number, lng: number): boolean {
    // Georgia approximate bounds
    const bounds = {
      north: 35.0,
      south: 30.3,
      east: -80.8,
      west: -85.6
    };
    
    return lat >= bounds.south && lat <= bounds.north && 
           lng >= bounds.west && lng <= bounds.east;
  }

  /**
   * Calculate confidence score based on geocoding result
   */
  private static calculateConfidence(result: any, query: string): number {
    let confidence = 0.5; // Base confidence
    
    // Increase confidence based on result type
    const types = result.types || [];
    if (types.includes('locality')) confidence += 0.3;
    if (types.includes('administrative_area_level_2')) confidence += 0.2; // County
    if (types.includes('establishment')) confidence += 0.2;
    if (types.includes('point_of_interest')) confidence += 0.1;
    
    // Increase confidence if partial match is good
    if (result.partial_match === false) confidence += 0.1;
    
    // Cap at 1.0
    return Math.min(confidence, 1.0);
  }

  /**
   * Bulk geocode multiple systems (useful for initial data loading)
   */
  static async bulkGeocodeWaterSystems(systems: Array<{
    county?: string;
    city?: string;
    name?: string;
  }>): Promise<Map<string, CoordinateResult>> {
    const results = new Map<string, CoordinateResult>();
    const batchSize = 10; // Process in batches to avoid rate limiting
    
    console.log(`🔄 Starting bulk geocoding for ${systems.length} systems`);
    
    for (let i = 0; i < systems.length; i += batchSize) {
      const batch = systems.slice(i, i + batchSize);
      const batchPromises = batch.map(async (system) => {
        const locationKey = this.generateLocationKey(system.county, system.city, system.name);
        const result = await this.getCoordinatesForSystem(system);
        return { locationKey, result };
      });
      
      const batchResults = await Promise.all(batchPromises);
      batchResults.forEach(({ locationKey, result }) => {
        results.set(locationKey, result);
      });
      
      // Add delay between batches to respect rate limits
      if (i + batchSize < systems.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      console.log(`✅ Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(systems.length / batchSize)}`);
    }
    
    console.log(`🎉 Bulk geocoding completed for ${systems.length} systems`);
    return results;
  }

  /**
   * Clear all caches (useful for testing or cache invalidation)
   */
  static clearCache(): void {
    this.coordinateCache.clear();
    console.log('🧹 Coordinate cache cleared');
  }
}

export default GeocodingService;
export type { CoordinateResult };