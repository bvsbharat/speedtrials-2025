# Google Maps Geocoding Integration Setup

This document explains how to set up and use the Google Maps geocoding integration for the Georgia Water Systems map.

## Overview

The application now includes a comprehensive geocoding service that:
- Uses Google Maps Geocoding API to fetch coordinates for missing locations
- Caches results in Supabase database to avoid repeated API calls
- Falls back to Georgia center coordinates when geocoding fails
- Processes systems in batches to respect API rate limits

## Setup Instructions

### 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - **Maps JavaScript API** (required for map display)
   - **Geocoding API** (required for coordinate lookup)
   - **Places API** (optional, for enhanced location search)

### 2. Create API Key

1. Go to "Credentials" in the Google Cloud Console
2. Click "Create Credentials" > "API Key"
3. Copy the generated API key
4. **Important**: Restrict the API key:
   - Go to "API restrictions" and select the APIs you enabled
   - Add domain restrictions for production use

### 3. Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Add your Google Maps API key to `.env`:
   ```env
   VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   ```

### 4. Database Setup

1. Start Supabase (requires Docker):
   ```bash
   npx supabase start
   ```

2. Apply the coordinates cache migration:
   ```bash
   npx supabase db push
   ```

   This creates the `coordinates_cache` table with:
   - Location key indexing
   - Coordinate storage
   - Source tracking (google_maps, cache, fallback)
   - Confidence scoring
   - Automatic timestamps

## How It Works

### Geocoding Service (`src/services/geocodingService.ts`)

The service follows this flow:

1. **Cache Check**: First checks in-memory cache for the session
2. **Database Check**: Queries Supabase `coordinates_cache` table
3. **Google Maps API**: If not cached, calls Google Maps Geocoding API
4. **Database Save**: Stores new results in database for future use
5. **Fallback**: Uses Georgia center coordinates if all else fails

### Key Features

- **Batch Processing**: Processes water systems in batches of 10 to respect API limits
- **Smart Caching**: Three-tier caching (memory → database → API)
- **Georgia Bounds Checking**: Validates coordinates are within Georgia
- **Confidence Scoring**: Rates geocoding result quality
- **Error Handling**: Graceful fallbacks for failed geocoding

### Location Key Generation

The service generates unique keys for caching:
```
{county}_{city}_{name}
```

Example: `SAVANNAH_SAVANNAH_GOSHEN_VILLA_SUBDIVISION`

## Usage Examples

### Basic Coordinate Lookup
```typescript
import GeocodingService from '../services/geocodingService';

const result = await GeocodingService.getCoordinatesForSystem({
  county: 'SAVANNAH',
  city: 'SAVANNAH', 
  name: 'GOSHEN VILLA SUBDIVISION'
});

console.log(result);
// {
//   lat: 32.0835,
//   lng: -81.0998,
//   source: 'google_maps',
//   confidence: 0.95
// }
```

### Bulk Geocoding
```typescript
const systems = [
  { county: 'FULTON', city: 'ATLANTA', name: 'City of Atlanta' },
  { county: 'GWINNETT', city: 'LAWRENCEVILLE', name: 'Gwinnett County' }
];

const results = await GeocodingService.bulkGeocode(systems);
```

## Database Schema

### coordinates_cache Table

```sql
CREATE TABLE coordinates_cache (
  id BIGSERIAL PRIMARY KEY,
  location_key TEXT UNIQUE NOT NULL,
  county TEXT,
  city TEXT,
  name TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  source TEXT NOT NULL DEFAULT 'manual',
  confidence_score DOUBLE PRECISION DEFAULT 0.0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## API Rate Limits & Costs

### Google Maps Geocoding API
- **Free Tier**: $200 credit per month
- **Cost**: $5 per 1,000 requests after free tier
- **Rate Limit**: 50 requests per second

### Optimization Strategies
1. **Database Caching**: Reduces repeat API calls
2. **Batch Processing**: Respects rate limits
3. **Fallback Coordinates**: Avoids unnecessary API calls
4. **Session Caching**: Eliminates duplicate requests within a session

## Troubleshooting

### Common Issues

1. **"API key not valid"**
   - Check that the API key is correctly set in `.env`
   - Verify the key has Geocoding API enabled
   - Check API key restrictions

2. **"Quota exceeded"**
   - Check Google Cloud Console for usage
   - Consider upgrading billing account
   - Implement additional caching

3. **"Database connection failed"**
   - Ensure Supabase is running: `npx supabase status`
   - Check database credentials in `.env`
   - Verify migration was applied

### Debug Mode

Enable detailed logging by checking browser console:
- 🗺️ = Google Maps API result
- 💾 = Database cache hit
- ⚠️ = Fallback coordinates used

## Security Considerations

1. **API Key Protection**:
   - Never commit API keys to version control
   - Use environment variables
   - Restrict API key to specific domains in production

2. **Database Security**:
   - Enable Row Level Security (RLS) on coordinates_cache table
   - Limit database access to necessary operations

3. **Rate Limiting**:
   - Implement client-side rate limiting
   - Monitor API usage in Google Cloud Console

## Performance Monitoring

### Metrics to Track
- Cache hit rate (database vs API calls)
- Average geocoding response time
- API quota usage
- Failed geocoding attempts

### Optimization Tips
- Pre-populate cache with known Georgia locations
- Implement progressive loading for large datasets
- Use clustering for dense marker areas
- Consider using Google Maps Places API for enhanced results

## Future Enhancements

1. **Enhanced Location Matching**:
   - Fuzzy string matching for county/city names
   - Address standardization
   - Multiple geocoding providers

2. **Performance Improvements**:
   - Background geocoding jobs
   - Predictive caching
   - Coordinate clustering

3. **User Experience**:
   - Loading indicators during geocoding
   - Manual coordinate correction interface
   - Geocoding quality indicators