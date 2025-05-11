/**
 * Example of using direct database connection
 * This is a demonstration of how to use the direct database connection
 * for operations that might not be possible through the Supabase client.
 */

const db = require('../config/database');

/**
 * Example function that demonstrates a direct database query
 * This could be used for complex queries or operations not supported by Supabase client
 */
async function exampleDirectQuery() {
  try {
    // Example of a direct query using the direct connection
    const result = await db.queryDirect('SELECT * FROM companies LIMIT 5', []);
    console.log('Direct query result:', result.rows);

    return result.rows;
  } catch (error) {
    console.error('Error executing direct query:', error);
    throw error;
  }
}

/**
 * Example function that demonstrates a pooled database query
 * This uses the connection pooler which is better for high-concurrency scenarios
 */
async function examplePooledQuery() {
  try {
    // Example of a pooled query using the connection pooler
    const result = await db.queryPooled('SELECT * FROM users LIMIT 5', []);
    console.log('Pooled query result:', result.rows);

    return result.rows;
  } catch (error) {
    console.error('Error executing pooled query:', error);
    throw error;
  }
}

/**
 * Example of a transaction using direct connection
 * This demonstrates how to perform multiple operations in a single transaction
 */
async function exampleTransaction() {
  const client = await db.getDirectPool().connect();

  try {
    // Start transaction
    await client.query('BEGIN');

    // Perform multiple operations
    await client.query('UPDATE companies SET name = $1 WHERE id = $2', ['Updated Company', 1]);
    await client.query('INSERT INTO users (id, name, email, company_id) VALUES ($1, $2, $3, $4)', [
      '00000000-0000-0000-0000-000000000099',
      'Test User',
      'test@example.com',
      1,
    ]);

    // Commit transaction
    await client.query('COMMIT');

    console.log('Transaction completed successfully');
    return true;
  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    console.error('Error in transaction:', error);
    throw error;
  } finally {
    // Release client back to pool
    client.release();
  }
}

// Export functions for potential use in other parts of the application
module.exports = {
  exampleDirectQuery,
  examplePooledQuery,
  exampleTransaction,
};

// If this file is run directly, execute the examples
if (require.main === module) {
  (async () => {
    try {
      console.log('Running direct database connection examples...');

      // Run the example queries
      await exampleDirectQuery();
      await examplePooledQuery();

      // Uncomment to test transaction
      // await exampleTransaction();

      // Close connections when done
      await db.closeConnections();
      console.log('Examples completed successfully');
    } catch (error) {
      console.error('Error running examples:', error);
      process.exit(1);
    }
  })();
}
