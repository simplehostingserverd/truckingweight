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

const { v4: uuidv4 } = require('uuid');

// Mock data generators
function generateMockDrivers() {
  const drivers = [];
  const names = ['John Smith', 'Sarah Johnson', 'Mike Wilson', 'Lisa Brown', 'David Lee', 'Emma Davis', 'Chris Taylor', 'Anna Garcia'];
  const vehicles = ['TRK-001', 'TRK-002', 'TRK-003', 'TRK-004', 'TRK-005', 'TRK-006', 'TRK-007', 'TRK-008'];
  const statuses = ['active', 'break', 'offline', 'maintenance'];
  
  for (let i = 0; i < 32; i++) {
    drivers.push({
      id: `driver-${i + 1}`,
      name: names[i % names.length] + (i >= names.length ? ` ${Math.floor(i / names.length) + 1}` : ''),
      vehicleId: vehicles[i % vehicles.length] + (i >= vehicles.length ? `-${Math.floor(i / vehicles.length) + 1}` : ''),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      location: {
        lat: 40.7128 + (Math.random() - 0.5) * 0.1,
        lng: -74.0060 + (Math.random() - 0.5) * 0.1,
        address: `${Math.floor(Math.random() * 999) + 1} Main St, New York, NY`,
        timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString()
      },
      route: {
        origin: 'New York, NY',
        destination: 'Philadelphia, PA',
        progress: Math.floor(Math.random() * 100),
        eta: new Date(Date.now() + Math.random() * 7200000).toISOString()
      },
      metrics: {
        speed: Math.floor(Math.random() * 70) + 30,
        fuelLevel: Math.floor(Math.random() * 100),
        safetyScore: Math.floor(Math.random() * 20) + 80,
        hoursOfService: Math.floor(Math.random() * 14),
        milesDriven: Math.floor(Math.random() * 500) + 100
      }
    });
  }
  
  return drivers;
}

function generateMockRouteHistory() {
  const routes = [];
  const drivers = generateMockDrivers();
  
  for (let i = 0; i < 50; i++) {
    const driver = drivers[Math.floor(Math.random() * drivers.length)];
    const startTime = new Date(Date.now() - Math.random() * 7 * 24 * 3600000);
    const endTime = new Date(startTime.getTime() + Math.random() * 8 * 3600000);
    
    routes.push({
      id: `route-${i + 1}`,
      driverId: driver.id,
      driverName: driver.name,
      vehicleId: driver.vehicleId,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      origin: {
        address: 'New York Distribution Center',
        lat: 40.7128,
        lng: -74.0060
      },
      destination: {
        address: 'Philadelphia Warehouse',
        lat: 39.9526,
        lng: -75.1652
      },
      distance: Math.floor(Math.random() * 200) + 50,
      duration: Math.floor((endTime - startTime) / 60000),
      status: Math.random() > 0.2 ? 'completed' : 'in-progress',
      waypoints: generateWaypoints(),
      metrics: {
        avgSpeed: Math.floor(Math.random() * 30) + 45,
        maxSpeed: Math.floor(Math.random() * 20) + 70,
        fuelConsumed: Math.floor(Math.random() * 50) + 20,
        safetyEvents: Math.floor(Math.random() * 5),
        idleTime: Math.floor(Math.random() * 60)
      }
    });
  }
  
  return routes.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
}

function generateWaypoints() {
  const waypoints = [];
  const baseLatStart = 40.7128;
  const baseLngStart = -74.0060;
  const baseLatEnd = 39.9526;
  const baseLngEnd = -75.1652;
  
  for (let i = 0; i <= 10; i++) {
    const progress = i / 10;
    waypoints.push({
      lat: baseLatStart + (baseLatEnd - baseLatStart) * progress + (Math.random() - 0.5) * 0.01,
      lng: baseLngStart + (baseLngEnd - baseLngStart) * progress + (Math.random() - 0.5) * 0.01,
      timestamp: new Date(Date.now() - (10 - i) * 600000).toISOString(),
      speed: Math.floor(Math.random() * 40) + 40
    });
  }
  
  return waypoints;
}

