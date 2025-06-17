/**
 * IoT & Sensor Management API Routes
 * Device management, real-time monitoring, and telematics data
 */

import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { setCompanyContextMiddleware } from '../middleware/companyContext';
import { IoTService } from '../services/iot/IoTService';
import { TelematicsService } from '../services/telematics/TelematicsService';
import prisma from '../config/prisma';
import { logger } from '../utils/logger';

const router = express.Router();
const iotService = new IoTService();
const telematicsService = new TelematicsService();

// Apply middleware to all routes
router.use(protect);
router.use(setCompanyContextMiddleware);

/**
 * GET /api/iot/devices
 * Get all IoT devices with filtering
 */
router.get('/devices', async (req, res) => {
  try {
    const { type, status, vehicleId, page = 1, limit = 20 } = req.query;
    
    const whereClause: any = {
      company_id: req.user.companyId
    };

    if (type) {
      whereClause.device_type = type;
    }

    if (status) {
      whereClause.status = status;
    }

    if (vehicleId) {
      whereClause.vehicle_id = parseInt(vehicleId as string);
    }

    const devices = await prisma.iot_devices.findMany({
      where: whereClause,
      include: {
        vehicles: {
          select: {
            id: true,
            unit_number: true,
            make: true,
            model: true,
            year: true
          }
        }
      },
      orderBy: { created_at: 'desc' },
      skip: (parseInt(page as string) - 1) * parseInt(limit as string),
      take: parseInt(limit as string)
    });

    const totalCount = await prisma.iot_devices.count({
      where: whereClause
    });

    res.json({
      devices,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: totalCount,
        pages: Math.ceil(totalCount / parseInt(limit as string))
      }
    });

  } catch (error) {
    logger.error('Error fetching IoT devices:', error);
    res.status(500).json({ message: 'Error fetching IoT devices' });
  }
});

/**
 * POST /api/iot/devices
 * Register a new IoT device
 */
router.post('/devices', async (req, res) => {
  try {
    const {
      deviceId,
      deviceType,
      vehicleId,
      manufacturer,
      model,
      firmwareVersion,
      configuration,
      description
    } = req.body;

    const device = await iotService.registerDevice({
      deviceId,
      deviceType,
      vehicleId,
      companyId: req.user.companyId,
      manufacturer,
      model,
      firmwareVersion,
      configuration,
      description,
      registeredBy: req.user.id
    });

    res.status(201).json({
      success: true,
      device
    });

  } catch (error) {
    logger.error('Error registering IoT device:', error);
    res.status(500).json({ message: 'Error registering IoT device' });
  }
});

/**
 * GET /api/iot/devices/:id
 * Get a specific IoT device by ID
 */
router.get('/devices/:id', async (req, res) => {
  try {
    const deviceId = parseInt(req.params.id);

    const device = await prisma.iot_devices.findUnique({
      where: { id: deviceId },
      include: {
        vehicles: true,
        iot_sensor_data: {
          orderBy: { timestamp: 'desc' },
          take: 100 // Last 100 readings
        }
      }
    });

    if (!device || device.company_id !== req.user.companyId) {
      return res.status(404).json({ message: 'Device not found' });
    }

    res.json(device);

  } catch (error) {
    logger.error('Error fetching IoT device:', error);
    res.status(500).json({ message: 'Error fetching IoT device' });
  }
});

/**
 * PUT /api/iot/devices/:id
 * Update an IoT device configuration
 */
router.put('/devices/:id', async (req, res) => {
  try {
    const deviceId = parseInt(req.params.id);
    const updateData = req.body;

    const device = await iotService.updateDevice(deviceId, {
      ...updateData,
      companyId: req.user.companyId,
      updatedBy: req.user.id
    });

    res.json({
      success: true,
      device
    });

  } catch (error) {
    logger.error('Error updating IoT device:', error);
    res.status(500).json({ message: 'Error updating IoT device' });
  }
});

/**
 * POST /api/iot/devices/:id/calibrate
 * Calibrate an IoT device
 */
router.post('/devices/:id/calibrate', async (req, res) => {
  try {
    const deviceId = parseInt(req.params.id);
    const { calibrationData, notes } = req.body;

    const result = await iotService.calibrateDevice(deviceId, {
      calibrationData,
      notes,
      calibratedBy: req.user.id,
      companyId: req.user.companyId
    });

    res.json({
      success: true,
      calibration: result
    });

  } catch (error) {
    logger.error('Error calibrating IoT device:', error);
    res.status(500).json({ message: 'Error calibrating IoT device' });
  }
});

