/**
 * Copyright (c) 2025 Cosmo Exploit Group LLC. All Rights Reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * 
 * This file is part of the Cosmo Exploit Group LLC Weight Management System.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * 
 * This file contains proprietary and confidential information of 
 * Cosmo Exploit Group LLC and may not be copied, distributed, or used
 * in any way without explicit written permission.
 */


export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: number;
          name: string;
          address: string | null;
          contact_email: string | null;
          contact_phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          address?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          address?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      drivers: {
        Row: {
          id: number;
          name: string;
          license_number: string;
          license_expiry: string | null;
          phone: string | null;
          email: string | null;
          status: string;
          company_id: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          license_number: string;
          license_expiry?: string | null;
          phone?: string | null;
          email?: string | null;
          status?: string;
          company_id?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          license_number?: string;
          license_expiry?: string | null;
          phone?: string | null;
          email?: string | null;
          status?: string;
          company_id?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'drivers_company_id_fkey';
            columns: ['company_id'];
            referencedRelation: 'companies';
            referencedColumns: ['id'];
          },
        ];
      };
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          company_id: number | null;
          is_admin: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          company_id?: number | null;
          is_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          company_id?: number | null;
          is_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'users_company_id_fkey';
            columns: ['company_id'];
            referencedRelation: 'companies';
            referencedColumns: ['id'];
          },
        ];
      };
      vehicles: {
        Row: {
          id: number;
          name: string;
          type: string;
          license_plate: string;
          vin: string | null;
          make: string | null;
          model: string | null;
          year: number | null;
          status: string;
          max_weight: string | null;
          company_id: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          type: string;
          license_plate: string;
          vin?: string | null;
          make?: string | null;
          model?: string | null;
          year?: number | null;
          status?: string;
          max_weight?: string | null;
          company_id?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          type?: string;
          license_plate?: string;
          vin?: string | null;
          make?: string | null;
          model?: string | null;
          year?: number | null;
          status?: string;
          max_weight?: string | null;
          company_id?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'vehicles_company_id_fkey';
            columns: ['company_id'];
            referencedRelation: 'companies';
            referencedColumns: ['id'];
          },
        ];
      };
      weights: {
        Row: {
          id: number;
          vehicle_id: number | null;
          weight: string;
          date: string;
          time: string | null;
          driver_id: number | null;
          status: string | null;
          company_id: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          vehicle_id?: number | null;
          weight: string;
          date: string;
          time?: string | null;
          driver_id?: number | null;
          status?: string | null;
          company_id?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          vehicle_id?: number | null;
          weight?: string;
          date?: string;
          time?: string | null;
          driver_id?: number | null;
          status?: string | null;
          company_id?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'weights_company_id_fkey';
            columns: ['company_id'];
            referencedRelation: 'companies';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'weights_driver_id_fkey';
            columns: ['driver_id'];
            referencedRelation: 'drivers';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'weights_vehicle_id_fkey';
            columns: ['vehicle_id'];
            referencedRelation: 'vehicles';
            referencedColumns: ['id'];
          },
        ];
      };
      loads: {
        Row: {
          id: number;
          description: string;
          origin: string;
          destination: string;
          weight: string;
          vehicle_id: number | null;
          driver_id: number | null;
          status: string;
          company_id: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          description: string;
          origin: string;
          destination: string;
          weight: string;
          vehicle_id?: number | null;
          driver_id?: number | null;
          status?: string;
          company_id?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          description?: string;
          origin?: string;
          destination?: string;
          weight?: string;
          vehicle_id?: number | null;
          driver_id?: number | null;
          status?: string;
          company_id?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'loads_company_id_fkey';
            columns: ['company_id'];
            referencedRelation: 'companies';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'loads_driver_id_fkey';
            columns: ['driver_id'];
            referencedRelation: 'drivers';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'loads_vehicle_id_fkey';
            columns: ['vehicle_id'];
            referencedRelation: 'vehicles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
