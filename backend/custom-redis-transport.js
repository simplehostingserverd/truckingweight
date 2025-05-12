const winston = require('winston');
const Transport = require('winston-transport');
const Redis = require('ioredis');

// Mock Redis client for when Redis is not available
class MockRedisClient {
  constructor() {
    this.logs = [];
    console.log('Using mock Redis client for logging');
  }

  lpush(key, value) {
    this.logs.push({ key, value, timestamp: new Date() });
    return Promise.resolve(this.logs.length);
  }
}

class CustomRedisTransport extends Transport {
  constructor(options = {}) {
    super(options);
    this.name = 'redis';
    this.key = options.key || 'winston_logs';

    // Use mock Redis if specified in environment
    if (process.env.USE_MOCK_REDIS === 'true') {
      this.client = new MockRedisClient();
      return;
    }

    const redisUrl = options.redis?.url || process.env.REDIS_URL || 'redis://localhost:6379';
    const redisPassword = process.env.REDIS_PASSWORD || '';

    // Configure Redis client options
    const redisOptions = {
      maxRetriesPerRequest: 3,
      retryStrategy: times => {
        // After 3 retries, give up and use mock Redis
        if (times >= 3) {
          console.log('Max Redis retries reached for logging, falling back to mock Redis client');
          this.client = new MockRedisClient();
          return null; // Stop retrying
        }
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      connectTimeout: 3000, // 3 seconds
    };

    // Add password if provided
    if (redisPassword) {
      redisOptions.password = redisPassword;
    }

    try {
      // Create Redis client
      this.client = new Redis(redisUrl, redisOptions);

      // Handle connection
      this.client.on('error', err => {
        console.error('Redis Transport Error:', err);

        // If we don't already have a mock client, create one
        if (!(this.client instanceof MockRedisClient)) {
          console.log('Falling back to mock Redis client for logging');
          this.client = new MockRedisClient();
        }
      });
    } catch (err) {
      console.error('Error initializing Redis transport:', err);
      this.client = new MockRedisClient();
    }
  }

  log(info, callback) {
    setImmediate(() => {
      this.emit('logged', info);
    });

    const logEntry = JSON.stringify({
      timestamp: new Date().toISOString(),
      level: info.level,
      message: info.message,
      ...info,
    });

    // Use ioredis lpush
    this.client
      .lpush(this.key, logEntry)
      .then(() => callback(null, true))
      .catch(err => callback(err));
  }
}

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new CustomRedisTransport({
      redis: {
        url: process.env.REDIS_URL || 'redis://localhost:6379',
      },
      key: 'app_logs',
    }),
  ],
});

module.exports = logger;
