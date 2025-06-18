/**
 * Analytics Types
 * Comprehensive type definitions for analytics, dashboards, and reporting
 */

// Chart and Visualization Types
export interface ChartVisualizationConfig {
  chartType: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'heatmap';
  showComparison?: boolean;
  stackBy?: string;
  groupBy?: string;
  colorScheme?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  showTooltips?: boolean;
}

export interface GaugeVisualizationConfig {
  gaugeType: 'circular' | 'linear' | 'arc';
  target?: number;
  min?: number;
  max?: number;
  thresholds?: Array<{
    value: number;
    color: string;
    label?: string;
  }>;
}

export interface TableVisualizationConfig {
  sortBy?: string;
  order?: 'asc' | 'desc';
  pageSize?: number;
  showPagination?: boolean;
  columnWidths?: Record<string, number>;
  hiddenColumns?: string[];
}

export interface MapVisualizationConfig {
  mapType: 'roadmap' | 'satellite' | 'hybrid' | 'terrain';
  zoom?: number;
  center?: { lat: number; lng: number };
  showMarkers?: boolean;
  showRoutes?: boolean;
  clusterMarkers?: boolean;
}

export type VisualizationConfig = 
  | ChartVisualizationConfig 
  | GaugeVisualizationConfig 
  | TableVisualizationConfig 
  | MapVisualizationConfig;

// Filter Types
export interface FilterConfig {
  type: 'select' | 'multiselect' | 'date' | 'daterange' | 'number' | 'text';
  field: string;
  label: string;
  options?: Array<{ value: string; label: string }>;
  defaultValue?: unknown;
  required?: boolean;
}

// Widget Data Types
export interface RevenueData {
  current: number[];
  previous?: number[];
  labels: string[];
  target?: number[];
}

export interface FleetUtilizationData {
  value: number;
  target: number;
  status: 'good' | 'warning' | 'critical';
  breakdown?: Array<{
    category: string;
    value: number;
    percentage: number;
  }>;
}

export interface DriverPerformanceData {
  drivers: Array<{
    id: string;
    name: string;
    safetyScore: number;
    efficiency: number;
    miles: number;
    hoursWorked?: number;
    violations?: number;
  }>;
  summary?: {
    averageSafetyScore: number;
    averageEfficiency: number;
    totalMiles: number;
  };
}

export interface SafetyIncidentData {
  incidents: number[];
  severity: Array<'minor' | 'major' | 'critical'>;
  labels: string[];
  breakdown?: Array<{
    type: string;
    count: number;
    trend: 'up' | 'down' | 'stable';
  }>;
}

export type WidgetData = 
  | RevenueData 
  | FleetUtilizationData 
  | DriverPerformanceData 
  | SafetyIncidentData 
  | Record<string, unknown>;

// Analytics Widget Interface
export interface AnalyticsWidget {
  id: string;
  title: string;
  type: 'chart' | 'table' | 'metric' | 'map' | 'gauge';
  category: 'operational' | 'financial' | 'driver' | 'vehicle' | 'route' | 'safety';
  description: string;
  dataSource: string;
  refreshRate: number; // in minutes
  lastUpdated: string;
  config: {
    timeRange: string;
    filters: Record<string, unknown>;
    visualization: VisualizationConfig;
  };
  data: WidgetData;
  insights: string[];
}

// Analytics Dashboard Interface
export interface AnalyticsDashboard {
  id: string;
  name: string;
  description: string;
  widgets: AnalyticsWidget[];
  layout: {
    columns: number;
    rows: number;
  };
  permissions: string[];
  isDefault: boolean;
  createdBy: string;
  createdAt: string;
  lastModified: string;
}

// Report Parameters
export interface ReportParameters {
  includeDriverMetrics?: boolean;
  includeVehicleStatus?: boolean;
  includeFinancials?: boolean;
  includeRevenue?: boolean;
  includeCosts?: boolean;
  includeProfitability?: boolean;
  compareToTarget?: boolean;
  includeIncidents?: boolean;
  includeTraining?: boolean;
  includeCompliance?: boolean;
  includeBenchmarks?: boolean;
  driverId?: string | null;
  timeRange?: string;
  includeComparisons?: boolean;
  includeRecommendations?: boolean;
}

// Analytics Report Interface
export interface AnalyticsReport {
  id: string;
  name: string;
  type: 'scheduled' | 'on_demand' | 'real_time';
  category: string;
  description: string;
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
    recipients: string[];
  };
  parameters: ReportParameters;
  lastRun?: string;
  nextRun?: string;
  status: 'active' | 'paused' | 'error';
}
