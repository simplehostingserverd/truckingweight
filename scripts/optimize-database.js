require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    'Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env'
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to execute SQL
async function executeSql(sql) {
  const { error } = await supabase.rpc('pgmoon.query', { query: sql });
  if (error) {
    throw error;
  }
  return true;
}

// Main function to optimize the database
async function optimizeDatabase() {
  try {
    console.log('Starting database optimization...');

    // 1. Create indexes for frequently queried columns
    console.log('Creating indexes for frequently queried columns...');

    // Weights table indexes
    await executeSql(`
      CREATE INDEX IF NOT EXISTS idx_weights_company_id ON weights (company_id);
      CREATE INDEX IF NOT EXISTS idx_weights_vehicle_id ON weights (vehicle_id);
      CREATE INDEX IF NOT EXISTS idx_weights_driver_id ON weights (driver_id);
      CREATE INDEX IF NOT EXISTS idx_weights_date ON weights (date);
      CREATE INDEX IF NOT EXISTS idx_weights_status ON weights (status);
      CREATE INDEX IF NOT EXISTS idx_weights_created_at ON weights (created_at);
    `);

    // Vehicles table indexes
    await executeSql(`
      CREATE INDEX IF NOT EXISTS idx_vehicles_company_id ON vehicles (company_id);
      CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles (status);
    `);

    // Drivers table indexes
    await executeSql(`
      CREATE INDEX IF NOT EXISTS idx_drivers_company_id ON drivers (company_id);
      CREATE INDEX IF NOT EXISTS idx_drivers_status ON drivers (status);
    `);

    // Users table indexes
    await executeSql(`
      CREATE INDEX IF NOT EXISTS idx_users_company_id ON users (company_id);
      CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users (is_admin);
    `);

    // Integration connections table indexes
    await executeSql(`
      CREATE INDEX IF NOT EXISTS idx_integration_connections_company_id ON integration_connections (company_id);
      CREATE INDEX IF NOT EXISTS idx_integration_connections_integration_type ON integration_connections (integration_type);
      CREATE INDEX IF NOT EXISTS idx_integration_connections_is_active ON integration_connections (is_active);
    `);

    // Integration logs table indexes
    await executeSql(`
      CREATE INDEX IF NOT EXISTS idx_integration_logs_integration_connection_id ON integration_logs (integration_connection_id);
      CREATE INDEX IF NOT EXISTS idx_integration_logs_status ON integration_logs (status);
      CREATE INDEX IF NOT EXISTS idx_integration_logs_created_at ON integration_logs (created_at);
    `);

    // 2. Add composite indexes for common query patterns
    console.log('Creating composite indexes for common query patterns...');

    await executeSql(`
      CREATE INDEX IF NOT EXISTS idx_weights_company_date ON weights (company_id, date);
      CREATE INDEX IF NOT EXISTS idx_weights_company_status ON weights (company_id, status);
      CREATE INDEX IF NOT EXISTS idx_weights_vehicle_date ON weights (vehicle_id, date);
      CREATE INDEX IF NOT EXISTS idx_weights_driver_date ON weights (driver_id, date);
      CREATE INDEX IF NOT EXISTS idx_integration_connections_company_type ON integration_connections (company_id, integration_type);
    `);

    // 3. Add GIN indexes for JSON columns
    console.log('Creating GIN indexes for JSON columns...');

    await executeSql(`
      CREATE INDEX IF NOT EXISTS idx_integration_connections_config_gin ON integration_connections USING GIN (config);
      CREATE INDEX IF NOT EXISTS idx_integration_logs_details_gin ON integration_logs USING GIN (details);
    `);

    // 4. Optimize tables
    console.log('Optimizing tables...');

    // Vacuum analyze to update statistics and reclaim space
    await executeSql('VACUUM ANALYZE weights;');
    await executeSql('VACUUM ANALYZE vehicles;');
    await executeSql('VACUUM ANALYZE drivers;');
    await executeSql('VACUUM ANALYZE users;');
    await executeSql('VACUUM ANALYZE integration_connections;');
    await executeSql('VACUUM ANALYZE integration_logs;');

    // 5. Create materialized views for common reports
    console.log('Creating materialized views for common reports...');

    // Materialized view for weight statistics by company
    await executeSql(`
      CREATE MATERIALIZED VIEW IF NOT EXISTS mv_weight_stats_by_company AS
      SELECT
        company_id,
        COUNT(*) as total_weights,
        COUNT(*) FILTER (WHERE status = 'Compliant') as compliant_weights,
        COUNT(*) FILTER (WHERE status = 'Warning') as warning_weights,
        COUNT(*) FILTER (WHERE status = 'Non-Compliant') as non_compliant_weights,
        ROUND(COUNT(*) FILTER (WHERE status = 'Compliant')::numeric / COUNT(*) * 100, 2) as compliance_rate,
        AVG(weight) as avg_weight,
        MAX(weight) as max_weight,
        MIN(weight) as min_weight
      FROM weights
      GROUP BY company_id;
      
      CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_weight_stats_by_company ON mv_weight_stats_by_company (company_id);
    `);

    // Materialized view for weight statistics by vehicle
    await executeSql(`
      CREATE MATERIALIZED VIEW IF NOT EXISTS mv_weight_stats_by_vehicle AS
      SELECT
        vehicle_id,
        company_id,
        COUNT(*) as total_weights,
        COUNT(*) FILTER (WHERE status = 'Compliant') as compliant_weights,
        COUNT(*) FILTER (WHERE status = 'Warning') as warning_weights,
        COUNT(*) FILTER (WHERE status = 'Non-Compliant') as non_compliant_weights,
        ROUND(COUNT(*) FILTER (WHERE status = 'Compliant')::numeric / COUNT(*) * 100, 2) as compliance_rate,
        AVG(weight) as avg_weight,
        MAX(weight) as max_weight,
        MIN(weight) as min_weight
      FROM weights
      GROUP BY vehicle_id, company_id;
      
      CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_weight_stats_by_vehicle ON mv_weight_stats_by_vehicle (vehicle_id);
    `);

    // Materialized view for weight statistics by driver
    await executeSql(`
      CREATE MATERIALIZED VIEW IF NOT EXISTS mv_weight_stats_by_driver AS
      SELECT
        driver_id,
        company_id,
        COUNT(*) as total_weights,
        COUNT(*) FILTER (WHERE status = 'Compliant') as compliant_weights,
        COUNT(*) FILTER (WHERE status = 'Warning') as warning_weights,
        COUNT(*) FILTER (WHERE status = 'Non-Compliant') as non_compliant_weights,
        ROUND(COUNT(*) FILTER (WHERE status = 'Compliant')::numeric / COUNT(*) * 100, 2) as compliance_rate,
        AVG(weight) as avg_weight,
        MAX(weight) as max_weight,
        MIN(weight) as min_weight
      FROM weights
      GROUP BY driver_id, company_id;
      
      CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_weight_stats_by_driver ON mv_weight_stats_by_driver (driver_id);
    `);

    // Materialized view for monthly weight statistics
    await executeSql(`
      CREATE MATERIALIZED VIEW IF NOT EXISTS mv_weight_stats_monthly AS
      SELECT
        company_id,
        DATE_TRUNC('month', date::date) as month,
        COUNT(*) as total_weights,
        COUNT(*) FILTER (WHERE status = 'Compliant') as compliant_weights,
        COUNT(*) FILTER (WHERE status = 'Warning') as warning_weights,
        COUNT(*) FILTER (WHERE status = 'Non-Compliant') as non_compliant_weights,
        ROUND(COUNT(*) FILTER (WHERE status = 'Compliant')::numeric / COUNT(*) * 100, 2) as compliance_rate,
        AVG(weight) as avg_weight
      FROM weights
      GROUP BY company_id, DATE_TRUNC('month', date::date);
      
      CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_weight_stats_monthly ON mv_weight_stats_monthly (company_id, month);
    `);

    // 6. Create a function to refresh materialized views
    console.log('Creating function to refresh materialized views...');

    await executeSql(`
      CREATE OR REPLACE FUNCTION refresh_materialized_views()
      RETURNS void AS $$
      BEGIN
        REFRESH MATERIALIZED VIEW CONCURRENTLY mv_weight_stats_by_company;
        REFRESH MATERIALIZED VIEW CONCURRENTLY mv_weight_stats_by_vehicle;
        REFRESH MATERIALIZED VIEW CONCURRENTLY mv_weight_stats_by_driver;
        REFRESH MATERIALIZED VIEW CONCURRENTLY mv_weight_stats_monthly;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // 7. Create a trigger to update materialized views when weights table changes
    console.log('Creating trigger to update materialized views...');

    await executeSql(`
      CREATE OR REPLACE FUNCTION trigger_refresh_weight_stats()
      RETURNS trigger AS $$
      BEGIN
        -- Use pg_notify to signal that materialized views need to be refreshed
        PERFORM pg_notify('refresh_weight_stats', '');
        RETURN NULL;
      END;
      $$ LANGUAGE plpgsql;
      
      DROP TRIGGER IF EXISTS refresh_weight_stats_trigger ON weights;
      
      CREATE TRIGGER refresh_weight_stats_trigger
      AFTER INSERT OR UPDATE OR DELETE ON weights
      FOR EACH STATEMENT
      EXECUTE FUNCTION trigger_refresh_weight_stats();
    `);

    // 8. Create a function to archive old data
    console.log('Creating function to archive old data...');

    await executeSql(`
      CREATE OR REPLACE FUNCTION archive_old_data(days_to_keep integer)
      RETURNS void AS $$
      DECLARE
        archive_date date;
      BEGIN
        archive_date := CURRENT_DATE - days_to_keep;
        
        -- Archive old integration logs
        INSERT INTO integration_logs_archive
        SELECT * FROM integration_logs
        WHERE created_at < archive_date;
        
        -- Delete archived logs
        DELETE FROM integration_logs
        WHERE created_at < archive_date;
        
        -- You can add more tables to archive here
      END;
      $$ LANGUAGE plpgsql;
    `);

    // 9. Create a table for integration logs archive if it doesn't exist
    console.log('Creating archive tables...');

    await executeSql(`
      CREATE TABLE IF NOT EXISTS integration_logs_archive (LIKE integration_logs);
    `);

    console.log('Database optimization completed successfully!');
  } catch (error) {
    console.error('Error optimizing database:', error);
  }
}

// Run the function
optimizeDatabase();
