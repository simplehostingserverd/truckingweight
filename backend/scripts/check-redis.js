/**
 * Redis Availability Check Script
 * 
 * This script checks if Redis is available and sets the USE_MOCK_REDIS
 * environment variable accordingly. It's meant to be run before starting
 * the application in development mode.
 */

const Redis = require('ioredis');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// Function to check if Redis is available
async function checkRedisAvailability() {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  const redisPassword = process.env.REDIS_PASSWORD || '';
  
  // Configure Redis client options
  const redisOptions = {
    maxRetriesPerRequest: 1,
    connectTimeout: 2000, // 2 seconds
    retryStrategy: () => null, // Don't retry
  };
  
  // Add password if provided
  if (redisPassword) {
    redisOptions.password = redisPassword;
  }
  
  console.log(`Checking Redis availability at ${redisUrl.split('@').pop()}...`);
  
  try {
    const client = new Redis(redisUrl, redisOptions);
    
    // Set a timeout to close the connection if it takes too long
    const timeout = setTimeout(() => {
      console.log('Redis connection timeout');
      client.disconnect();
    }, 3000);
    
    // Wait for connection or error
    await new Promise((resolve, reject) => {
      client.on('connect', () => {
        clearTimeout(timeout);
        console.log('Redis is available!');
        client.disconnect();
        resolve(true);
      });
      
      client.on('error', (err) => {
        clearTimeout(timeout);
        console.log(`Redis is not available: ${err.message}`);
        client.disconnect();
        resolve(false);
      });
    });
    
    return true;
  } catch (err) {
    console.log(`Redis is not available: ${err.message}`);
    return false;
  }
}

// Function to update .env.local file
function updateEnvFile(useMockRedis) {
  const envPath = path.join(__dirname, '..', '.env.local');
  
  try {
    // Read the current .env.local file
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Update or add the USE_MOCK_REDIS variable
    if (envContent.includes('USE_MOCK_REDIS=')) {
      // Replace existing value
      envContent = envContent.replace(
        /USE_MOCK_REDIS=(true|false)/,
        `USE_MOCK_REDIS=${useMockRedis}`
      );
    } else {
      // Add new value in the Redis section
      if (envContent.includes('# Redis Configuration')) {
        envContent = envContent.replace(
          '# Redis Configuration',
          '# Redis Configuration\nUSE_MOCK_REDIS=' + useMockRedis
        );
      } else {
        // Add a new Redis section
        envContent += '\n# Redis Configuration\nUSE_MOCK_REDIS=' + useMockRedis + '\n';
      }
    }
    
    // Write the updated content back to the file
    fs.writeFileSync(envPath, envContent);
    console.log(`Updated .env.local with USE_MOCK_REDIS=${useMockRedis}`);
  } catch (err) {
    console.error('Error updating .env.local file:', err);
  }
}

// Main function
async function main() {
  try {
    const isRedisAvailable = await checkRedisAvailability();
    updateEnvFile(!isRedisAvailable);
    
    if (!isRedisAvailable) {
      console.log('\nRedis is not available. The application will use a mock Redis client.');
      console.log('To use a real Redis instance, you can:');
      console.log('1. Install Redis locally: sudo apt install redis-server');
      console.log('2. Start Redis in Docker: docker run -p 6379:6379 redis:alpine');
      console.log('3. Set USE_MOCK_REDIS=false in .env.local once Redis is available\n');
    } else {
      console.log('\nRedis is available. The application will use the real Redis client.\n');
    }
  } catch (err) {
    console.error('Error checking Redis availability:', err);
    updateEnvFile(true); // Default to mock Redis on error
  }
}

// Run the main function
main();
