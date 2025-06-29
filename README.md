# Georgia EPD Drinking Water Violations Dashboard

A React-based web application for visualizing and analyzing drinking water violations data from the Georgia Environmental Protection Division (EPD). This dashboard provides interactive maps, data filtering, and comprehensive reporting capabilities for water system compliance monitoring.

## Features

- **Interactive Map Visualization**: View water systems and violations on an interactive Google Maps interface
- **Advanced Search & Filtering**: Filter data by location, violation type, date ranges, and system characteristics
- **Data Upload & Management**: Upload CSV data files and manage water system information
- **Comprehensive Dashboard**: View statistics, trends, and detailed violation reports
- **Real-time Data**: Connected to Supabase for real-time data updates
- **Responsive Design**: Mobile-friendly interface built with TailwindCSS

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS
- **Database**: Supabase (PostgreSQL)
- **Maps**: Google Maps API
- **Charts**: Recharts
- **File Upload**: React Dropzone + PapaParse
- **Icons**: Lucide React + React Icons
- **Routing**: React Router DOM

## Prerequisites

Before running this application, ensure you have:

- Node.js (version 16 or higher)
- npm or yarn package manager
- A Supabase account and project
- Google Cloud Platform account with Maps API access

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd SpeedTrail_hack
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Copy the example environment file and configure your API keys:

```bash
cp .env.example .env
```

Edit the `.env` file with your actual credentials:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Maps API Configuration
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### 4. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from the project settings
3. Run the database migrations located in the `supabase/migrations/` folder:
   - You can use the Supabase CLI or copy the SQL files directly into your Supabase SQL editor
   - The migrations will create all necessary tables for SDWIS data

### 5. Google Maps API Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Geocoding API
   - Places API (optional, for enhanced location search)
4. Create an API key and add it to your `.env` file
5. Configure API key restrictions for security (recommended)

### 6. Database Schema

The application uses the following main tables (automatically created by migrations):

- `sdwa_pub_water_systems` - Public water systems information
- `sdwa_violations_enforcement` - Violation and enforcement data
- `sdwa_facilities` - Water system facilities
- `sdwa_geographic_areas` - Geographic area information
- `sdwa_service_areas` - Service area boundaries
- `sdwa_lcr_samples` - Lead and Copper Rule samples
- `sdwa_site_visits` - Site visit records
- `sdwa_events_milestones` - Events and milestones
- `coordinates_cache` - Cached geocoding results

## Running the Application

### Development Mode

```bash
npm run dev
```

The application will start on `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview
```

### Linting

```bash
npm run lint
```

## Data Upload

The application supports uploading CSV files with SDWIS data. Supported file types include:

- Public Water Systems
- Violations and Enforcement
- Facilities
- Geographic Areas
- Service Areas
- LCR Samples
- Site Visits
- Events and Milestones

CSV files should match the SDWIS schema. Sample data files are available in the `context/data/` directory.

## Project Structure

```
src/
├── components/          # React components
│   ├── Dashboard.tsx    # Main dashboard component
│   ├── Header.tsx       # Navigation header
│   ├── MapView.tsx      # Google Maps integration
│   ├── DataUpload.tsx   # CSV upload functionality
│   └── ...             # Other UI components
├── services/           # API and data services
│   ├── supabaseService.ts    # Supabase database operations
│   ├── geocodingService.ts   # Google Maps geocoding
│   └── csvUploadService.ts   # CSV processing
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── lib/                # Third-party library configurations
```

## Key Features

### Interactive Map
- View water systems as markers on Google Maps
- Filter by violation status, system type, and date ranges
- Click markers for detailed system information
- Zoom and pan controls with location search

### Data Dashboard
- Summary statistics and key metrics
- Violation trends and charts
- System compliance status
- Filterable data tables

### Data Management
- Upload CSV files with drag-and-drop interface
- Real-time upload progress and validation
- Data preview and confirmation
- Error handling and reporting

## Troubleshooting

### Common Issues

1. **Maps not loading**: Check your Google Maps API key and ensure the Maps JavaScript API is enabled
2. **Database connection errors**: Verify your Supabase URL and anon key in the `.env` file
3. **CSV upload failures**: Ensure your CSV files match the expected SDWIS schema
4. **Build errors**: Clear node_modules and reinstall dependencies

### Environment Variables

Make sure all required environment variables are set:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_GOOGLE_MAPS_API_KEY`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For questions or issues, please check the documentation in the `context/` directory or create an issue in the repository.