import express from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { protect } from '../middleware/authMiddleware';
import { setCompanyContextMiddleware } from '../middleware/companyContext';
import { MaintenanceService } from '../services/MaintenanceService';

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const createEquipmentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.string().min(1, 'Type is required'),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().min(1, 'Serial number is required'),
  purchaseDate: z.string().optional(),
  warrantyExpires: z.string().optional(),
  status: z.enum(['Available', 'In Use', 'Maintenance', 'Out of Service']).default('Available'),
  assignedToVehicle: z.string().optional(),
  assignedToTrailer: z.string().optional(),
  purchasePrice: z.number().min(0).optional(),
  currentValue: z.number().min(0).optional(),
  lastMaintenanceDate: z.string().optional(),
  nextMaintenanceDue: z.string().optional(),
  notes: z.string().optional(),
  companyId: z.number().optional()
});

const updateEquipmentSchema = createEquipmentSchema.partial();

// GET /api/equipment - Get all equipment for a company
router.get('/', protect, setCompanyContextMiddleware, async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const { status, type, search } = req.query;

    const where: any = {
      company_id: companyId
    };

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { manufacturer: { contains: search as string, mode: 'insensitive' } },
        { model: { contains: search as string, mode: 'insensitive' } },
        { serialNumber: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const equipment = await prisma.equipment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        assigned_vehicle: {
          select: {
            id: true,
            name: true,
            make: true,
            model: true
          }
        },
        assigned_trailer: {
          select: {
            id: true,
            name: true,
            make: true,
            model: true
          }
        },
        maintenanceRecords: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            scheduledDate: true,
            completedDate: true,
            type: true
          }
        }
      }
    });

    // Calculate statistics
    const stats = {
      total: equipment.length,
      available: equipment.filter(e => e.status === 'Available').length,
      inUse: equipment.filter(e => e.status === 'In Use').length,
      maintenance: equipment.filter(e => e.status === 'Maintenance').length,
      outOfService: equipment.filter(e => e.status === 'Out of Service').length,
      totalValue: equipment.reduce((sum, e) => sum + (e.currentValue || 0), 0),
      warrantyExpiring: equipment.filter(e => {
        if (!e.warrantyExpires) return false;
        const expiryDate = new Date(e.warrantyExpires);
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        return expiryDate <= thirtyDaysFromNow;
      }).length
    };

    res.json({
      equipment,
      stats
    });
  } catch (error) {
    console.error('Error fetching equipment:', error);
    res.status(500).json({ error: 'Failed to fetch equipment' });
  }
});

// GET /api/equipment/:id - Get specific equipment
router.get('/:id', protect, setCompanyContextMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;

    const equipment = await prisma.equipment.findFirst({
      where: {
        id: parseInt(id),
        company_id: companyId
      },
      include: {
        assigned_vehicle: {
          select: {
            id: true,
            name: true,
            make: true,
            model: true
          }
        },
        assigned_trailer: {
          select: {
            id: true,
            name: true,
            make: true,
            model: true
          }
        },
        maintenanceRecords: {
          orderBy: { createdAt: 'desc' },
          include: {
            parts: true,
            vendor: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    res.json(equipment);
  } catch (error) {
    console.error('Error fetching equipment:', error);
    res.status(500).json({ error: 'Failed to fetch equipment' });
  }
});

// POST /api/equipment - Create new equipment
router.post('/', protect, setCompanyContextMiddleware, async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const validatedData = createEquipmentSchema.parse({
      ...req.body,
      companyId
    });

    // Check if serial number already exists for this company
    const existingEquipment = await prisma.equipment.findFirst({
      where: {
        serial_number: validatedData.serialNumber,
        company_id: companyId
      }
    });

    if (existingEquipment) {
      return res.status(400).json({ error: 'Equipment with this serial number already exists' });
    }

    const equipment = await prisma.equipment.create({
      data: {
        name: validatedData.name,
        type: validatedData.type,
        manufacturer: validatedData.manufacturer,
        model: validatedData.model,
        serial_number: validatedData.serialNumber,
        purchase_date: validatedData.purchaseDate ? new Date(validatedData.purchaseDate) : new Date(),
        warranty_expires: validatedData.warrantyExpires ? new Date(validatedData.warrantyExpires) : null,
        status: validatedData.status,
        purchase_price: validatedData.purchasePrice,
        current_value: validatedData.currentValue,
        last_maintenance_date: validatedData.lastMaintenanceDate ? new Date(validatedData.lastMaintenanceDate) : null,
        next_maintenance_due: validatedData.nextMaintenanceDue ? new Date(validatedData.nextMaintenanceDue) : null,
        notes: validatedData.notes,
        company_id: companyId
      },
      include: {
        assigned_vehicle: {
          select: {
            id: true,
            name: true,
            make: true,
            model: true
          }
        },
        assigned_trailer: {
          select: {
            id: true,
            name: true,
            make: true,
            model: true
          }
        }
      }
    });

    res.status(201).json(equipment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    console.error('Error creating equipment:', error);
    res.status(500).json({ error: 'Failed to create equipment' });
  }
});

// PUT /api/equipment/:id - Update equipment
router.put('/:id', protect, setCompanyContextMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;
    const validatedData = updateEquipmentSchema.parse(req.body);

    // Check if equipment exists and belongs to company
    const existingEquipment = await prisma.equipment.findFirst({
      where: {
        id: parseInt(id),
        company_id: companyId
      }
    });

    if (!existingEquipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    // Check if serial number is being changed and if it conflicts
    if (validatedData.serialNumber && validatedData.serialNumber !== existingEquipment.serialNumber) {
      const conflictingEquipment = await prisma.equipment.findFirst({
        where: {
          serialNumber: validatedData.serialNumber,
          companyId: companyId,
          id: { not: parseInt(id) }
        }
      });

      if (conflictingEquipment) {
        return res.status(400).json({ error: 'Equipment with this serial number already exists' });
      }
    }

    const updateData: any = {
      name: validatedData.name,
      type: validatedData.type,
      manufacturer: validatedData.manufacturer,
      model: validatedData.model,
      serial_number: validatedData.serialNumber,
      status: validatedData.status,
      purchase_price: validatedData.purchasePrice,
      current_value: validatedData.currentValue,
      notes: validatedData.notes
    };
    
    // Convert date strings to Date objects
    if (validatedData.purchaseDate) {
      updateData.purchase_date = new Date(validatedData.purchaseDate);
    }
    if (validatedData.warrantyExpires) {
      updateData.warranty_expires = new Date(validatedData.warrantyExpires);
    }
    if (validatedData.lastMaintenanceDate) {
      updateData.last_maintenance_date = new Date(validatedData.lastMaintenanceDate);
    }
    if (validatedData.nextMaintenanceDue) {
      updateData.next_maintenance_due = new Date(validatedData.nextMaintenanceDue);
    }

    const equipment = await prisma.equipment.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        assigned_vehicle: {
          select: {
            id: true,
            name: true,
            make: true,
            model: true
          }
        },
        assigned_trailer: {
          select: {
            id: true,
            name: true,
            make: true,
            model: true
          }
        }
      }
    });

    res.json(equipment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    console.error('Error updating equipment:', error);
    res.status(500).json({ error: 'Failed to update equipment' });
  }
});

