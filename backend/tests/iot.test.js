/**
 * IoT & Sensor Management API Tests
 * Testing device management, sensor data processing, and telematics
 */

const request = require('supertest');
const express = require('express');
const iotRoutes = require('../routes/iot');

// Mock dependencies
jest.mock('../config/prisma', () => ({
  default: {
    iot_devices: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    iot_sensor_data: {
      findMany: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    },
    iot_alerts: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    vehicles: {
      findUnique: jest.fn(),
    }
  }
}));

jest.mock('../middleware/authMiddleware', () => ({
  protect: (req, res, next) => {
    req.user = { id: 1, companyId: 1 };
    next();
  }
}));

jest.mock('../middleware/companyContext', () => ({
  setCompanyContextMiddleware: (req, res, next) => next()
}));

jest.mock('../services/iot/IoTService', () => ({
  IoTService: jest.fn().mockImplementation(() => ({
    registerDevice: jest.fn(),
    updateDevice: jest.fn(),
    calibrateDevice: jest.fn(),
    processSensorData: jest.fn(),
  }))
}));

jest.mock('../services/telematics/TelematicsService', () => ({
  TelematicsService: jest.fn().mockImplementation(() => ({
    getVehicleTelematics: jest.fn(),
  }))
}));

jest.mock('../utils/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  }
}));

const prisma = require('../config/prisma').default;

// Create test app
const app = express();
app.use(express.json());
app.use('/api/iot', iotRoutes);

