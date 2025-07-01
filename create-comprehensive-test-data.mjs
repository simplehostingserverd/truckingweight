import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from frontend/.env.local
dotenv.config({ path: path.join(__dirname, 'frontend', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Helper function to generate random dates
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Helper function to generate random phone numbers
function randomPhone() {
  return `+1${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`;
}

// Helper function to generate random license plates
function randomLicensePlate(state) {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  return `${state}-${letters.charAt(Math.floor(Math.random() * letters.length))}${letters.charAt(Math.floor(Math.random() * letters.length))}${letters.charAt(Math.floor(Math.random() * letters.length))}-${numbers.charAt(Math.floor(Math.random() * numbers.length))}${numbers.charAt(Math.floor(Math.random() * numbers.length))}${numbers.charAt(Math.floor(Math.random() * numbers.length))}`;
}

async function createComprehensiveTestData() {
  console.log('🚀 Creating comprehensive test data for trucking application...');

  try {
    // 1. Create Companies
    console.log('\n📊 Creating companies...');
    const companies = [
      {
        name: 'TransGlobal Logistics Inc.',
        address: '1234 Industrial Blvd, Houston, TX 77001',
        contact_phone: '+1-713-555-0101',
        contact_email: 'contact@transglobal.com'
      },
      {
        name: 'Midwest Freight Solutions',
        address: '5678 Commerce Dr, Chicago, IL 60601',
        contact_phone: '+1-312-555-0202',
        contact_email: 'info@midwestfreight.com'
      },
      {
        name: 'Pacific Coast Carriers',
        address: '9012 Harbor Way, Los Angeles, CA 90001',
        contact_phone: '+1-213-555-0303',
        contact_email: 'dispatch@pacificcoast.com'
      },
      {
        name: 'Atlantic Express Lines',
        address: '3456 Port Rd, Miami, FL 33101',
        contact_phone: '+1-305-555-0404',
        contact_email: 'operations@atlanticexpress.com'
      },
      {
        name: 'Mountain View Transport',
        address: '7890 Alpine St, Denver, CO 80201',
        contact_phone: '+1-303-555-0505',
        contact_email: 'admin@mountainview.com'
      }
    ];

    const { data: createdCompanies, error: companyError } = await supabase
      .from('companies')
      .insert(companies)
      .select();

    if (companyError) {
      console.error('Error creating companies:', companyError);
      return;
    }
    console.log(`✅ Created ${createdCompanies.length} companies`);

    // 2. Create Drivers
    console.log('\n👨‍💼 Creating drivers...');
    const driverNames = [
      'John Smith', 'Maria Rodriguez', 'David Johnson', 'Sarah Williams', 'Michael Brown',
      'Jennifer Davis', 'Robert Miller', 'Lisa Wilson', 'James Moore', 'Patricia Taylor',
      'Christopher Anderson', 'Linda Thomas', 'Matthew Jackson', 'Barbara White', 'Anthony Harris',
      'Susan Martin', 'Mark Thompson', 'Nancy Garcia', 'Steven Martinez', 'Betty Robinson',
      'Paul Clark', 'Helen Rodriguez', 'Andrew Lewis', 'Sandra Lee', 'Joshua Walker',
      'Donna Hall', 'Kenneth Allen', 'Carol Young', 'Kevin Hernandez', 'Ruth King'
    ];

    const drivers = driverNames.map((name, index) => {
      const firstName = name.split(' ')[0].toLowerCase();
      const lastName = name.split(' ')[1].toLowerCase();
      const companyId = createdCompanies[index % createdCompanies.length].id;
      
      return {
        name: name,
        email: `${firstName}.${lastName}@${createdCompanies.find(c => c.id === companyId).name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        phone: randomPhone(),
        license_number: `CDL${String(index + 1).padStart(6, '0')}`,
        license_expiry: randomDate(new Date(2024, 6, 1), new Date(2026, 12, 31)).toISOString().split('T')[0],
        status: Math.random() > 0.1 ? 'Active' : 'Inactive',
        company_id: companyId
      };
    });

    const { data: createdDrivers, error: driverError } = await supabase
      .from('drivers')
      .insert(drivers)
      .select();

    if (driverError) {
      console.error('Error creating drivers:', driverError);
      return;
    }
    console.log(`✅ Created ${createdDrivers.length} drivers`);

    // 3. Create Vehicles
    console.log('\n🚛 Creating vehicles...');
    const vehicleModels = [
      'Freightliner Cascadia', 'Peterbilt 579', 'Kenworth T680', 'Volvo VNL',
      'Mack Anthem', 'International LT', 'Western Star 5700XE', 'Peterbilt 389',
      'Kenworth W900', 'Freightliner Columbia'
    ];

    const trailerTypes = [
      'Dry Van', 'Refrigerated', 'Flatbed', 'Tanker', 'Container',
      'Lowboy', 'Car Carrier', 'Livestock', 'Grain Hopper', 'Dump'
    ];

    const states = ['TX', 'CA', 'FL', 'NY', 'IL', 'PA', 'OH', 'GA', 'NC', 'MI'];

    const vehicles = [];
    for (let i = 0; i < 50; i++) {
      const companyId = createdCompanies[i % createdCompanies.length].id;
      const year = Math.floor(Math.random() * 10) + 2015;
      const model = vehicleModels[Math.floor(Math.random() * vehicleModels.length)];
      const state = states[Math.floor(Math.random() * states.length)];
      
      vehicles.push({
        name: `${model} ${year}`,
        type: trailerTypes[Math.floor(Math.random() * trailerTypes.length)],
        vin: `1FUJG${String(Math.floor(Math.random() * 1000000000000)).padStart(12, '0')}`,
        license_plate: randomLicensePlate(state),
        make: model.split(' ')[0],
        model: model.split(' ').slice(1).join(' '),
        year: year,
        status: Math.random() > 0.15 ? 'Active' : 'Maintenance',
        company_id: companyId,
        max_weight: `${Math.floor(Math.random() * 20000) + 60000} lbs`
      });
    }

    const { data: createdVehicles, error: vehicleError } = await supabase
      .from('vehicles')
      .insert(vehicles)
      .select();

    if (vehicleError) {
      console.error('Error creating vehicles:', vehicleError);
      return;
    }
    console.log(`✅ Created ${createdVehicles.length} vehicles`);

    // 4. Create Loads
    console.log('\n📦 Creating loads...');
    const origins = [
      'Houston, TX', 'Los Angeles, CA', 'Chicago, IL', 'New York, NY', 'Miami, FL',
      'Atlanta, GA', 'Dallas, TX', 'Phoenix, AZ', 'Philadelphia, PA', 'San Antonio, TX'
    ];

    const destinations = [
      'Seattle, WA', 'Denver, CO', 'Boston, MA', 'Las Vegas, NV', 'Detroit, MI',
      'Nashville, TN', 'Portland, OR', 'Charlotte, NC', 'San Francisco, CA', 'Austin, TX'
    ];

    const commodities = [
      'Electronics', 'Automotive Parts', 'Food Products', 'Textiles', 'Machinery',
      'Chemicals', 'Paper Products', 'Steel', 'Lumber', 'Consumer Goods'
    ];

    const loads = [];
    for (let i = 0; i < 100; i++) {
      const pickupDate = randomDate(new Date(2024, 0, 1), new Date(2024, 11, 31));
      const deliveryDate = new Date(pickupDate.getTime() + (Math.random() * 7 + 1) * 24 * 60 * 60 * 1000);
      const weight = Math.floor(Math.random() * 40000) + 10000; // 10k-50k lbs
      const rate = Math.floor(Math.random() * 3000) + 1000; // $1000-$4000
      
      loads.push({
        description: `${commodities[Math.floor(Math.random() * commodities.length)]} shipment from ${origins[Math.floor(Math.random() * origins.length)]} to ${destinations[Math.floor(Math.random() * destinations.length)]}`,
        origin: origins[Math.floor(Math.random() * origins.length)],
        destination: destinations[Math.floor(Math.random() * destinations.length)],
        weight: `${weight} lbs`,
        status: ['Pending', 'In Transit', 'Delivered', 'Cancelled'][Math.floor(Math.random() * 4)],
        driver_id: createdDrivers[Math.floor(Math.random() * createdDrivers.length)].id,
        vehicle_id: createdVehicles[Math.floor(Math.random() * createdVehicles.length)].id,
        company_id: createdCompanies[Math.floor(Math.random() * createdCompanies.length)].id
      });
    }

    const { data: createdLoads, error: loadError } = await supabase
      .from('loads')
      .insert(loads)
      .select();

    if (loadError) {
      console.error('Error creating loads:', loadError);
      return;
    }
    console.log(`✅ Created ${createdLoads.length} loads`);

    // 5. Create Weight Records
    console.log('\n⚖️ Creating weight records...');
    const scaleLocations = [
      'I-10 Weigh Station, TX', 'I-75 Scale House, FL', 'I-95 Inspection, GA',
      'I-40 Weigh Station, TN', 'I-80 Scale, NV', 'I-5 Weigh Station, CA',
      'I-35 Scale House, TX', 'I-70 Weigh Station, CO', 'I-90 Scale, WA', 'I-65 Weigh Station, AL'
    ];

    const weights = [];
    for (let i = 0; i < 200; i++) {
      const grossWeight = Math.floor(Math.random() * 20000) + 60000; // 60k-80k lbs
      const tareWeight = Math.floor(Math.random() * 5000) + 15000; // 15k-20k lbs
      const netWeight = grossWeight - tareWeight;
      
      const weighDate = randomDate(new Date(2024, 0, 1), new Date());
      const selectedDriver = createdDrivers[Math.floor(Math.random() * createdDrivers.length)];
      weights.push({
        weight: `${grossWeight} lbs`,
        date: weighDate.toISOString().split('T')[0],
        time: weighDate.toTimeString().split(' ')[0],
        driver_id: selectedDriver.id,
        vehicle_id: createdVehicles[Math.floor(Math.random() * createdVehicles.length)].id,
        status: grossWeight > 80000 ? 'Non-Compliant' : (grossWeight > 75000 ? 'Warning' : 'Compliant'),
        company_id: selectedDriver.company_id
      });
    }

    const { data: createdWeights, error: weightError } = await supabase
      .from('weights')
      .insert(weights)
      .select();

    if (weightError) {
      console.error('Error creating weights:', weightError);
      return;
    }
    console.log(`✅ Created ${createdWeights.length} weight records`);

    // 6. Create Predictive Alerts
    console.log('\n🚨 Creating predictive alerts...');
    const alertTypes = [
      { type: 'maintenance', severity: 'high', messages: [
        'Engine oil change due in 500 miles',
        'Brake inspection required',
        'Tire rotation recommended',
        'DOT inspection expires in 30 days'
      ]},
      { type: 'safety', severity: 'critical', messages: [
        'Overweight violation detected',
        'HOS violation imminent - 1 hour remaining',
        'Weather advisory: Ice conditions ahead',
        'Construction zone - reduced speed limit'
      ]},
      { type: 'route', severity: 'medium', messages: [
        'Traffic delay on I-35 - 45 minute delay',
        'Alternate route available - save 30 minutes',
        'Fuel stop recommended in 50 miles',
        'Rest area available in 25 miles'
      ]},
      { type: 'compliance', severity: 'high', messages: [
        'ELD malfunction detected',
        'Driver qualification file update needed',
        'Insurance renewal due in 15 days',
        'Drug test required for driver'
      ]}
    ];

    const alerts = [];
    for (let i = 0; i < 150; i++) {
      const alertCategory = alertTypes[Math.floor(Math.random() * alertTypes.length)];
      const message = alertCategory.messages[Math.floor(Math.random() * alertCategory.messages.length)];
      
      alerts.push({
        driver_id: createdDrivers[Math.floor(Math.random() * createdDrivers.length)].id,
        alert_type: alertCategory.type,
        severity: alertCategory.severity,
        message: message,
        acknowledged: Math.random() > 0.3,
        created_at: randomDate(new Date(2024, 0, 1), new Date()).toISOString(),
        resolved_at: Math.random() > 0.5 ? randomDate(new Date(2024, 0, 1), new Date()).toISOString() : null
      });
    }

    const { data: createdAlerts, error: alertError } = await supabase
      .from('predictive_alerts')
      .insert(alerts)
      .select();

    if (alertError) {
      console.error('Error creating alerts:', alertError);
      return;
    }
    console.log(`✅ Created ${createdAlerts.length} predictive alerts`);

    // 7. Create Maintenance Records
    console.log('\n🔧 Creating maintenance records...');
    const maintenanceTypes = [
      'Oil Change', 'Brake Service', 'Tire Replacement', 'Engine Repair',
      'Transmission Service', 'DOT Inspection', 'PM Service', 'Electrical Repair',
      'Cooling System', 'Fuel System Cleaning'
    ];

    const maintenanceRecords = [];
    for (let i = 0; i < 80; i++) {
      const cost = Math.floor(Math.random() * 2000) + 100;
      const serviceDate = randomDate(new Date(2023, 0, 1), new Date());
      
      maintenanceRecords.push({
        vehicle_id: createdVehicles[Math.floor(Math.random() * createdVehicles.length)].id,
        service_type: maintenanceTypes[Math.floor(Math.random() * maintenanceTypes.length)],
        service_date: serviceDate.toISOString().split('T')[0],
        cost: cost,
        mileage: Math.floor(Math.random() * 500000) + 50000,
        description: `Routine ${maintenanceTypes[Math.floor(Math.random() * maintenanceTypes.length)].toLowerCase()} service performed`,
        vendor: `Service Center ${Math.floor(Math.random() * 10) + 1}`,
        next_service_due: new Date(serviceDate.getTime() + (Math.random() * 90 + 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
    }

    // Note: This assumes a maintenance table exists. If not, we'll skip this step.
    try {
      const { data: createdMaintenance, error: maintenanceError } = await supabase
        .from('maintenance')
        .insert(maintenanceRecords)
        .select();

      if (maintenanceError) {
        console.log('⚠️ Maintenance table not found, skipping maintenance records');
      } else {
        console.log(`✅ Created ${createdMaintenance.length} maintenance records`);
      }
    } catch (error) {
      console.log('⚠️ Maintenance table not found, skipping maintenance records');
    }

    console.log('\n🎉 Comprehensive test data creation completed!');
    console.log('\n📊 Summary:');
    console.log(`- Companies: ${createdCompanies.length}`);
    console.log(`- Drivers: ${createdDrivers.length}`);
    console.log(`- Vehicles: ${createdVehicles.length}`);
    console.log(`- Loads: ${createdLoads.length}`);
    console.log(`- Weight Records: ${createdWeights.length}`);
    console.log(`- Predictive Alerts: ${createdAlerts.length}`);
    console.log('\n✨ Your application is now fully populated with realistic data!');
    console.log('\n🔗 You can now test all CRUD operations and see the full functionality of your trucking application.');

  } catch (error) {
    console.error('❌ Error creating test data:', error);
  }
}

createComprehensiveTestData().catch(console.error);