function generateMockGeofences() {
  return [
    {
      id: 'zone-1',
      name: 'NYC Distribution Center',
      type: 'depot',
      coordinates: {
        lat: 40.7128,
        lng: -74.0060,
        radius: 500
      },
      isActive: true,
      alertsEnabled: true,
      createdAt: '2024-01-15T08:00:00Z',
      violations: 2
    },
    {
      id: 'zone-2',
      name: 'Customer Zone A',
      type: 'customer',
      coordinates: {
        lat: 40.7589,
        lng: -73.9851,
        radius: 300
      },
      isActive: true,
      alertsEnabled: true,
      createdAt: '2024-01-20T10:30:00Z',
      violations: 0
    },
    {
      id: 'zone-3',
      name: 'Restricted Area',
      type: 'restricted',
      coordinates: {
        lat: 40.7505,
        lng: -73.9934,
        radius: 200
      },
      isActive: true,
      alertsEnabled: true,
      createdAt: '2024-01-25T14:15:00Z',
      violations: 1
    }
  ];
}

function generateMockNotifications() {
  const notifications = [];
  const types = ['safety', 'geofence', 'maintenance', 'route', 'fuel', 'hos'];
  const priorities = ['low', 'medium', 'high', 'critical'];
  const drivers = generateMockDrivers();
  
  for (let i = 0; i < 25; i++) {
    const driver = drivers[Math.floor(Math.random() * drivers.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    const priority = priorities[Math.floor(Math.random() * priorities.length)];
    
    notifications.push({
      id: `notification-${i + 1}`,
      type,
      priority,
      title: getNotificationTitle(type, priority),
      message: getNotificationMessage(type, driver.name),
      driverId: driver.id,
      driverName: driver.name,
      vehicleId: driver.vehicleId,
      timestamp: new Date(Date.now() - Math.random() * 24 * 3600000).toISOString(),
      isRead: Math.random() > 0.3,
      isResolved: Math.random() > 0.6,
      location: driver.location,
      actions: getNotificationActions(type)
    });
  }
  
  return notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

function getNotificationTitle(type, priority) {
  const titles = {
    safety: priority === 'critical' ? 'Emergency Brake Event' : 'Safety Alert',
    geofence: 'Geofence Violation',
    maintenance: 'Maintenance Required',
    route: 'Route Deviation',
    fuel: 'Low Fuel Warning',
    hos: 'Hours of Service Alert'
  };
  return titles[type] || 'System Alert';
}

function getNotificationMessage(type, driverName) {
  const messages = {
    safety: `${driverName} triggered a safety alert due to hard braking`,
    geofence: `${driverName} has violated a restricted geofence zone`,
    maintenance: `Vehicle driven by ${driverName} requires immediate maintenance`,
    route: `${driverName} has deviated from the planned route`,
    fuel: `${driverName}'s vehicle is running low on fuel`,
    hos: `${driverName} is approaching hours of service limit`
  };
  return messages[type] || `System alert for ${driverName}`;
}

function getNotificationActions(type) {
  const actions = {
    safety: [{ id: 'contact', label: 'Contact Driver' }, { id: 'review', label: 'Review Incident' }],
    geofence: [{ id: 'alert', label: 'Send Alert' }, { id: 'reroute', label: 'Suggest Route' }],
    maintenance: [{ id: 'schedule', label: 'Schedule Service' }, { id: 'contact', label: 'Contact Driver' }],
    route: [{ id: 'reroute', label: 'Send New Route' }, { id: 'contact', label: 'Contact Driver' }],
    fuel: [{ id: 'locate', label: 'Find Gas Station' }, { id: 'alert', label: 'Send Alert' }],
    hos: [{ id: 'rest', label: 'Find Rest Area' }, { id: 'contact', label: 'Contact Driver' }]
  };
  return actions[type] || [{ id: 'acknowledge', label: 'Acknowledge' }];
}

// Route handlers
async function driverTrackingRoutes(fastify, options) {
  // Get all active drivers with live tracking data
  fastify.get('/drivers/live', {
    config: { public: false },
    schema: {
      description: 'Get live tracking data for all active drivers',
      tags: ['Driver Tracking'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                drivers: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      name: { type: 'string' },
                      vehicleId: { type: 'string' },
                      status: { type: 'string' },
                      location: { type: 'object' },
                      route: { type: 'object' },
                      metrics: { type: 'object' }
                    }
                  }
                },
                summary: {
                  type: 'object',
                  properties: {
                    totalDrivers: { type: 'number' },
                    activeDrivers: { type: 'number' },
                    onSchedule: { type: 'number' },
                    avgSafetyScore: { type: 'number' }
                  }
                }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const drivers = generateMockDrivers();
      const activeDrivers = drivers.filter(d => d.status === 'active');
      
      const summary = {
        totalDrivers: drivers.length,
        activeDrivers: activeDrivers.length,
        onSchedule: drivers.filter(d => d.route.progress > 0 && d.route.progress < 100).length,
        avgSafetyScore: Math.round(drivers.reduce((sum, d) => sum + d.metrics.safetyScore, 0) / drivers.length)
      };
      
      return {
        success: true,
        data: {
          drivers,
          summary
        }
      };
    } catch (error) {
      fastify.log.error('Error fetching live driver data:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch live driver data'
      });
    }
  });

  // Get route history with filtering and pagination
  fastify.get('/routes/history', {
    config: { public: false },
    schema: {
      description: 'Get route history with filtering options',
      tags: ['Driver Tracking'],
      querystring: {
        type: 'object',
        properties: {
          driverId: { type: 'string' },
          vehicleId: { type: 'string' },
          startDate: { type: 'string' },
          endDate: { type: 'string' },
          status: { type: 'string' },
          page: { type: 'number', default: 1 },
          limit: { type: 'number', default: 20 }
        }
      }
    }
  }, async (request, reply) => {
    try {
      let routes = generateMockRouteHistory();
      const { driverId, vehicleId, startDate, endDate, status, page = 1, limit = 20 } = request.query;
      
      // Apply filters
      if (driverId) {
        routes = routes.filter(r => r.driverId === driverId);
      }
      if (vehicleId) {
        routes = routes.filter(r => r.vehicleId === vehicleId);
      }
      if (startDate) {
        routes = routes.filter(r => new Date(r.startTime) >= new Date(startDate));
      }
      if (endDate) {
        routes = routes.filter(r => new Date(r.startTime) <= new Date(endDate));
      }
      if (status) {
        routes = routes.filter(r => r.status === status);
      }
      
      // Pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedRoutes = routes.slice(startIndex, endIndex);
      
      return {
        success: true,
        data: {
          routes: paginatedRoutes,
          pagination: {
            page,
            limit,
            total: routes.length,
            totalPages: Math.ceil(routes.length / limit)
          }
        }
      };
    } catch (error) {
      fastify.log.error('Error fetching route history:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch route history'
      });
    }
  });

  // Get specific route details with waypoints
  fastify.get('/routes/:routeId', {
    config: { public: false },
    schema: {
      description: 'Get detailed route information including waypoints',
      tags: ['Driver Tracking'],
      params: {
        type: 'object',
        properties: {
          routeId: { type: 'string' }
        },
        required: ['routeId']
      }
    }
  }, async (request, reply) => {
    try {
      const { routeId } = request.params;
      const routes = generateMockRouteHistory();
      const route = routes.find(r => r.id === routeId);
      
      if (!route) {
        return reply.status(404).send({
          success: false,
          error: 'Route not found'
        });
      }
      
      return {
        success: true,
        data: { route }
      };
    } catch (error) {
      fastify.log.error('Error fetching route details:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch route details'
      });
    }
  });

  // Get geofence zones and violations
  fastify.get('/geofences', {
    config: { public: false },
    schema: {
      description: 'Get all geofence zones and recent violations',
      tags: ['Driver Tracking']
    }
  }, async (request, reply) => {
    try {
      const zones = generateMockGeofences();
      const violations = [];
      
      // Generate recent violations
      for (let i = 0; i < 10; i++) {
        const zone = zones[Math.floor(Math.random() * zones.length)];
        const drivers = generateMockDrivers();
        const driver = drivers[Math.floor(Math.random() * drivers.length)];
        
        violations.push({
          id: `violation-${i + 1}`,
          zoneId: zone.id,
          zoneName: zone.name,
          driverId: driver.id,
          driverName: driver.name,
          vehicleId: driver.vehicleId,
          timestamp: new Date(Date.now() - Math.random() * 24 * 3600000).toISOString(),
          type: zone.type === 'restricted' ? 'entry' : 'exit',
          severity: zone.type === 'restricted' ? 'high' : 'medium',
          isResolved: Math.random() > 0.4
        });
      }
      
      return {
        success: true,
        data: {
          zones,
          violations: violations.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        }
      };
    } catch (error) {
      fastify.log.error('Error fetching geofence data:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch geofence data'
      });
    }
  });

  // Create new geofence zone
  fastify.post('/geofences', {
    config: { public: false },
    schema: {
      description: 'Create a new geofence zone',
      tags: ['Driver Tracking'],
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          type: { type: 'string', enum: ['depot', 'customer', 'restricted'] },
          coordinates: {
            type: 'object',
            properties: {
              lat: { type: 'number' },
              lng: { type: 'number' },
              radius: { type: 'number' }
            },
            required: ['lat', 'lng', 'radius']
          },
          alertsEnabled: { type: 'boolean', default: true }
        },
        required: ['name', 'type', 'coordinates']
      }
    }
  }, async (request, reply) => {
    try {
      const { name, type, coordinates, alertsEnabled = true } = request.body;
      
      const newZone = {
        id: `zone-${uuidv4()}`,
        name,
        type,
        coordinates,
        isActive: true,
        alertsEnabled,
        createdAt: new Date().toISOString(),
        violations: 0
      };
      
      return {
        success: true,
        data: { zone: newZone },
        message: 'Geofence zone created successfully'
      };
    } catch (error) {
      fastify.log.error('Error creating geofence zone:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to create geofence zone'
      });
    }
  });

  // Get notifications with filtering
  fastify.get('/notifications', {
    config: { public: false },
    schema: {
      description: 'Get notifications with filtering options',
      tags: ['Driver Tracking'],
      querystring: {
        type: 'object',
        properties: {
          type: { type: 'string' },
          priority: { type: 'string' },
          isRead: { type: 'boolean' },
          isResolved: { type: 'boolean' },
          driverId: { type: 'string' },
          page: { type: 'number', default: 1 },
          limit: { type: 'number', default: 20 }
        }
      }
    }
  }, async (request, reply) => {
    try {
      let notifications = generateMockNotifications();
      const { type, priority, isRead, isResolved, driverId, page = 1, limit = 20 } = request.query;
      
      // Apply filters
      if (type) {
        notifications = notifications.filter(n => n.type === type);
      }
      if (priority) {
        notifications = notifications.filter(n => n.priority === priority);
      }
      if (typeof isRead === 'boolean') {
        notifications = notifications.filter(n => n.isRead === isRead);
      }
      if (typeof isResolved === 'boolean') {
        notifications = notifications.filter(n => n.isResolved === isResolved);
      }
      if (driverId) {
        notifications = notifications.filter(n => n.driverId === driverId);
      }
      
      // Pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedNotifications = notifications.slice(startIndex, endIndex);
      
      // Calculate summary stats
      const summary = {
        total: notifications.length,
        unread: notifications.filter(n => !n.isRead).length,
        critical: notifications.filter(n => n.priority === 'critical').length,
        unresolved: notifications.filter(n => !n.isResolved).length
      };
      
      return {
        success: true,
        data: {
          notifications: paginatedNotifications,
          summary,
          pagination: {
            page,
            limit,
            total: notifications.length,
            totalPages: Math.ceil(notifications.length / limit)
          }
        }
      };
    } catch (error) {
      fastify.log.error('Error fetching notifications:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch notifications'
      });
    }
  });

  // Mark notification as read/resolved
  fastify.patch('/notifications/:notificationId', {
    config: { public: false },
    schema: {
      description: 'Update notification status',
      tags: ['Driver Tracking'],
      params: {
        type: 'object',
        properties: {
          notificationId: { type: 'string' }
        },
        required: ['notificationId']
      },
      body: {
        type: 'object',
        properties: {
          isRead: { type: 'boolean' },
          isResolved: { type: 'boolean' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { notificationId } = request.params;
      const { isRead, isResolved } = request.body;
      
      // In a real implementation, you would update the database
      const updatedNotification = {
        id: notificationId,
        isRead: isRead !== undefined ? isRead : true,
        isResolved: isResolved !== undefined ? isResolved : false,
        updatedAt: new Date().toISOString()
      };
      
      return {
        success: true,
        data: { notification: updatedNotification },
        message: 'Notification updated successfully'
      };
    } catch (error) {
      fastify.log.error('Error updating notification:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to update notification'
      });
    }
  });

  // Get driver analytics and metrics
  fastify.get('/analytics', {
    config: { public: false },
    schema: {
      description: 'Get comprehensive driver and fleet analytics',
      tags: ['Driver Tracking'],
      querystring: {
        type: 'object',
        properties: {
          timeRange: { type: 'string', enum: ['24h', '7d', '30d', '90d'], default: '24h' },
          driverId: { type: 'string' },
          vehicleId: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { timeRange = '24h', driverId, vehicleId } = request.query;
      
      // Generate comprehensive analytics data
      const analytics = {
        fleetMetrics: {
          totalDrivers: 32,
          activeDrivers: 28,
          totalVehicles: 35,
          activeVehicles: 30,
          totalMiles: 15420,
          avgSafetyScore: 94.2,
          fuelEfficiency: 7.8,
          onTimeDeliveries: 87.5
        },
        performanceMetrics: {
          avgSpeed: 58.3,
          totalIdleTime: 145,
          fuelConsumption: 1975.5,
          maintenanceAlerts: 3,
          safetyIncidents: 2,
          routeOptimization: 92.1
        },
        timeSeriesData: {
          performance: generateTimeSeriesData('performance', timeRange),
          safety: generateTimeSeriesData('safety', timeRange),
          fuel: generateTimeSeriesData('fuel', timeRange)
        },
        topPerformers: [
          { driverId: 'driver-1', name: 'John Smith', score: 98.5, metric: 'Safety Score' },
          { driverId: 'driver-3', name: 'Mike Wilson', score: 97.2, metric: 'Fuel Efficiency' },
          { driverId: 'driver-5', name: 'David Lee', score: 96.8, metric: 'On-Time Delivery' }
        ],
        alerts: {
          critical: 2,
          warning: 5,
          info: 12
        }
      };
      
      return {
        success: true,
        data: analytics
      };
    } catch (error) {
      fastify.log.error('Error fetching analytics:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch analytics'
      });
    }
  });
}

function generateTimeSeriesData(type, timeRange) {
  const data = [];
  const points = timeRange === '24h' ? 24 : timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
  const interval = timeRange === '24h' ? 3600000 : 24 * 3600000; // 1 hour or 1 day
  
  for (let i = 0; i < points; i++) {
    const timestamp = new Date(Date.now() - (points - i - 1) * interval);
    let value;
    
    switch (type) {
      case 'performance':
        value = Math.floor(Math.random() * 20) + 80;
        break;
      case 'safety':
        value = Math.floor(Math.random() * 15) + 85;
        break;
      case 'fuel':
        value = Math.floor(Math.random() * 3) + 6;
        break;
      default:
        value = Math.floor(Math.random() * 100);
    }
    
    data.push({
      timestamp: timestamp.toISOString(),
      value
    });
  }
  
  return data;
}

module.exports = driverTrackingRoutes;