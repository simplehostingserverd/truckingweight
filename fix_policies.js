// Script to fix multiple permissive policies in Supabase
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Supabase configuration
const supabaseUrl = 'https://pczfmxigimuluacspxse.supabase.co';
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'your-service-key-here';

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// SQL to identify tables with multiple permissive policies
const identifySQL = `
WITH policy_counts AS (
  SELECT
    tablename,
    cmd,
    roles,
    COUNT(*) AS policy_count,
    STRING_AGG(policyname, ', ') AS policy_names
  FROM
    pg_policies
  WHERE
    permissive = 'PERMISSIVE'
  GROUP BY
    tablename, cmd, roles
  HAVING
    COUNT(*) > 1
)
SELECT
  tablename AS table_name,
  cmd AS action,
  roles AS role_names,
  policy_count,
  policy_names
FROM
  policy_counts
ORDER BY
  tablename, cmd;
`;

// Function to generate fix SQL for a table
async function generateFixSQL(tableName, action, roles, policyNames) {
  const policiesSQL = `
    SELECT
      policyname,
      qual,
      with_check
    FROM
      pg_policies
    WHERE
      tablename = '${tableName}'
      AND cmd = '${action}'
      AND roles = ARRAY[${roles.map(r => `'${r}'`).join(', ')}]::text[]
      AND permissive = 'PERMISSIVE'
  `;

  const { data: policies, error: policiesError } = await supabase.rpc('exec_sql', {
    sql: policiesSQL,
  });

  if (policiesError) {
    console.error('Error fetching policies:', policiesError);
    return null;
  }

  let combinedUsingClause = '';
  let combinedWithCheckClause = '';

  // Build combined clauses
  for (const policy of policies) {
    if (policy.qual) {
      if (combinedUsingClause === '') {
        combinedUsingClause = `(${policy.qual})`;
      } else {
        combinedUsingClause += ` OR (${policy.qual})`;
      }
    }

    if (policy.with_check) {
      if (combinedWithCheckClause === '') {
        combinedWithCheckClause = `(${policy.with_check})`;
      } else {
        combinedWithCheckClause += ` OR (${policy.with_check})`;
      }
    }
  }

  // Generate SQL to drop existing policies
  let fixSQL = `-- Fix multiple permissive policies for ${tableName} (${action})\n`;

  for (const policyName of policyNames.split(', ')) {
    fixSQL += `DROP POLICY IF EXISTS "${policyName}" ON ${tableName};\n`;
  }

  // Generate SQL to create consolidated policy
  fixSQL += `\nCREATE POLICY "Consolidated ${action} policy for ${tableName}" \n`;
  fixSQL += `ON ${tableName}\n`;
  fixSQL += `FOR ${action}\n`;

  // Add TO clause if roles are specified
  if (roles.length > 0 && roles[0] !== 'public') {
    fixSQL += `TO ${roles.join(', ')}\n`;
  }

  // Add USING clause if applicable
  if (combinedUsingClause !== '') {
    fixSQL += `USING (${combinedUsingClause})`;
  }

  // Add WITH CHECK clause if applicable
  if (combinedWithCheckClause !== '') {
    if (combinedUsingClause !== '') {
      fixSQL += `\n`;
    }
    fixSQL += `WITH CHECK (${combinedWithCheckClause})`;
  }

  fixSQL += `;\n`;

  return fixSQL;
}

// Main function
async function fixMultiplePermissivePolicies() {
  try {
    // Step 1: Identify tables with multiple permissive policies
    console.log('Identifying tables with multiple permissive policies...');
    const { data: tables, error: tablesError } = await supabase.rpc('exec_sql', {
      sql: identifySQL,
    });

    if (tablesError) {
      console.error('Error identifying tables:', tablesError);
      return;
    }

    if (!tables || tables.length === 0) {
      console.log('No tables with multiple permissive policies found.');
      return;
    }

    console.log(`Found ${tables.length} tables with multiple permissive policies.`);

    // Step 2: Generate fix SQL for each table
    console.log('Generating fix SQL...');
    const allFixSQL = [];

    for (const table of tables) {
      const fixSQL = await generateFixSQL(
        table.table_name,
        table.action,
        table.role_names,
        table.policy_names
      );

      if (fixSQL) {
        allFixSQL.push(fixSQL);
        console.log(`Generated fix SQL for ${table.table_name} (${table.action}).`);
      }
    }

    // Step 3: Save fix SQL to file
    const fixSQLFile = 'fix_multiple_permissive_policies.sql';
    fs.writeFileSync(fixSQLFile, allFixSQL.join('\n'));
    console.log(`Fix SQL saved to ${fixSQLFile}.`);

    // Step 4: Execute fix SQL
    console.log('Executing fix SQL...');
    for (const fixSQL of allFixSQL) {
      const { error: fixError } = await supabase.rpc('exec_sql', { sql: fixSQL });

      if (fixError) {
        console.error('Error executing fix SQL:', fixError);
      }
    }

    console.log('Fix completed successfully.');
  } catch (error) {
    console.error('Error fixing multiple permissive policies:', error);
  }
}

// Run the main function
fixMultiplePermissivePolicies();
