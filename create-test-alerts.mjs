import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestAlerts() {
  console.log('Creating test alerts for driver dashboard...');

  // First, get a driver ID to use
  const { data: drivers, error: driverError } = await supabase
    .from('drivers')
    .select('id')
    .limit(1);

  if (driverError || !drivers || drivers.length === 0) {
    console.error('No drivers found:', driverError);
    return;
  }

  const driverId = drivers[0].id;
  console.log(`Using driver ID: ${driverId}`);

  // Create test alerts
  const testAlerts = [
    {
      driver_id: driverId,
      alert_type: 'critical',
      severity: 'critical',
      message: 'Vehicle maintenance required - brake system check needed',
      acknowledged: false,
      created_at: new Date().toISOString()
    },
    {
      driver_id: driverId,
      alert_type: 'warning',
      severity: 'high',
      message: 'Approaching HOS limit - 2 hours remaining',
      acknowledged: false,
      created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString() // 5 minutes ago
    },
    {
      driver_id: driverId,
      alert_type: 'info',
      severity: 'medium',
      message: 'Weather advisory: Heavy rain expected on route',
      acknowledged: false,
      created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString() // 10 minutes ago
    }
  ];

  for (const alert of testAlerts) {
    const { data, error } = await supabase
      .from('predictive_alerts')
      .insert(alert)
      .select();

    if (error) {
      console.error('Error creating alert:', error);
    } else {
      console.log(`✓ Created alert: ${alert.message}`);
    }
  }

  console.log('\nTest alerts created successfully!');
}

createTestAlerts().catch(console.error);