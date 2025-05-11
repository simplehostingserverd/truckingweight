import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fetch from 'node-fetch';

// Get current file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from the root .env file
dotenv.config({ path: resolve(__dirname, '../.env') });

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log(
  'Supabase Key (first 10 chars):',
  supabaseKey ? supabaseKey.substring(0, 10) + '...' : 'undefined'
);

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env file');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Function to process the sync queue
async function processSyncQueue() {
  try {
    console.log('Processing sync queue...');

    // Get all pending sync queue items using direct SQL
    const { data: syncItems, error: syncError } = await supabase.rpc('execute_sql', {
      sql_query: "SELECT * FROM sync_queue WHERE status = 'pending'",
    });

    if (syncError) {
      console.error('Error fetching sync queue items:', syncError);

      // Try using the Management API
      console.log('Trying Management API...');
      const { data: result, error: apiError } = await supabase.functions.invoke('database-query', {
        body: {
          query: "SELECT * FROM sync_queue WHERE status = 'pending'",
        },
      });

      if (apiError) {
        console.error('Error using Management API:', apiError);

        // Last resort: direct SQL via REST API
        console.log('Trying direct SQL via REST API...');
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/execute_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${supabaseKey}`,
            apikey: supabaseKey,
          },
          body: JSON.stringify({
            sql_query: "SELECT * FROM sync_queue WHERE status = 'pending'",
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error with direct SQL via REST API:', errorData);

          // Final attempt: use the database query endpoint
          console.log('Using database query endpoint...');
          const { data: queryResult, error: queryError } = await fetch(
            `${supabaseUrl}/rest/v1/database/query`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${supabaseKey}`,
                apikey: supabaseKey,
              },
              body: JSON.stringify({
                query: "SELECT * FROM sync_queue WHERE status = 'pending'",
              }),
            }
          ).then(res => res.json());

          if (queryError) {
            console.error('Error with database query endpoint:', queryError);
            return;
          }

          syncItems = queryResult;
        } else {
          syncItems = await response.json();
        }
      } else {
        syncItems = result;
      }
    }

    if (!syncItems || syncItems.length === 0) {
      console.log('No pending sync items found');
      return;
    }

    console.log(`Found ${syncItems.length} pending sync items`);

    // Process each sync item
    for (const item of syncItems) {
      console.log(`Processing sync item: ${item.id}`);
      console.log(`  Table: ${item.table_name}`);
      console.log(`  Action: ${item.action}`);
      console.log(`  Data: ${JSON.stringify(item.data)}`);

      try {
        // Process based on action type
        switch (item.action) {
          case 'create':
            await processCreateAction(item);
            break;
          case 'update':
            await processUpdateAction(item);
            break;
          case 'delete':
            await processDeleteAction(item);
            break;
          default:
            console.error(`Unknown action type: ${item.action}`);
            continue;
        }

        // Mark as processed using direct SQL
        const updateQuery = `UPDATE sync_queue SET status = 'processed', updated_at = NOW() WHERE id = '${item.id}'`;
        const { error: updateError } = await supabase.rpc('execute_sql', {
          sql_query: updateQuery,
        });

        if (updateError) {
          console.error(`Error updating sync item status: ${updateError.message}`);

          // Try using the Management API
          const { error: apiUpdateError } = await supabase.functions.invoke('database-query', {
            body: {
              query: updateQuery,
            },
          });

          if (apiUpdateError) {
            console.error(
              `Error updating sync item status via Management API: ${apiUpdateError.message}`
            );
          } else {
            console.log(`  Sync item ${item.id} processed successfully`);
          }
        } else {
          console.log(`  Sync item ${item.id} processed successfully`);
        }
      } catch (error) {
        console.error(`Error processing sync item ${item.id}:`, error);

        // Mark as failed using direct SQL
        const failQuery = `UPDATE sync_queue SET status = 'failed', updated_at = NOW() WHERE id = '${item.id}'`;
        const { error: failError } = await supabase.rpc('execute_sql', {
          sql_query: failQuery,
        });

        if (failError) {
          console.error(`Error updating sync item status to failed: ${failError.message}`);
        }
      }
    }

    console.log('Sync queue processing completed');
  } catch (error) {
    console.error('Unexpected error processing sync queue:', error);
  }
}

// Process create action
async function processCreateAction(item) {
  console.log(`  Processing CREATE action for ${item.table_name}`);

  // Add company_id to the data if not present
  const data = { ...item.data, company_id: item.company_id };

  // Convert data object to SQL-friendly format
  const columns = Object.keys(data).join(', ');
  const values = Object.values(data)
    .map(val => {
      if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
      if (val === null) return 'NULL';
      if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
      return val;
    })
    .join(', ');

  // Create SQL query
  const insertQuery = `INSERT INTO ${item.table_name} (${columns}) VALUES (${values}) RETURNING id`;

  // Execute query using Management API
  const { data: result, error } = await fetch(`${supabaseUrl}/rest/v1/database/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${supabaseKey}`,
      apikey: supabaseKey,
    },
    body: JSON.stringify({
      query: insertQuery,
    }),
  }).then(res => res.json());

  if (error) {
    throw new Error(`Error creating record in ${item.table_name}: ${error.message}`);
  }

  console.log(`  Record created in ${item.table_name} with ID: ${result?.[0]?.id || 'unknown'}`);
}

// Process update action
async function processUpdateAction(item) {
  console.log(`  Processing UPDATE action for ${item.table_name}`);

  // Extract the ID from the data
  const { id, ...updateData } = item.data;

  if (!id) {
    throw new Error(`Missing ID for update action on ${item.table_name}`);
  }

  // Convert update data to SQL SET clause
  const setClause = Object.entries(updateData)
    .map(([key, val]) => {
      if (typeof val === 'string') return `${key} = '${val.replace(/'/g, "''")}'`;
      if (val === null) return `${key} = NULL`;
      if (typeof val === 'object') return `${key} = '${JSON.stringify(val).replace(/'/g, "''")}'`;
      return `${key} = ${val}`;
    })
    .join(', ');

  // Create SQL query
  const updateQuery = `UPDATE ${item.table_name} SET ${setClause}, updated_at = NOW() WHERE id = ${id} AND company_id = ${item.company_id}`;

  // Execute query using Management API
  const { error } = await fetch(`${supabaseUrl}/rest/v1/database/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${supabaseKey}`,
      apikey: supabaseKey,
    },
    body: JSON.stringify({
      query: updateQuery,
    }),
  }).then(res => res.json());

  if (error) {
    throw new Error(`Error updating record in ${item.table_name}: ${error.message}`);
  }

  console.log(`  Record updated in ${item.table_name}`);
}

// Process delete action
async function processDeleteAction(item) {
  console.log(`  Processing DELETE action for ${item.table_name}`);

  // Extract the ID from the data
  const { id } = item.data;

  if (!id) {
    throw new Error(`Missing ID for delete action on ${item.table_name}`);
  }

  // Create SQL query
  const deleteQuery = `DELETE FROM ${item.table_name} WHERE id = ${id} AND company_id = ${item.company_id}`;

  // Execute query using Management API
  const { error } = await fetch(`${supabaseUrl}/rest/v1/database/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${supabaseKey}`,
      apikey: supabaseKey,
    },
    body: JSON.stringify({
      query: deleteQuery,
    }),
  }).then(res => res.json());

  if (error) {
    throw new Error(`Error deleting record in ${item.table_name}: ${error.message}`);
  }

  console.log(`  Record deleted from ${item.table_name}`);
}

// Run the sync process
processSyncQueue();
