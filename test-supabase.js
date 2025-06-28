import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gkgaxewtxtymceogmqou.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrZ2F4ZXd0eHR5bWNlb2dtcW91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwNzg5MDYsImV4cCI6MjA2NjY1NDkwNn0.q09F2QO3t8PhkeTeH2Gnyx5T1wQ_5FNI80o7jhFtVNw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    // Get sample of county names to check coordinate matching
    const { data, error, count } = await supabase
      .from('water_systems')
      .select('county_served, city_name, pws_name', { count: 'exact' })
      .limit(20);
    
    if (error) {
      console.error('Supabase error:', error);
      return;
    }
    
    console.log(`Found ${count} water systems in database`);
    console.log('Sample county and city names:');
    
    // Show unique county names
    const uniqueCounties = [...new Set(data.map(d => d.county_served))].slice(0, 10);
    console.log('Unique counties:', uniqueCounties);
    
    // Show unique city names
    const uniqueCities = [...new Set(data.map(d => d.city_name))].slice(0, 10);
    console.log('Unique cities:', uniqueCities);
    
    // Test coordinate matching logic
    const countyCoords = {
      'Fulton': { lat: 33.749, lng: -84.388 },
      'FULTON': { lat: 33.749, lng: -84.388 },
      'Gwinnett': { lat: 33.9526, lng: -84.0807 },
      'GWINNETT': { lat: 33.9526, lng: -84.0807 },
      'Cobb': { lat: 33.8839, lng: -84.5144 },
      'COBB': { lat: 33.8839, lng: -84.5144 },
      'BAXLEY': { lat: 31.7354, lng: -82.3179 },
      'BIRMINGHAM': { lat: 33.5404, lng: -84.3733 }
    };
    
    console.log('\nTesting coordinate matching:');
    data.slice(0, 5).forEach(system => {
      const county = system.county_served;
      const city = system.city_name;
      
      console.log(`System: ${system.pws_name}`);
      console.log(`  County: ${county}`);
      console.log(`  City: ${city}`);
      
      // Test various matching strategies
      const matches = [
        county && countyCoords[county],
        county && countyCoords[county.toUpperCase()],
        city && countyCoords[city],
        city && countyCoords[city.toUpperCase()]
      ].filter(Boolean);
      
      if (matches.length > 0) {
        console.log(`  ✅ Found coordinates:`, matches[0]);
      } else {
        console.log(`  ❌ No coordinates found`);
      }
      console.log('');
    });
    
  } catch (error) {
    console.error('Connection test failed:', error);
  }
}

testConnection();