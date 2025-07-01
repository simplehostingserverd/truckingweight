const axios = require('axios');

// Test AI Services
async function testAIServices() {
  const baseURL = 'http://localhost:3001/api/ai';
  
  console.log('Testing AI Services...');
  
  try {
    // Test Predictive Maintenance
    console.log('\n1. Testing Predictive Maintenance...');
    const maintenanceResponse = await axios.post(`${baseURL}/predictive-maintenance/analyze`, {
      vehicleId: 'test-vehicle-1',
      sensorData: {
        engineTemp: 95,
        oilPressure: 45,
        brakeTemp: 180,
        transmissionTemp: 85,
        vibration: 2.5,
        fuelEfficiency: 6.8,
        mileage: 125000
      }
    });
    console.log('✓ Predictive Maintenance:', maintenanceResponse.data.riskLevel);
    
    // Test Route Optimization
    console.log('\n2. Testing Route Optimization...');
    const routeResponse = await axios.post(`${baseURL}/route-optimization/optimize`, {
      origin: { lat: 40.7128, lng: -74.0060, address: 'New York, NY' },
      destination: { lat: 34.0522, lng: -118.2437, address: 'Los Angeles, CA' },
      vehicleSpecs: {
        type: 'semi_truck',
        weight: 80000,
        fuelCapacity: 300,
        mpg: 6.5
      },
      driverHOS: {
        availableDriveTime: 10,
        availableDutyTime: 14
      }
    });
    console.log('✓ Route Optimization:', routeResponse.data.recommendedRoute.routeId);
    
    // Test Driver Safety
    console.log('\n3. Testing Driver Safety...');
    const safetyResponse = await axios.post(`${baseURL}/driver-safety/analyze`, {
      driverId: 'test-driver-1',
      behaviorData: {
        hardBraking: 2,
        rapidAcceleration: 1,
        sharpTurns: 3,
        speedingIncidents: 1,
        phoneUsage: 0,
        fatigueIndicators: 1
      },
      timeframe: '7d'
    });
    console.log('✓ Driver Safety Score:', safetyResponse.data.overallScore);
    
    // Test Dynamic Pricing
    console.log('\n4. Testing Dynamic Pricing...');
    const pricingResponse = await axios.post(`${baseURL}/dynamic-pricing/calculate`, {
      loadCharacteristics: {
        weight: 45000,
        distance: 1200,
        type: 'dry_van',
        urgency: 'standard',
        specialRequirements: []
      },
      route: {
        origin: 'Chicago, IL',
        destination: 'Atlanta, GA'
      }
    });
    console.log('✓ Dynamic Pricing:', `$${pricingResponse.data.recommendedRate}`);
    
    // Test AI Dashboard
    console.log('\n5. Testing AI Dashboard...');
    const dashboardResponse = await axios.get(`${baseURL}/dashboard`);
    console.log('✓ AI Dashboard loaded with', Object.keys(dashboardResponse.data).length, 'metrics');
    
    console.log('\n🎉 All AI services are working correctly!');
    
  } catch (error) {
    console.error('❌ Error testing AI services:', error.response?.data || error.message);
  }
}

// Run the test
testAIServices();