describe('IoT API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/iot/devices', () => {
    it('should fetch IoT devices successfully', async () => {
      const mockDevices = [
        {
          id: 1,
          device_id: 'TEMP001',
          device_type: 'temperature_sensor',
          status: 'active',
          vehicles: { unit_number: 'T001' }
        }
      ];

      prisma.iot_devices.findMany.mockResolvedValue(mockDevices);
      prisma.iot_devices.count.mockResolvedValue(1);

      const response = await request(app)
        .get('/api/iot/devices')
        .expect(200);

      expect(response.body.devices).toEqual(mockDevices);
      expect(response.body.pagination.total).toBe(1);
    });

    it('should filter devices by type', async () => {
      prisma.iot_devices.findMany.mockResolvedValue([]);
      prisma.iot_devices.count.mockResolvedValue(0);

      await request(app)
        .get('/api/iot/devices?type=gps_tracker')
        .expect(200);

      expect(prisma.iot_devices.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            device_type: 'gps_tracker'
          })
        })
      );
    });

    it('should filter devices by status', async () => {
      prisma.iot_devices.findMany.mockResolvedValue([]);
      prisma.iot_devices.count.mockResolvedValue(0);

      await request(app)
        .get('/api/iot/devices?status=active')
        .expect(200);

      expect(prisma.iot_devices.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'active'
          })
        })
      );
    });
  });

  describe('POST /api/iot/devices', () => {
    it('should register a new IoT device successfully', async () => {
      const mockDevice = {
        id: 1,
        device_id: 'TEMP002',
        device_type: 'temperature_sensor',
        vehicle_id: 1
      };

      const IoTService = require('../services/iot/IoTService').IoTService;
      const mockService = new IoTService();
      mockService.registerDevice.mockResolvedValue(mockDevice);

      const deviceData = {
        deviceId: 'TEMP002',
        deviceType: 'temperature_sensor',
        vehicleId: 1,
        manufacturer: 'SensorTech',
        model: 'ST-100'
      };

      const response = await request(app)
        .post('/api/iot/devices')
        .send(deviceData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(mockService.registerDevice).toHaveBeenCalledWith(
        expect.objectContaining({
          deviceId: 'TEMP002',
          deviceType: 'temperature_sensor',
          companyId: 1
        })
      );
    });

    it('should handle registration errors', async () => {
      const IoTService = require('../services/iot/IoTService').IoTService;
      const mockService = new IoTService();
      mockService.registerDevice.mockRejectedValue(new Error('Registration failed'));

      const response = await request(app)
        .post('/api/iot/devices')
        .send({})
        .expect(500);

      expect(response.body.message).toBe('Error registering IoT device');
    });
  });

  describe('GET /api/iot/devices/:id', () => {
    it('should fetch a specific device with sensor data', async () => {
      const mockDevice = {
        id: 1,
        device_id: 'TEMP001',
        company_id: 1,
        vehicles: { unit_number: 'T001' },
        iot_sensor_data: [
          { id: 1, sensor_type: 'temperature', value: 25.5, timestamp: new Date() }
        ]
      };

      prisma.iot_devices.findUnique.mockResolvedValue(mockDevice);

      const response = await request(app)
        .get('/api/iot/devices/1')
        .expect(200);

      expect(response.body).toEqual(mockDevice);
    });

    it('should return 404 for non-existent device', async () => {
      prisma.iot_devices.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/iot/devices/999')
        .expect(404);

      expect(response.body.message).toBe('Device not found');
    });

    it('should return 404 for device from different company', async () => {
      const mockDevice = {
        id: 1,
        company_id: 2 // Different company
      };

      prisma.iot_devices.findUnique.mockResolvedValue(mockDevice);

      const response = await request(app)
        .get('/api/iot/devices/1')
        .expect(404);

      expect(response.body.message).toBe('Device not found');
    });
  });

  describe('POST /api/iot/devices/:id/calibrate', () => {
    it('should calibrate a device successfully', async () => {
      const mockCalibration = {
        id: 1,
        device_id: 1,
        calibration_data: { offset: 0.5 }
      };

      const IoTService = require('../services/iot/IoTService').IoTService;
      const mockService = new IoTService();
      mockService.calibrateDevice.mockResolvedValue(mockCalibration);

      const calibrationData = {
        calibrationData: { offset: 0.5 },
        notes: 'Temperature sensor calibration'
      };

      const response = await request(app)
        .post('/api/iot/devices/1/calibrate')
        .send(calibrationData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockService.calibrateDevice).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          calibrationData: { offset: 0.5 },
          companyId: 1
        })
      );
    });
  });

  describe('GET /api/iot/sensor-data', () => {
    it('should fetch sensor data with filtering', async () => {
      const mockSensorData = [
        {
          id: 1,
          sensor_type: 'temperature',
          value: 25.5,
          timestamp: new Date(),
          iot_devices: {
            device_id: 'TEMP001',
            vehicles: { unit_number: 'T001' }
          }
        }
      ];

      prisma.iot_sensor_data.findMany.mockResolvedValue(mockSensorData);
      prisma.iot_sensor_data.count.mockResolvedValue(1);

      const response = await request(app)
        .get('/api/iot/sensor-data')
        .expect(200);

      expect(response.body.sensorData).toEqual(mockSensorData);
    });

    it('should filter by sensor type', async () => {
      prisma.iot_sensor_data.findMany.mockResolvedValue([]);
      prisma.iot_sensor_data.count.mockResolvedValue(0);

      await request(app)
        .get('/api/iot/sensor-data?sensorType=temperature')
        .expect(200);

      expect(prisma.iot_sensor_data.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            sensor_type: 'temperature'
          })
        })
      );
    });

    it('should filter by date range', async () => {
      prisma.iot_sensor_data.findMany.mockResolvedValue([]);
      prisma.iot_sensor_data.count.mockResolvedValue(0);

      const startDate = '2025-01-01';
      const endDate = '2025-01-31';

      await request(app)
        .get(`/api/iot/sensor-data?startDate=${startDate}&endDate=${endDate}`)
        .expect(200);

      expect(prisma.iot_sensor_data.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            timestamp: {
              gte: new Date(startDate),
              lte: new Date(endDate)
            }
          })
        })
      );
    });
  });

  describe('POST /api/iot/sensor-data', () => {
    it('should process sensor data successfully', async () => {
      const mockDevice = {
        id: 1,
        device_id: 'TEMP001',
        company_id: 1
      };

      const mockSensorData = {
        id: 1,
        device_id: 1,
        sensor_type: 'temperature',
        value: 25.5
      };

      prisma.iot_devices.findFirst.mockResolvedValue(mockDevice);

      const IoTService = require('../services/iot/IoTService').IoTService;
      const mockService = new IoTService();
      mockService.processSensorData.mockResolvedValue(mockSensorData);

      const sensorData = {
        deviceId: 'TEMP001',
        sensorType: 'temperature',
        value: 25.5,
        unit: 'celsius'
      };

      const response = await request(app)
        .post('/api/iot/sensor-data')
        .send(sensorData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(mockService.processSensorData).toHaveBeenCalledWith(
        expect.objectContaining({
          deviceId: 1,
          sensorType: 'temperature',
          value: 25.5
        })
      );
    });

    it('should return 404 for unknown device', async () => {
      prisma.iot_devices.findFirst.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/iot/sensor-data')
        .send({ deviceId: 'UNKNOWN' })
        .expect(404);

      expect(response.body.message).toBe('Device not found');
    });
  });

  describe('GET /api/iot/telematics/:vehicleId', () => {
    it('should fetch telematics data for vehicle', async () => {
      const mockVehicle = { id: 1, company_id: 1 };
      const mockTelematics = {
        vehicleId: 1,
        location: { lat: 40.7128, lng: -74.0060 },
        speed: 65,
        fuelLevel: 75
      };

      prisma.vehicles.findUnique.mockResolvedValue(mockVehicle);

      const TelematicsService = require('../services/telematics/TelematicsService').TelematicsService;
      const mockService = new TelematicsService();
      mockService.getVehicleTelematics.mockResolvedValue(mockTelematics);

      const response = await request(app)
        .get('/api/iot/telematics/1')
        .expect(200);

      expect(response.body).toEqual(mockTelematics);
    });

    it('should return 404 for non-existent vehicle', async () => {
      prisma.vehicles.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/iot/telematics/999')
        .expect(404);

      expect(response.body.message).toBe('Vehicle not found');
    });
  });

  describe('GET /api/iot/alerts', () => {
    it('should fetch IoT alerts', async () => {
      const mockAlerts = [
        {
          id: 1,
          severity: 'high',
          status: 'active',
          message: 'Temperature threshold exceeded',
          iot_devices: {
            device_id: 'TEMP001',
            vehicles: { unit_number: 'T001' }
          }
        }
      ];

      prisma.iot_alerts.findMany.mockResolvedValue(mockAlerts);
      prisma.iot_alerts.count.mockResolvedValue(1);

      const response = await request(app)
        .get('/api/iot/alerts')
        .expect(200);

      expect(response.body.alerts).toEqual(mockAlerts);
    });

    it('should filter alerts by severity', async () => {
      prisma.iot_alerts.findMany.mockResolvedValue([]);
      prisma.iot_alerts.count.mockResolvedValue(0);

      await request(app)
        .get('/api/iot/alerts?severity=critical')
        .expect(200);

      expect(prisma.iot_alerts.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            severity: 'critical'
          })
        })
      );
    });
  });
});

module.exports = {
  app
};
