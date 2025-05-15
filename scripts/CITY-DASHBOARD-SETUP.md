# City Dashboard Setup Guide

This guide explains how to set up the city dashboard functionality, including populating the database with Texas cities and creating test users.

## Prerequisites

Before running these scripts, make sure you have:

1. A Supabase project set up
2. The Supabase URL and Service Role Key (not the anon key)
3. Added these to your `.env` file:

```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Setup Steps

### 1. Verify and Create Database Schema

First, run the schema verification script to ensure all necessary tables exist:

```bash
node scripts/verify-city-schema.js
```

This script will:
- Check if the required tables exist (cities, city_users, city_scales, city_permits, city_weigh_tickets, city_violations)
- Create any missing tables with the correct schema
- Set up the necessary relationships between tables

### 2. Populate Texas Cities

Next, run the script to populate Texas cities in the database:

```bash
node scripts/populate-texas-cities.js
```

This script will:
- Add 30 major Texas cities to the database
- Create an example admin user for Houston, Texas
- Skip any cities that already exist in the database

### 3. Test Login

After running the scripts, you can test the city dashboard login with the following credentials:

**Houston Admin User:**
- Email: houston.admin@example.gov
- Password: HoustonAdmin2024!

**Austin Admin User (from existing scripts):**
- Email: cityadmin@example.gov
- Password: CityAdmin123!

## Database Schema

The city dashboard functionality uses the following tables:

### cities
- `id`: Serial primary key
- `name`: City name (e.g., "Houston")
- `state`: State code (e.g., "TX")
- `country`: Country name (default: "USA")
- `address`: City hall address
- `zip_code`: City ZIP code
- `contact_email`: Contact email for the city
- `contact_phone`: Contact phone number
- `logo_url`: URL to the city logo
- `website`: City website URL
- `status`: City status (Active/Inactive)
- `created_at`: Timestamp of creation
- `updated_at`: Timestamp of last update

### city_users
- `id`: UUID primary key (matches Supabase Auth user ID)
- `name`: User's full name
- `email`: User's email address (unique)
- `city_id`: Foreign key to cities table
- `role`: User role (admin, operator, inspector, viewer)
- `is_active`: Whether the user is active
- `created_at`: Timestamp of creation
- `updated_at`: Timestamp of last update

### city_scales
- `id`: Serial primary key
- `name`: Scale name
- `location`: Scale location description
- `latitude`: Latitude coordinates
- `longitude`: Longitude coordinates
- `scale_type`: Type of scale
- `manufacturer`: Scale manufacturer
- `model`: Scale model
- `serial_number`: Scale serial number
- `max_capacity`: Maximum weight capacity
- `precision`: Scale precision
- `calibration_date`: Last calibration date
- `next_calibration_date`: Next scheduled calibration
- `status`: Scale status (Active/Maintenance/Offline)
- `city_id`: Foreign key to cities table
- `created_at`: Timestamp of creation
- `updated_at`: Timestamp of last update

### city_permits
- `id`: Serial primary key
- `permit_number`: Unique permit number
- `company_name`: Company name
- `contact_name`: Contact person name
- `contact_email`: Contact email
- `contact_phone`: Contact phone
- `vehicle_info`: JSON with vehicle details
- `permit_type`: Type of permit
- `max_weight`: Maximum allowed weight
- `dimensions`: JSON with vehicle dimensions
- `start_date`: Permit start date
- `end_date`: Permit end date
- `fee_amount`: Permit fee amount
- `payment_status`: Payment status
- `status`: Permit status
- `approved_by`: Foreign key to city_users table
- `city_id`: Foreign key to cities table
- `created_at`: Timestamp of creation
- `updated_at`: Timestamp of last update

### city_weigh_tickets
- `id`: Serial primary key
- `ticket_number`: Unique ticket number
- `vehicle_info`: JSON with vehicle details
- `driver_name`: Driver's name
- `company_name`: Company name
- `gross_weight`: Gross weight
- `tare_weight`: Tare weight
- `net_weight`: Net weight
- `weigh_date`: Date and time of weighing
- `permit_number`: Associated permit number
- `city_id`: Foreign key to cities table
- `scale_id`: Foreign key to city_scales table
- `recorded_by`: Foreign key to city_users table
- `notes`: Additional notes
- `status`: Ticket status
- `created_at`: Timestamp of creation
- `updated_at`: Timestamp of last update

### city_violations
- `id`: Serial primary key
- `violation_number`: Unique violation number
- `vehicle_info`: JSON with vehicle details
- `driver_name`: Driver's name
- `company_name`: Company name
- `violation_type`: Type of violation
- `description`: Violation description
- `fine_amount`: Fine amount
- `payment_status`: Payment status
- `violation_date`: Date and time of violation
- `location`: Violation location
- `issued_by`: Foreign key to city_users table
- `city_id`: Foreign key to cities table
- `weigh_ticket_id`: Foreign key to city_weigh_tickets table
- `created_at`: Timestamp of creation
- `updated_at`: Timestamp of last update

## User Roles

The city dashboard supports the following user roles:

1. **Admin**: Full access to all features
   - Can manage users, scales, permits, and violations
   - Can view and generate reports
   - Can configure city settings

2. **Operator**: Can record weighings and manage permits
   - Can create and manage weigh tickets
   - Can issue and manage permits
   - Can view reports

3. **Inspector**: Can record weighings and issue violations
   - Can create and manage weigh tickets
   - Can issue and manage violations
   - Can view reports

4. **Viewer**: Read-only access
   - Can view dashboard, scales, permits, and reports
   - Cannot create or modify any records

## Troubleshooting

If you encounter any issues:

1. Check that your Supabase credentials are correct in the `.env` file
2. Ensure you're using the Service Role Key, not the anon key
3. Check the Supabase console for any errors in the SQL queries
4. Verify that the tables were created correctly in the Supabase Table Editor

For any persistent issues, please contact the development team.
