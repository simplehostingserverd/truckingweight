# Simple Scale Solutions Monitoring

This directory contains the monitoring setup for Simple Scale Solutions, including Prometheus and Grafana.

## Overview

The monitoring stack consists of:

1. **Prometheus** - For metrics collection and storage
2. **Grafana** - For visualization and dashboards

## Getting Started

### Prerequisites

- Docker and Docker Compose installed
- The main application running

### Starting the Monitoring Stack

The monitoring stack is included in the main `docker-compose.yml` file. To start it:

```bash
docker-compose up -d
```

This will start both Prometheus and Grafana alongside the main application.

## Accessing Grafana

Grafana is available at http://localhost:3001

Default credentials:
- Username: `admin`
- Password: `admin`

You will be prompted to change the password on first login.

## Available Dashboards

The following dashboards are available:

1. **Main Dashboard** - Overview of system metrics
2. **API Performance** - API request rates, latencies, and error rates
3. **Weight Statistics** - Statistics about weight measurements
4. **Vehicle Tracking** - Vehicle movement and status

## Data Sources

Grafana is pre-configured with the following data sources:

1. **Prometheus** - For system and application metrics
2. **Supabase** - For database metrics and analytics

## API Endpoints for Grafana

The application provides several API endpoints specifically for Grafana:

- `/api/grafana/weight-stats` - Weight statistics over time
- `/api/grafana/vehicle-stats` - Vehicle statistics
- `/api/grafana/city-stats` - City-specific statistics
- `/api/grafana/company-stats` - Company-specific statistics

## Adding Custom Dashboards

To add a custom dashboard:

1. Log in to Grafana
2. Click on "+" > "Dashboard"
3. Add panels as needed
4. Save the dashboard

## Exporting Dashboards

To export a dashboard:

1. Open the dashboard
2. Click on the gear icon (⚙️) in the top right
3. Select "JSON Model"
4. Copy the JSON or click "Save to file"
5. Save the file in the `monitoring/grafana/dashboards` directory

## Importing Dashboards

To import a dashboard:

1. Log in to Grafana
2. Click on "+" > "Import"
3. Upload the JSON file or paste the JSON content
4. Click "Load"
5. Select the appropriate data source
6. Click "Import"

## Troubleshooting

### Prometheus Not Collecting Metrics

If Prometheus is not collecting metrics:

1. Check if Prometheus is running: `docker-compose ps`
2. Check Prometheus logs: `docker-compose logs prometheus`
3. Verify the Prometheus configuration in `monitoring/prometheus/prometheus.yml`
4. Ensure the application is exposing metrics at `/metrics`

### Grafana Not Showing Data

If Grafana is not showing data:

1. Check if Grafana is running: `docker-compose ps`
2. Check Grafana logs: `docker-compose logs grafana`
3. Verify the data source configuration in Grafana
4. Test the data source connection in Grafana

## Additional Resources

- [Prometheus Documentation](https://prometheus.io/docs/introduction/overview/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Grafana Dashboard Examples](https://grafana.com/grafana/dashboards/)
