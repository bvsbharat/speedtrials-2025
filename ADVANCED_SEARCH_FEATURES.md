# Advanced Water System Search Features

## Overview
The water system search has been enhanced with advanced search capabilities that allow users to perform sophisticated queries using different search types and patterns.

## Features

### 1. Enhanced Search Bar
- **Basic Search**: Search across system name, PWSID, city, and county
- **Open Query**: Natural language search that works across multiple fields
- **Real-time Results**: Search results update as you type

### 2. Advanced Search Panel
Click "Advanced Search" to access additional search options:

#### Search Types:

**General Search**
- Splits search terms and searches across multiple fields
- Example: "Atlanta water" finds systems with "Atlanta" OR "water" in any field
- Searches: name, PWSID, city, county, owner type, system type

**Exact Match**
- Finds exact matches only
- Example: "GA1234567" finds systems with exactly this PWSID
- Case-sensitive matching

**Contains Text**
- Finds records containing the search text anywhere in the field
- Example: "Municipal" finds all systems with "Municipal" in their name
- Case-insensitive matching

**Starts With**
- Finds records that start with the search text
- Example: "City of" finds all systems starting with "City of"
- Useful for finding systems by naming conventions

**Ends With**
- Finds records that end with the search text
- Example: "Authority" finds all systems ending with "Authority"
- Useful for finding specific types of organizations

**Regular Expression**
- Advanced pattern matching using PostgreSQL regex
- Example: "^GA\\d{7}$" finds Georgia PWS IDs (GA followed by 7 digits)
- Supports full PostgreSQL regex syntax

### 3. Search Examples

#### Basic Searches:
- `Atlanta` - Find systems in Atlanta
- `GA1234567` - Find specific PWSID
- `Municipal` - Find municipal water systems

#### Advanced Searches:
- **General**: `Atlanta water municipal` - Find Atlanta municipal water systems
- **Exact**: `City of Atlanta Department of Watershed Management` - Exact name match
- **Contains**: `Department` - All systems with "Department" in name
- **Starts With**: `City of` - All city-operated systems
- **Ends With**: `Authority` - All water authorities
- **Regex**: `^GA\\d{7}$` - Valid Georgia PWSID format

### 4. Combined Filtering
Advanced search works in combination with:
- System Type filters (CWS, TNCWS, NTNCWS)
- Owner Type filters (Local, Private, State, Federal)
- Water Source filters (Ground Water, Surface Water, etc.)
- Compliance Status filters
- County filters

### 5. Performance Features
- **Pagination**: Handle large result sets efficiently
- **Real-time Search**: Immediate feedback as you type
- **Search Indicators**: Visual feedback when advanced search is active
- **Clear All**: One-click reset of all search criteria

## Technical Implementation

### Frontend Components
- `SearchFilters.tsx`: Enhanced with advanced search UI
- `WaterSystemSearch.tsx`: Manages search state and API calls

### Backend Service
- `SupabaseService.ts`: Enhanced with advanced query building
- Supports multiple search types with proper SQL generation
- Error handling for invalid regex patterns

### Search Query Building
- Dynamic SQL generation based on search type
- Proper escaping and sanitization
- Fallback mechanisms for invalid patterns

## Usage Tips

1. **Start Simple**: Use the basic search bar for most queries
2. **Use Advanced for Precision**: When you need exact matches or patterns
3. **Combine Filters**: Use advanced search with filters for best results
4. **Test Regex**: Validate regex patterns before using in production
5. **Clear When Stuck**: Use "Clear All" to reset and start over

## Future Enhancements

- Saved search queries
- Search history
- Export search results
- Advanced field-specific searches
- Fuzzy matching for typos
- Search suggestions and autocomplete