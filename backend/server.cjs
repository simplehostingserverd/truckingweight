/**
 * Copyright (c) 2025 Cargo Scale Pro Inc. All Rights Reserved.
 *
 * PROPRIETARY AND CONFIDENTIAL
 *
 * This file is part of the Cargo Scale Pro Inc Weight Management System.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 *
 * This file contains proprietary and confidential information of
 * Cargo Scale Pro Inc and may not be copied, distributed, or used
 * in any way without explicit written permission.
 */

/**
 * LEGACY FILE - NOT USED IN PRODUCTION
 *
 * This is the original Express.js server implementation.
 * The application now uses server-fastify.js as the primary server.
 * This file is kept for reference purposes only.
 */

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import database connection (for future direct database access)
const db = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const weightRoutes = require('./routes/weights');
const loadRoutes = require('./routes/loads');
const companyRoutes = require('./routes/companies');
const vehicleRoutes = require('./routes/vehicles');
const driverRoutes = require('./routes/drivers');
const adminRoutes = require('./routes/admin');
const syncRoutes = require('./routes/syncRoutes');

// Import integration routes
const integrationRoutes = require('./routes/integrations');
const webhookRoutes = require('./routes/webhooks');
const apiKeyRoutes = require('./routes/apiKeys');

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/weights', weightRoutes);
app.use('/api/loads', loadRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/sync', syncRoutes);

// Integration routes
app.use('/api/integrations', integrationRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/api-keys', apiKeyRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Cargo Scale Pro API' });
});

// Error handling middleware
app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err,
  });
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Import cache service
const cacheService = require('./services/cache/index.js');

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(async () => {
    console.log('HTTP server closed');
    // Close database connections
    await db.closeConnections();
    console.log('Database connections closed');
    // Clear cache
    await cacheService.clear();
    console.log('Cache cleared');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(async () => {
    console.log('HTTP server closed');
    // Close database connections
    await db.closeConnections();
    console.log('Database connections closed');
    // Clear cache
    await cacheService.clear();
    console.log('Cache cleared');
    process.exit(0);
  });
});

module.exports = app;