/**
 * GET /api/iot/sensor-data
 * Get sensor data with filtering
 */
router.get('/sensor-data', async (req, res) => {
  try {
    const { 
      deviceId, 
      vehicleId, 
      sensorType, 
      startDate, 
      endDate, 
      page = 1, 
      limit = 100 
    } = req.query;
    
    const whereClause: any = {
      iot_devices: {
        company_id: req.user.companyId
      }
    };

    if (deviceId) {
      whereClause.device_id = parseInt(deviceId as string);
    }

    if (vehicleId) {
      whereClause.iot_devices = {
        ...whereClause.iot_devices,
        vehicle_id: parseInt(vehicleId as string)
      };
    }

    if (sensorType) {
      whereClause.sensor_type = sensorType;
    }

    if (startDate && endDate) {
      whereClause.timestamp = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      };
    }

    const sensorData = await prisma.iot_sensor_data.findMany({
      where: whereClause,
      include: {
        iot_devices: {
          select: {
            id: true,
            device_id: true,
            device_type: true,
            vehicles: {
              select: {
                id: true,
                unit_number: true
              }
            }
          }
        }
      },
      orderBy: { timestamp: 'desc' },
      skip: (parseInt(page as string) - 1) * parseInt(limit as string),
      take: parseInt(limit as string)
    });

    const totalCount = await prisma.iot_sensor_data.count({
      where: whereClause
    });

    res.json({
      sensorData,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: totalCount,
        pages: Math.ceil(totalCount / parseInt(limit as string))
      }
    });

  } catch (error) {
    logger.error('Error fetching sensor data:', error);
    res.status(500).json({ message: 'Error fetching sensor data' });
  }
});

/**
 * POST /api/iot/sensor-data
 * Receive sensor data from IoT devices
 */
router.post('/sensor-data', async (req, res) => {
  try {
    const { deviceId, sensorType, value, unit, metadata, timestamp } = req.body;

    // Verify device belongs to company
    const device = await prisma.iot_devices.findFirst({
      where: {
        device_id: deviceId,
        company_id: req.user.companyId
      }
    });

    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }

    const sensorData = await iotService.processSensorData({
      deviceId: device.id,
      sensorType,
      value,
      unit,
      metadata,
      timestamp: timestamp ? new Date(timestamp) : new Date()
    });

    res.status(201).json({
      success: true,
      sensorData
    });

  } catch (error) {
    logger.error('Error processing sensor data:', error);
    res.status(500).json({ message: 'Error processing sensor data' });
  }
});

/**
 * GET /api/iot/telematics/:vehicleId
 * Get telematics data for a specific vehicle
 */
router.get('/telematics/:vehicleId', async (req, res) => {
  try {
    const vehicleId = parseInt(req.params.vehicleId);
    const { startDate, endDate, dataType } = req.query;

    // Verify vehicle belongs to company
    const vehicle = await prisma.vehicles.findUnique({
      where: { id: vehicleId }
    });

    if (!vehicle || vehicle.company_id !== req.user.companyId) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    const telematicsData = await telematicsService.getVehicleTelematics({
      vehicleId,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      dataType: dataType as string
    });

    res.json(telematicsData);

  } catch (error) {
    logger.error('Error fetching telematics data:', error);
    res.status(500).json({ message: 'Error fetching telematics data' });
  }
});

/**
 * GET /api/iot/alerts
 * Get IoT device alerts and notifications
 */
router.get('/alerts', async (req, res) => {
  try {
    const { severity, status, deviceId, page = 1, limit = 20 } = req.query;
    
    const whereClause: any = {
      iot_devices: {
        company_id: req.user.companyId
      }
    };

    if (severity) {
      whereClause.severity = severity;
    }

    if (status) {
      whereClause.status = status;
    }

    if (deviceId) {
      whereClause.device_id = parseInt(deviceId as string);
    }

    const alerts = await prisma.iot_alerts.findMany({
      where: whereClause,
      include: {
        iot_devices: {
          include: {
            vehicles: {
              select: {
                id: true,
                unit_number: true
              }
            }
          }
        }
      },
      orderBy: { created_at: 'desc' },
      skip: (parseInt(page as string) - 1) * parseInt(limit as string),
      take: parseInt(limit as string)
    });

    const totalCount = await prisma.iot_alerts.count({
      where: whereClause
    });

    res.json({
      alerts,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: totalCount,
        pages: Math.ceil(totalCount / parseInt(limit as string))
      }
    });

  } catch (error) {
    logger.error('Error fetching IoT alerts:', error);
    res.status(500).json({ message: 'Error fetching IoT alerts' });
  }
});

export default router;