// DELETE /api/equipment/:id - Delete equipment
router.delete('/:id', protect, setCompanyContextMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;

    // Check if equipment exists and belongs to company
    const existingEquipment = await prisma.equipment.findFirst({
      where: {
        id: parseInt(id),
        company_id: companyId
      }
    });

    if (!existingEquipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    // Check if equipment is currently assigned
    if (existingEquipment.status === 'In Use') {
      return res.status(400).json({ 
        error: 'Cannot delete equipment that is currently in use. Please change status first.' 
      });
    }

    await prisma.equipment.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Equipment deleted successfully' });
  } catch (error) {
    console.error('Error deleting equipment:', error);
    res.status(500).json({ error: 'Failed to delete equipment' });
  }
});

// POST /api/equipment/:id/assign - Assign equipment to vehicle/trailer
router.post('/:id/assign', protect, setCompanyContextMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;
    const { vehicleId, trailerId } = req.body;

    const equipment = await prisma.equipment.findFirst({
      where: {
        id: parseInt(id),
        company_id: companyId
      }
    });

    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    if (equipment.status !== 'Available') {
      return res.status(400).json({ error: 'Equipment is not available for assignment' });
    }

    const updateData: any = {
      status: 'In Use'
    };

    if (vehicleId) {
      updateData.assigned_vehicle_id = vehicleId;
      updateData.assigned_trailer_id = null;
    } else if (trailerId) {
      updateData.assigned_trailer_id = trailerId;
      updateData.assigned_vehicle_id = null;
    }

    const updatedEquipment = await prisma.equipment.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        assigned_vehicle: {
          select: {
            id: true,
            name: true,
            make: true,
            model: true
          }
        },
        assigned_trailer: {
          select: {
            id: true,
            name: true,
            make: true,
            model: true
          }
        }
      }
    });

    res.json(updatedEquipment);
  } catch (error) {
    console.error('Error assigning equipment:', error);
    res.status(500).json({ error: 'Failed to assign equipment' });
  }
});

// POST /api/equipment/:id/unassign - Unassign equipment
router.post('/:id/unassign', protect, setCompanyContextMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;

    const equipment = await prisma.equipment.findFirst({
      where: {
        id: parseInt(id),
        company_id: companyId
      }
    });

    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    const updatedEquipment = await prisma.equipment.update({
      where: { id: parseInt(id) },
      data: {
        status: 'Available',
        assigned_vehicle_id: null,
        assigned_trailer_id: null
      },
      include: {
        assigned_vehicle: {
          select: {
            id: true,
            name: true,
            make: true,
            model: true
          }
        },
        assigned_trailer: {
          select: {
            id: true,
            name: true,
            make: true,
            model: true
          }
        }
      }
    });

    res.json(updatedEquipment);
  } catch (error) {
    console.error('Error unassigning equipment:', error);
    res.status(500).json({ error: 'Failed to unassign equipment' });
  }
});

// GET /api/equipment/:id/maintenance - Get maintenance data for equipment
router.get('/:id/maintenance', protect, setCompanyContextMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;

    // Verify equipment belongs to company
    const equipment = await prisma.equipment.findFirst({
      where: {
        id: parseInt(id),
        company_id: companyId
      }
    });

    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    // Get maintenance work orders for this equipment
    const workOrders = await MaintenanceService.getWorkOrders(companyId, {
      equipment_id: parseInt(id)
    });

    // Get maintenance metrics for this equipment
    const metrics = await MaintenanceService.getMaintenanceMetrics(companyId, parseInt(id));

    res.json({
      equipment,
      work_orders: workOrders,
      metrics
    });
  } catch (error) {
    console.error('Error fetching equipment maintenance data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;