# Dummy Data Generator for TruckingWeight

This directory contains scripts for adding dummy data to your TruckingWeight application database.

## Overview

The `add-dummy-data.js` script adds realistic dummy data to your Supabase database for demonstration and testing purposes. It adds:

- ERP integration connections for each company
- Telematics integration connections for each company
- Additional vehicles (up to 5 per company)
- Additional drivers (up to 5 per company)
- Weight records (up to 20 per company)
- ERP synchronization logs

## Prerequisites

Before running this script, make sure you have:

1. A Supabase project set up
2. The Supabase URL and Service Role Key (not the anon key)
3. Added these to your `.env` file:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

4. Run the `setup-database.js` script first to create the necessary tables and at least one company

## Usage

To run the script:

```bash
node scripts/add-dummy-data.js
```

The script will:

1. Check if you have companies in your database
2. Add ERP integration connections if they don't exist
3. Add telematics integration connections if they don't exist
4. Add vehicles if a company has fewer than 5
5. Add drivers if a company has fewer than 5
6. Add weight records if a company has fewer than 20
7. Add ERP synchronization logs for each ERP connection

## Data Generated

### ERP Connections

The script adds one ERP connection per company, randomly selecting from:

- NetSuite
- QuickBooks
- SAP
- Sage

### Telematics Connections

The script adds one telematics connection per company, randomly selecting from:

- Geotab
- Samsara
- Fleet Complete
- Omnitracs

### Vehicles

The script adds vehicles with:

- Random types (Semi, Box Truck, Flatbed, Tanker, Dump Truck)
- Random makes (Freightliner, Peterbilt, Kenworth, Volvo, Mack, International)
- Random years (2015-2023)
- Appropriate weight limits based on vehicle type

### Drivers

The script adds drivers with:

- Random names
- Random license numbers and expiry dates
- Contact information
- Random status (Active, On Leave, Inactive)

### Weight Records

The script adds weight records with:

- Random dates within the last 30 days
- Weights that are sometimes over the limit
- Appropriate compliance status based on weight
- Association with a random vehicle and driver

### ERP Sync Logs

The script adds 5 sync logs for each ERP connection with:

- Different timestamps (every 2 days back from today)
- Different statuses (success, warning, error)
- Detailed information about the sync operation

## Customization

You can modify the script to add more or different types of data by editing the arrays and parameters in the script.

## Troubleshooting

If you encounter errors:

1. Make sure your Supabase URL and Service Role Key are correct
2. Check that you have run the `setup-database.js` script first
3. Verify that your database tables match the expected schema
4. Check the console output for specific error messages

## Note

This script is designed to be idempotent - it checks if data exists before adding more, so you can run it multiple times without creating duplicate data.
