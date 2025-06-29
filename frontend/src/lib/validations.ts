/**
 * Zod validation schemas for type-safe data validation
 * Copyright (c) 2024 Cosmo Exploit Group LLC
 * 
 * This file is part of the TruckingWeight application.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 * 
 * Written by the development team at Cosmo Exploit Group LLC,
 * and may not be copied, distributed, or modified
 * in any way without explicit written permission.
 */

import { z } from 'zod';

// Equipment validation schema
export const equipmentSchema = z.object({
  id: z.number(),
  name: z.string().min(1, 'Name is required'),
  type: z.string().min(1, 'Type is required'),
  manufacturer: z.string().min(1, 'Manufacturer is required'),
  model: z.string().min(1, 'Model is required'),
  serialNumber: z.string().min(1, 'Serial number is required'),
  purchaseDate: z.string(),
  warrantyExpires: z.string(),
  status: z.enum(['Available', 'In Use', 'Maintenance', 'Out of Service']),
  assignedToVehicle: z.string().optional(),
  assignedToTrailer: z.string().optional(),
  purchasePrice: z.number().min(0, 'Purchase price must be positive'),
  currentValue: z.number().min(0, 'Current value must be positive'),
  lastMaintenanceDate: z.string().optional(),
  nextMaintenanceDue: z.string().optional(),
  notes: z.string().optional(),
});

// Login request validation schema
export const loginRequestSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

// Company validation schema
export const companySchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Company name is required'),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  zip: z.string(),
  phone: z.string(),
  email: z.string().email('Invalid email format'),
  website: z.string().url('Invalid website URL'),
  created_at: z.string(),
  status: z.enum(['active', 'inactive', 'pending']),
  _count: z.object({
    users: z.number(),
    vehicles: z.number(),
    drivers: z.number(),
  }).optional(),
});

// Simple company schema for basic use cases
export const simpleCompanySchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Company name is required'),
});

// Company schema with numeric ID for admin selector
export const adminCompanySchema = z.object({
  id: z.number(),
  name: z.string().min(1, 'Company name is required'),
});

// Type exports for use in components
export type Equipment = z.infer<typeof equipmentSchema>;
export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type Company = z.infer<typeof companySchema>;
export type SimpleCompany = z.infer<typeof simpleCompanySchema>;
export type AdminCompany = z.infer<typeof adminCompanySchema>;

// Utility function to get equipment field value type
export type EquipmentFieldValue = Equipment[keyof Equipment];

// Validation helper functions
export const validateEquipment = (data: unknown) => {
  return equipmentSchema.safeParse(data);
};

export const validateLoginRequest = (data: unknown) => {
  return loginRequestSchema.safeParse(data);
};

export const validateCompany = (data: unknown) => {
  return companySchema.safeParse(data);
};