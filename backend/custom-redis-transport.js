const winston = require('winston');
const Transport = require('winston-transport');
const redis = require('redis');

class CustomRedisTransport extends Transport {
  constructor(options = {}) {
    super(options);
    this.name = 'redis';
    this.client = redis.createClient(options.redis || {});
    this.key = options.key || 'winston_logs';

    // Handle connection
    this.client.on('error', err => {
      console.error('Redis Transport Error:', err);
    });

    // Connect to Redis (for Redis v5+)
    if (typeof this.client.connect === 'function') {
      this.client.connect().catch(err => {
        console.error('Redis Connection Error:', err);
      });
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

    // Handle different Redis versions
    if (typeof this.client.lPush === 'function') {
      // Redis v5+
      this.client
        .lPush(this.key, logEntry)
        .then(() => callback(null, true))
        .catch(err => callback(err));
    } else {
      // Redis v2.x
      this.client.lpush(this.key, logEntry, err => {
        callback(err, !err);
      });
    }
  }
}

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new CustomRedisTransport({
      redis: {
        url: 'redis://localhost:6379',
      },
      key: 'app_logs',
    }),
  ],
});

module.exports = logger;
