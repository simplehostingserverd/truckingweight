/**
 * LEGACY FILE - NOT USED IN PRODUCTION
 *
 * This is the TypeScript Express.js server implementation.
 * The application now uses server-fastify.js as the primary server.
 * This file is kept for reference purposes only and may be used
 * as a basis for a future TypeScript Fastify implementation.
 */

import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'
import helmet from 'helmet'
import compression from 'compression'

// Load environment variables
dotenv.config()

// Import database connections
import * as db from './config/database'
import prisma from './config/prisma'

// Import middleware
import setCompanyContextMiddleware from './middleware/companyContext'

// Import routes
import authRoutes from './routes/auth'
import weightRoutes from './routes/weights'
import loadRoutes from './routes/loads'
import companyRoutes from './routes/companies'
import vehicleRoutes from './routes/vehicles'
import driverRoutes from './routes/drivers'
import adminRoutes from './routes/admin'
import dashboardRoutes from './routes/dashboard'
import scaleRoutes from './routes/scaleRoutes'
import weighTicketRoutes from './routes/weighTicketRoutes'

// Create Express app
const app = express()

// Middleware
app.use(cors())
app.use(helmet()); // Security headers
app.use(compression()); // Compress responses
app.use(express.json())
app.use(morgan('dev'))

// Add company context middleware after auth middleware
// This should be placed after your authentication middleware
// that sets req.user with the authenticated user information
app.use(setCompanyContextMiddleware)

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/weights', weightRoutes)
app.use('/api/loads', loadRoutes)
app.use('/api/companies', companyRoutes)
app.use('/api/vehicles', vehicleRoutes)
app.use('/api/drivers', driverRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/scales', scaleRoutes)
app.use('/api/weigh-tickets', weighTicketRoutes)

// Root route
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to TruckingSemis API' })
})

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack)
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err,
  })
})

// Start server
const PORT = process.env.PORT || 5000
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server')
  server.close(async () => {
    console.log('HTTP server closed')

    // Close database connections
    await db.closeConnections()
    await prisma.$disconnect()

    console.log('Database connections closed')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server')
  server.close(async () => {
    console.log('HTTP server closed')

    // Close database connections
    await db.closeConnections()
    await prisma.$disconnect()

    console.log('Database connections closed')
    process.exit(0)
  })
})

export default app
