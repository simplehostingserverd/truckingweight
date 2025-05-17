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
      app_settings: {
        Row: {
          created_at: string;
          id: string;
          key: string;
          updated_at: string;
          value: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          key: string;
          updated_at?: string;
          value: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          key?: string;
          updated_at?: string;
          value?: string;
        };
        Relationships: [];
      };
      companies: {
        Row: {
          address: string | null;
          city: string | null;
          created_at: string;
          email: string | null;
          id: string;
          name: string;
          phone: string | null;
          state: string | null;
          status: string;
          updated_at: string;
          user_id: string | null;
          zip: string | null;
        };
        Insert: {
          address?: string | null;
          city?: string | null;
          created_at?: string;
          email?: string | null;
          id?: string;
          name: string;
          phone?: string | null;
          state?: string | null;
          status?: string;
          updated_at?: string;
          user_id?: string | null;
          zip?: string | null;
        };
        Update: {
          address?: string | null;
          city?: string | null;
          created_at?: string;
          email?: string | null;
          id?: string;
          name?: string;
          phone?: string | null;
          state?: string | null;
          status?: string;
          updated_at?: string;
          user_id?: string | null;
          zip?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'companies_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      drivers: {
        Row: {
          company_id: string | null;
          created_at: string;
          email: string | null;
          id: string;
          license_expiry: string | null;
          license_number: string;
          name: string;
          phone: string | null;
          status: string;
          updated_at: string;
        };
        Insert: {
          company_id?: string | null;
          created_at?: string;
          email?: string | null;
          id?: string;
          license_expiry?: string | null;
          license_number: string;
          name: string;
          phone?: string | null;
          status?: string;
          updated_at?: string;
        };
        Update: {
          company_id?: string | null;
          created_at?: string;
          email?: string | null;
          id?: string;
          license_expiry?: string | null;
          license_number?: string;
          name?: string;
          phone?: string | null;
          status?: string;
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
      loads: {
        Row: {
          company_id: string | null;
          created_at: string;
          destination: string;
          driver_id: string | null;
          id: string;
          origin: string;
          status: string;
          updated_at: string;
          vehicle_id: string | null;
          weight: number | null;
        };
        Insert: {
          company_id?: string | null;
          created_at?: string;
          destination: string;
          driver_id?: string | null;
          id?: string;
          origin: string;
          status?: string;
          updated_at?: string;
          vehicle_id?: string | null;
          weight?: number | null;
        };
        Update: {
          company_id?: string | null;
          created_at?: string;
          destination?: string;
          driver_id?: string | null;
          id?: string;
          origin?: string;
          status?: string;
          updated_at?: string;
          vehicle_id?: string | null;
          weight?: number | null;
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
      vehicles: {
        Row: {
          company_id: string | null;
          created_at: string;
          id: string;
          license_plate: string;
          make: string;
          model: string;
          status: string;
          type: string;
          updated_at: string;
          vin: string | null;
          year: number | null;
        };
        Insert: {
          company_id?: string | null;
          created_at?: string;
          id?: string;
          license_plate: string;
          make: string;
          model: string;
          status?: string;
          type: string;
          updated_at?: string;
          vin?: string | null;
          year?: number | null;
        };
        Update: {
          company_id?: string | null;
          created_at?: string;
          id?: string;
          license_plate?: string;
          make?: string;
          model?: string;
          status?: string;
          type?: string;
          updated_at?: string;
          vin?: string | null;
          year?: number | null;
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
          created_at: string;
          id: string;
          load_id: string | null;
          location: string | null;
          timestamp: string | null;
          updated_at: string;
          vehicle_id: string | null;
          weight: number;
        };
        Insert: {
          created_at?: string;
          id?: string;
          load_id?: string | null;
          location?: string | null;
          timestamp?: string | null;
          updated_at?: string;
          vehicle_id?: string | null;
          weight: number;
        };
        Update: {
          created_at?: string;
          id?: string;
          load_id?: string | null;
          location?: string | null;
          timestamp?: string | null;
          updated_at?: string;
          vehicle_id?: string | null;
          weight?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'weights_load_id_fkey';
            columns: ['load_id'];
            referencedRelation: 'loads';
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
