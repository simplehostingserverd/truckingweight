# Database Scripts

This directory contains scripts for managing the database schema and data.

## Scripts

### update-schema.js

This script updates the database schema with the new tables and relationships for Phase 2 of the project. It adds:

- Vehicles table
- Drivers table
- Updates the Weights and Loads tables to use references to vehicles and drivers

#### Prerequisites

Before running this script, make sure you have:

1. A Supabase project set up
2. The Supabase URL and Service Role Key (not the anon key)
3. Added these to your `.env` file:

```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

#### Usage

To run the script:

```bash
npm run update-schema
```

The script will:

1. Drop existing tables (if they exist)
2. Create new tables in the correct order to avoid reference errors
3. Apply Row Level Security policies
4. Optionally insert sample data for vehicles and drivers

**Warning**: This script will delete all existing data in the affected tables. Make sure you have a backup if needed.

### push-schema.js

This is the original script for pushing the schema to Supabase. It's recommended to use `update-schema.js` instead for Phase 2 implementation.

#### Usage

```bash
npm run push-schema
```

## Database Schema

The updated database schema includes:

- Companies: Information about trucking companies
- Users: User accounts with authentication details
- Vehicles: Trucks and other vehicles owned by companies
- Drivers: Drivers employed by companies
- Weights: Weight measurements for vehicles
- Loads: Cargo loads being transported

Each table has appropriate Row Level Security policies to ensure data isolation between companies.
