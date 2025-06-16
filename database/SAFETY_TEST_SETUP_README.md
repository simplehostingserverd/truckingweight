# Safety Test Setup Guide

## Problem Fixed

The original error was:
```
ERROR: 23514: new row for relation "vehicle_safety_scores" violates check constraint "vehicle_safety_scores_electrical_system_score_check"
DETAIL: Failing row contains (..., -20, ...)
```

This happened because the safety scoring function could calculate negative scores when multiple electrical failures occurred simultaneously.

## Solution Applied

1. **Updated Safety Scoring Function**: Added `GREATEST(score - penalty, 0)` to ensure scores never go below 0
2. **Added COALESCE**: Handle NULL values in telematics data gracefully
3. **Created Test Data**: Comprehensive scenarios to test all safety features

## Files Created

### 1. `fix_safety_scoring_and_load_test_data.sql`
- Drops and recreates the `calculate_vehicle_safety_score()` function
- Fixes the constraint violation issue
- Adds NULL handling with COALESCE

### 2. `sample_data/telematics_safety_test_data.sql`
- 5 test scenarios covering different safety issues:
  - **Scenario 1**: Brake light failure (triggers audio alert)
  - **Scenario 2**: Critical tire pressure failure
  - **Scenario 3**: Engine overheating emergency
  - **Scenario 4**: Multiple electrical failures (worst case)
  - **Scenario 5**: Normal operation (baseline)

### 3. `run_safety_test_setup.sql`
- Master script that runs everything in correct order
- Provides test results and verification

## How to Run

### Option 1: Run Master Script (Recommended)
```bash
psql -d your_database -f database/run_safety_test_setup.sql
```

### Option 2: Run Individual Files
```bash
# Fix the function first
psql -d your_database -f database/fix_safety_scoring_and_load_test_data.sql

# Load test data
psql -d your_database -f database/sample_data/telematics_safety_test_data.sql
```

## What the Test Data Creates

### Safety Scenarios
1. **Brake Light Failure** - Should trigger emergency audio alert
2. **Tire Pressure Critical** - Blowout risk scenario
3. **Engine Overheating** - Emergency stop required
4. **Multiple Electrical Failures** - Brake lights + turn signals + marker lights failed
5. **Normal Operation** - All systems good (baseline)

### Expected Results
- **Safety Scores**: Calculated for each vehicle (0-100 scale)
- **Critical Alerts**: Generated for dangerous conditions
- **Audio Triggers**: Emergency/critical alerts will trigger audio alerts in the frontend

## Testing Audio Alerts

After running the setup:

1. **Frontend Testing**: 
   - Go to the Telematics page
   - View the Driver Alert System component
   - Critical alerts should trigger audio (siren + speech)

2. **Manual Testing**:
   - Use the `AudioAlertTest` component
   - Test individual audio functions

## Safety Messages

The system will speak these messages:
- **General**: "Driver, please check your safety issues and pull over if required."
- **Brake**: "Driver, brake system alert detected. Please check your brakes and pull over safely if required."
- **Electrical**: "Driver, electrical system alert detected. Please check your lights and pull over safely if required."
- **Tire**: "Driver, tire system alert detected. Please check your tires and pull over safely if required."
- **Engine**: "Driver, engine alert detected. Please check your engine and pull over safely if required."

## Verification Queries

Check if everything worked:

```sql
-- Check safety scores
SELECT vehicle_id, overall_score, electrical_system_score, accident_risk_level 
FROM vehicle_safety_scores 
ORDER BY calculated_at DESC;

-- Check critical alerts
SELECT vehicle_id, severity, category, title 
FROM critical_safety_alerts 
ORDER BY created_at DESC;

-- Check telematics data
SELECT vehicle_id, brake_lights_status, tire_pressure_fl, engine_coolant_temp 
FROM vehicle_telematics_data 
WHERE data_source = 'test_data';
```

## Key Features Tested

✅ **Constraint Fix**: Scores never go below 0
✅ **NULL Handling**: COALESCE prevents NULL errors  
✅ **Audio Alerts**: Critical alerts trigger siren + speech
✅ **Multiple Scenarios**: Brake, tire, engine, electrical failures
✅ **Risk Assessment**: Proper risk level calculation
✅ **Action Recommendations**: Specific actions for each issue

The system is now ready to safely test all telematics safety features! 🚛🔊⚠️
