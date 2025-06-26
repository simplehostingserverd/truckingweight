import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas
const createWorkOrderSchema = z.object({
  equipment_id: z.number(),
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  scheduled_date: z.string().datetime().optional(),
  estimated_hours: z.number().positive().optional(),
  estimated_cost: z.number().positive().optional(),
  assigned_to: z.string().optional(),
});

const updateWorkOrderSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
  scheduled_date: z.string().datetime().optional(),
  completed_date: z.string().datetime().optional(),
  estimated_hours: z.number().positive().optional(),
  actual_hours: z.number().positive().optional(),
  estimated_cost: z.number().positive().optional(),
  actual_cost: z.number().positive().optional(),
  assigned_to: z.string().optional(),
  notes: z.string().optional(),
});

const createPartSchema = z.object({
  name: z.string().min(1),
  part_number: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
  unit_cost: z.number().positive(),
  quantity_in_stock: z.number().int().min(0),
  minimum_stock_level: z.number().int().min(0).optional(),
  vendor_id: z.number().optional(),
});

const createVendorSchema = z.object({
  name: z.string().min(1),
  contact_person: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  specialties: z.string().optional(),
});

export class MaintenanceService {
  // Work Order Management
  static async createWorkOrder(companyId: number, data: z.infer<typeof createWorkOrderSchema>) {
    const validatedData = createWorkOrderSchema.parse(data);
    
    // Verify equipment belongs to company
    const equipment = await prisma.equipment.findFirst({
      where: {
        id: validatedData.equipment_id,
        company_id: companyId,
      },
    });
    
    if (!equipment) {
      throw new Error('Equipment not found or does not belong to company');
    }
    
    return await prisma.maintenance_work_orders.create({
      data: {
        ...validatedData,
        scheduled_date: validatedData.scheduled_date ? new Date(validatedData.scheduled_date) : null,
        status: 'pending',
      },
      include: {
        equipment: true,
      },
    });
  }
  
