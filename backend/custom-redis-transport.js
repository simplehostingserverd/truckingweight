const winston = require('winston');
const Transport = require('winston-transport');
const Redis = require('ioredis');

class CustomRedisTransport extends Transport {
  constructor(options = {}) {
    super(options);
    this.name = 'redis';

    const redisUrl = options.redis?.url || 'redis://localhost:6379';
    this.client = new Redis(redisUrl);
    this.key = options.key || 'winston_logs';

    // Handle connection
    this.client.on('error', err => {
      console.error('Redis Transport Error:', err);
    });
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
        url: 'redis://localhost:6379',
      },
      key: 'app_logs',
    }),
  ],
});

module.exports = logger;
