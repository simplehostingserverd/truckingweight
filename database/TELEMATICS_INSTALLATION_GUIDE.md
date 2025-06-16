# 🚛 Telematics Database Installation Guide

## Overview
This guide will help you install the comprehensive telematics database schema that supports:
- **Top 5 Mechanical Issue Monitoring** (Brake, Tire, Engine, Electrical, Transmission)
- **Real-time Safety Alerts** with accident prevention focus
- **3rd Party Telematics Integration** (Geotab, Samsara, Fleet Complete, etc.)
- **Predictive Maintenance** and failure prevention
- **Live Driver Alerts** and emergency notifications

## 📋 Prerequisites

1. **PostgreSQL Database** (version 12 or higher)
2. **Existing base tables** (companies, users, vehicles, drivers, trailers)
3. **Supabase setup** (if using Supabase for authentication)

## 🚀 Installation Steps

### Step 1: Install Main Telematics Tables
Run the corrected SQL file that creates all tables, indexes, and triggers:

```sql
-- Connect to your database and run:
\i database/migrations/create_telematics_tables_fixed.sql
```

### Step 2: Install Security Policies and Views
```sql
-- Add RLS policies and useful views:
\i database/migrations/telematics_security_and_views.sql
```

### Step 3: Install Advanced Functions
```sql
-- Add safety scoring and alert functions:
\i database/migrations/telematics_functions.sql
```

### Step 4: Load Sample Data (Optional)
```sql
-- Load test data to verify installation:
\i database/sample_data/telematics_sample_data.sql
```

## 📊 Tables Created

### Core Telematics Tables
- **`telematics_providers`** - 3rd party integration configs
- **`vehicle_telematics_data`** - Real-time vehicle data
- **`trailer_telematics_data`** - Trailer-specific monitoring
- **`critical_safety_alerts`** - Safety alerts and notifications
- **`vehicle_safety_scores`** - Calculated safety scores (0-100)
- **`driver_alert_history`** - Driver notification tracking
- **`maintenance_predictions`** - Predictive maintenance
- **`dashboard_vehicle_status`** - Real-time dashboard data

### Enhanced Existing Tables
- **`vehicles`** - Added telematics device columns

## 🔧 Key Features Enabled

### 1. Critical Safety Monitoring
- **Brake System**: Air pressure, pad wear, warning lights
- **Electrical/Lighting**: Brake lights, turn signals, marker lights
- **Tire System**: Pressure, temperature, tread depth
- **Engine Cooling**: Temperature, coolant level
- **Transmission**: Fluid level, temperature, gear slipping

### 2. Real-time Alerts
- **Emergency Alerts**: Brake light failure, engine overheating
- **Critical Alerts**: Low tire pressure, brake issues
- **Warning Alerts**: Maintenance reminders
- **Driver Notifications**: In-cab alerts with acknowledgment

### 3. Safety Scoring
- **Overall Score**: 0-100 vehicle safety rating
- **Risk Levels**: Low/Medium/High/Critical
- **System Scores**: Individual scores for each critical system
- **Predictive Maintenance**: Failure prevention recommendations

### 4. 3rd Party Integration
- **Geotab**: Industry-leading fleet management
- **Samsara**: AI-powered insights and dash cams
- **Fleet Complete**: Comprehensive analytics
- **Verizon Connect**: Enterprise connectivity
- **Custom Hardware**: Direct OBD-II and CAN bus

## 📈 Performance Features

### Optimized Indexes
- Vehicle + timestamp indexes for fast queries
- Safety alert indexes by severity
- Dashboard status indexes for real-time updates
- Location-based indexes for mapping

### Real-time Views
- **`current_vehicle_status`** - Live fleet overview
- **`critical_safety_dashboard`** - Safety metrics
- **`driver_safety_performance`** - Driver scores
- **`maintenance_priority_view`** - Vehicles needing attention
- **`real_time_alerts`** - Active alerts

### Automated Functions
- **`calculate_vehicle_safety_score()`** - Real-time scoring
- **`create_critical_safety_alert()`** - Alert generation
- **Trigger-based monitoring** - Automatic alert creation

## 🔒 Security Features

### Row Level Security (RLS)
- Company-based data isolation
- User permission-based access
- Secure telematics provider data

### Data Protection
- Encrypted API keys and credentials
- Audit trails for all alerts
- Driver acknowledgment tracking

## 🧪 Testing the Installation

### 1. Verify Tables Created
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_name LIKE '%telematics%' 
   OR table_name LIKE '%safety%' 
   OR table_name LIKE '%maintenance%';
```

### 2. Check Sample Data (if loaded)
```sql
-- Check telematics data
SELECT COUNT(*) FROM vehicle_telematics_data;

-- Check safety alerts
SELECT severity, COUNT(*) 
FROM critical_safety_alerts 
GROUP BY severity;

-- Check dashboard status
SELECT status, COUNT(*) 
FROM dashboard_vehicle_status 
GROUP BY status;
```

### 3. Test Safety Scoring Function
```sql
-- Calculate safety score for a vehicle
SELECT * FROM calculate_vehicle_safety_score(
    (SELECT id FROM vehicles LIMIT 1)
);
```

### 4. View Real-time Dashboard
```sql
-- Check current vehicle status
SELECT * FROM current_vehicle_status LIMIT 5;

-- Check critical safety dashboard
SELECT * FROM critical_safety_dashboard;
```

## 🚨 Critical Safety Features

### Accident Prevention Focus
The system specifically monitors the **top 5 mechanical issues** that cause truck accidents:

1. **Brake Failures** - #1 cause of accidents
2. **Lighting Failures** - #2 cause of accidents (brake lights, turn signals)
3. **Tire Problems** - Blowouts and pressure issues
4. **Engine Overheating** - Breakdown prevention
5. **Transmission Issues** - Mechanical failure prevention

### Real-time Monitoring
- **5-30 second data updates** from telematics devices
- **Immediate alerts** for critical safety issues
- **Predictive maintenance** to prevent failures
- **Driver notifications** with emergency contact options

## 📞 Support

If you encounter any issues during installation:

1. **Check Prerequisites**: Ensure all base tables exist
2. **Review Error Messages**: Most errors are related to missing dependencies
3. **Verify Permissions**: Ensure database user has CREATE privileges
4. **Test Incrementally**: Run each migration file separately

## 🎯 Next Steps

After successful installation:

1. **Configure Telematics Providers**: Add your 3rd party integrations
2. **Set Up Real-time Data Feeds**: Connect your telematics devices
3. **Configure Alert Thresholds**: Customize safety parameters
4. **Train Users**: Familiarize staff with the safety monitoring system
5. **Test Emergency Procedures**: Verify alert delivery and response

This comprehensive telematics system will significantly improve fleet safety by providing real-time monitoring of the mechanical issues that cause the most truck accidents, with immediate alerts to prevent accidents before they happen.