  static async getWorkOrders(companyId: number, filters?: {
    equipment_id?: number;
    status?: string;
    priority?: string;
    assigned_to?: string;
  }) {
    interface MaintenanceWorkOrderWhereClause {
      equipment: {
        company_id: number;
      };
      equipment_id?: number;
      status?: string;
      priority?: string;
      assigned_to?: string;
    }

    const where: MaintenanceWorkOrderWhereClause = {
      equipment: {
        company_id: companyId,
      },
    };
    
    if (filters?.equipment_id) {
      where.equipment_id = filters.equipment_id;
    }
    
    if (filters?.status) {
      where.status = filters.status;
    }
    
    if (filters?.priority) {
      where.priority = filters.priority;
    }
    
    if (filters?.assigned_to) {
      where.assigned_to = filters.assigned_to;
    }
    
    return await prisma.maintenance_work_orders.findMany({
      where,
      include: {
        equipment: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }
  
  static async getWorkOrderById(companyId: number, workOrderId: number) {
    return await prisma.maintenance_work_orders.findFirst({
      where: {
        id: workOrderId,
        equipment: {
          company_id: companyId,
        },
      },
      include: {
        equipment: true,
      },
    });
  }
  
  static async updateWorkOrder(companyId: number, workOrderId: number, data: z.infer<typeof updateWorkOrderSchema>) {
    const validatedData = updateWorkOrderSchema.parse(data);
    
    // Verify work order belongs to company
    const workOrder = await this.getWorkOrderById(companyId, workOrderId);
    if (!workOrder) {
      throw new Error('Work order not found or does not belong to company');
    }
    
    interface WorkOrderUpdateData {
      title?: string;
      description?: string;
      priority?: 'low' | 'medium' | 'high' | 'critical';
      status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
      scheduled_date?: Date;
      completed_date?: Date;
      estimated_hours?: number;
      actual_hours?: number;
      estimated_cost?: number;
      actual_cost?: number;
      assigned_to?: string;
      notes?: string;
    }

    const updateData: WorkOrderUpdateData = { ...validatedData };
    
    if (validatedData.scheduled_date) {
      updateData.scheduled_date = new Date(validatedData.scheduled_date);
    }
    
    if (validatedData.completed_date) {
      updateData.completed_date = new Date(validatedData.completed_date);
    }
    
    return await prisma.maintenance_work_orders.update({
      where: { id: workOrderId },
      data: updateData,
      include: {
        equipment: true,
      },
    });
  }
  
  static async completeWorkOrder(companyId: number, workOrderId: number, data: {
    actual_hours?: number;
    actual_cost?: number;
    notes?: string;
  }) {
    return await this.updateWorkOrder(companyId, workOrderId, {
      ...data,
      status: 'completed',
      completed_date: new Date().toISOString(),
    });
  }
  
  static async deleteWorkOrder(companyId: number, workOrderId: number) {
    const workOrder = await this.getWorkOrderById(companyId, workOrderId);
    if (!workOrder) {
      throw new Error('Work order not found or does not belong to company');
    }
    
    return await prisma.maintenance_work_orders.delete({
      where: { id: workOrderId },
    });
  }
  
  // Parts Management
  static async createPart(companyId: number, data: z.infer<typeof createPartSchema>) {
    const validatedData = createPartSchema.parse(data);
    
    // If vendor_id is provided, verify it belongs to company
    if (validatedData.vendor_id) {
      const vendor = await prisma.maintenance_vendors.findFirst({
        where: {
          id: validatedData.vendor_id,
          company_id: companyId,
        },
      });
      
      if (!vendor) {
        throw new Error('Vendor not found or does not belong to company');
      }
    }
    
    return await prisma.maintenance_parts.create({
      data: {
        ...validatedData,
        company_id: companyId,
      },
      include: {
        vendor: true,
      },
    });
  }
  
  static async getParts(companyId: number, filters?: {
    category?: string;
    vendor_id?: number;
    low_stock?: boolean;
  }) {
    interface PartsWhereClause {
      company_id: number;
      category?: string;
      vendor_id?: number;
      quantity_in_stock?: {
        lte: any;
      };
    }

    const where: PartsWhereClause = {
      company_id: companyId,
    };
    
    if (filters?.category) {
      where.category = filters.category;
    }
    
    if (filters?.vendor_id) {
      where.vendor_id = filters.vendor_id;
    }
    
    if (filters?.low_stock) {
      where.quantity_in_stock = {
        lte: prisma.maintenance_parts.fields.minimum_stock_level,
      };
    }
    
    return await prisma.maintenance_parts.findMany({
      where,
      include: {
        vendor: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }
  
  // Vendor Management
  static async createVendor(companyId: number, data: z.infer<typeof createVendorSchema>) {
    const validatedData = createVendorSchema.parse(data);
    
    return await prisma.maintenance_vendors.create({
      data: {
        ...validatedData,
        company_id: companyId,
      },
    });
  }
  
  static async getVendors(companyId: number) {
    return await prisma.maintenance_vendors.findMany({
      where: {
        company_id: companyId,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }
  
  // Maintenance Metrics
  static async getMaintenanceMetrics(companyId: number, equipmentId?: number) {
    interface MaintenanceMetricsWhereClause {
      equipment: {
        company_id: number;
      };
      equipment_id?: number;
    }

    const where: MaintenanceMetricsWhereClause = {
      equipment: {
        company_id: companyId,
      },
    };
    
    if (equipmentId) {
      where.equipment_id = equipmentId;
    }
    
    const [totalWorkOrders, completedWorkOrders, pendingWorkOrders, totalCost] = await Promise.all([
      prisma.maintenance_work_orders.count({ where }),
      prisma.maintenance_work_orders.count({ where: { ...where, status: 'completed' } }),
      prisma.maintenance_work_orders.count({ where: { ...where, status: 'pending' } }),
      prisma.maintenance_work_orders.aggregate({
        where: { ...where, status: 'completed' },
        _sum: { actual_cost: true },
      }),
    ]);
    
    const avgCostPerWorkOrder = totalCost._sum.actual_cost && completedWorkOrders > 0 
      ? totalCost._sum.actual_cost / completedWorkOrders 
      : 0;
    
    return {
      total_work_orders: totalWorkOrders,
      completed_work_orders: completedWorkOrders,
      pending_work_orders: pendingWorkOrders,
      total_maintenance_cost: totalCost._sum.actual_cost || 0,
      average_cost_per_work_order: avgCostPerWorkOrder,
      completion_rate: totalWorkOrders > 0 ? (completedWorkOrders / totalWorkOrders) * 100 : 0,
    };
  }
  
  // Predictive Maintenance
  static async getPredictiveMaintenanceAlerts(companyId: number) {
    // This would integrate with ML service for predictive maintenance
    // For now, return basic alerts based on equipment age and usage
    const equipment = await prisma.equipment.findMany({
      where: {
        company_id: companyId,
        status: 'active',
      },
      include: {
        maintenance_work_orders: {
          where: {
            status: 'completed',
          },
          orderBy: {
            completed_date: 'desc',
          },
          take: 1,
        },
      },
    });
    
    const alerts = [];
    const now = new Date();
    
    for (const item of equipment) {
      const daysSincePurchase = Math.floor((now.getTime() - item.purchase_date.getTime()) / (1000 * 60 * 60 * 24));
      const lastMaintenance = item.maintenance_work_orders[0];
      
      // Alert if no maintenance in 90 days
      if (!lastMaintenance || (now.getTime() - lastMaintenance.completed_date!.getTime()) / (1000 * 60 * 60 * 24) > 90) {
        alerts.push({
          equipment_id: item.id,
          equipment_name: item.name,
          alert_type: 'overdue_maintenance',
          message: 'Equipment is overdue for maintenance',
          priority: 'high',
          days_overdue: lastMaintenance 
            ? Math.floor((now.getTime() - lastMaintenance.completed_date!.getTime()) / (1000 * 60 * 60 * 24)) - 90
            : daysSincePurchase,
        });
      }
      
      // Alert if equipment is old (5+ years)
      if (daysSincePurchase > 1825) {
        alerts.push({
          equipment_id: item.id,
          equipment_name: item.name,
          alert_type: 'aging_equipment',
          message: 'Equipment is aging and may require more frequent maintenance',
          priority: 'medium',
          age_years: Math.floor(daysSincePurchase / 365),
        });
      }
    }
    
    return alerts;
  }
}

export default MaintenanceService;