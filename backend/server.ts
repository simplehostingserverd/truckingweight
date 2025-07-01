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
 * This is the TypeScript Express.js server implementation.
 * The application now uses server-fastify.js as the primary server.
 * This file is kept for reference purposes only and may be used
 * as a basis for a future TypeScript Fastify implementation.
 */

import compression from 'compression';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

// Load environment variables
dotenv.config();

// Import database connections
import * as db from './config/database';
import prisma from './config/prisma';

// Import middleware
import setCompanyContextMiddleware from './middleware/companyContext';

// Import routes
import adminRoutes from './routes/admin';
import authRoutes from './routes/auth';
import companyRoutes from './routes/companies';
import dashboardRoutes from './routes/dashboard';
import driverRoutes from './routes/drivers';
import loadRoutes from './routes/loads';
import scaleRoutes from './routes/scaleRoutes';
import vehicleRoutes from './routes/vehicles';
import weighTicketRoutes from './routes/weighTicketRoutes';
import weightRoutes from './routes/weights';

// Import new TMS routes
const dispatchRoutes = require('./routes/dispatch');
const fleetRoutes = require('./routes/fleet');
const financialRoutes = require('./routes/financial');
const tollRoutes = require('./routes/toll');

// Import additional TMS routes
import maintenanceRoutes from './routes/maintenance';
import iotRoutes from './routes/iot';
import complianceRoutes from './routes/compliance';
import analyticsRoutes from './routes/analytics';
import ediRoutes from './routes/edi';
import mlRoutes from './routes/ml';
import aiRoutes from './routes/ai';

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(helmet()); // Security headers
app.use(compression()); // Compress responses
app.use(express.json());
app.use(morgan('dev'));

// Add company context middleware after auth middleware
// This should be placed after your authentication middleware
// that sets req.user with the authenticated user information
app.use(setCompanyContextMiddleware);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/weights', weightRoutes);
app.use('/api/loads', loadRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/scales', scaleRoutes);
app.use('/api/weigh-tickets', weighTicketRoutes);
app.use('/api/dispatch', dispatchRoutes);
app.use('/api/fleet', fleetRoutes);
app.use('/api/financial', financialRoutes);
app.use('/api/toll', tollRoutes);

// Register additional TMS routes
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/iot', iotRoutes);
app.use('/api/compliance', complianceRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/edi', ediRoutes);
app.use('/api/ml', mlRoutes);
app.use('/api/ai', aiRoutes);

// Root route
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to Cargo Scale Pro API' });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
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

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(async () => {
    console.log('HTTP server closed');

    // Close database connections
    await db.closeConnections();
    await prisma.$disconnect();

    console.log('Database connections closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(async () => {
    console.log('HTTP server closed');

    // Close database connections
    await db.closeConnections();
    await prisma.$disconnect();

    console.log('Database connections closed');
    process.exit(0);
  });
});

export default app;
