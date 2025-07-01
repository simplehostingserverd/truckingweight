import { PrismaClient } from '@prisma/client';
import { MLService } from './MLService';

interface DriverBehaviorData {
  driverId: number;
  vehicleId: number;
  timestamp: Date;
  speed: number;
  acceleration: number;
  braking: number;
  cornering: number;
  idleTime: number;
  fuelConsumption: number;
  location: { lat: number; lng: number };
  weatherConditions?: string;
  roadType?: string;
}

interface SafetyScore {
  driverId: number;
  overallScore: number;
  speedingScore: number;
  brakingScore: number;
  accelerationScore: number;
  corneringScore: number;
  idlingScore: number;
  hosComplianceScore: number;
  trend: 'improving' | 'declining' | 'stable';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
}

interface SafetyIncident {
  id: string;
  driverId: number;
  vehicleId: number;
  incidentType: 'hard_braking' | 'rapid_acceleration' | 'speeding' | 'sharp_turn' | 'collision' | 'near_miss';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  location: { lat: number; lng: number };
  speed: number;
  description: string;
  weatherConditions?: string;
  roadConditions?: string;
  preventable: boolean;
  cost?: number;
}

interface HOSViolation {
  driverId: number;
  violationType: 'driving_time' | 'duty_time' | 'rest_break' | 'weekly_limit';
  severity: 'warning' | 'violation' | 'critical';
  description: string;
  timestamp: Date;
  potentialFine: number;
  correctionRequired: boolean;
}

interface DriverTrainingRecommendation {
  driverId: number;
  trainingType: 'defensive_driving' | 'fuel_efficiency' | 'hos_compliance' | 'vehicle_inspection' | 'safety_protocols';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  reason: string;
  estimatedCost: number;
  expectedImprovement: string;
  deadline?: Date;
}

export class DriverSafetyService {
  private prisma: PrismaClient;
  private mlService: MLService;

  constructor() {
    this.prisma = new PrismaClient();
    this.mlService = new MLService();
  }

  /**
   * Analyze driver safety and compliance for all drivers in a company
   */
  async analyzeDriverSafety(companyId: number): Promise<{
    safetyScores: SafetyScore[];
    incidents: SafetyIncident[];
    hosViolations: HOSViolation[];
    trainingRecommendations: DriverTrainingRecommendation[];
    companyMetrics: any;
  }> {
    try {
      // Get all drivers for the company
      const drivers = await this.prisma.drivers.findMany({
        where: { company_id: companyId },
        include: {
          hos_logs: {
            where: {
              log_date: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
              }
            },
            orderBy: { start_time: 'desc' }
          },
          dot_inspections: {
            where: {
              inspection_date: {
                gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) // Last year
              }
            },
            orderBy: { inspection_date: 'desc' }
          },
          dvir_reports: {
            where: {
              inspection_date: {
                gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // Last 90 days
              }
            },
            orderBy: { inspection_date: 'desc' }
          }
        }
      });

      const safetyScores: SafetyScore[] = [];
      const incidents: SafetyIncident[] = [];
      const hosViolations: HOSViolation[] = [];
      const trainingRecommendations: DriverTrainingRecommendation[] = [];

      for (const driver of drivers) {
        // Calculate safety score
        const safetyScore = await this.calculateDriverSafetyScore(driver);
        safetyScores.push(safetyScore);

        // Analyze behavior data for incidents
        const driverIncidents = await this.analyzeDriverIncidents(driver.id);
        incidents.push(...driverIncidents);

        // Check HOS compliance
        const violations = await this.analyzeHOSCompliance(driver);
        hosViolations.push(...violations);

        // Generate training recommendations
        const recommendations = await this.generateTrainingRecommendations(driver, safetyScore, driverIncidents);
        trainingRecommendations.push(...recommendations);
      }

      // Calculate company-wide metrics
      const companyMetrics = await this.calculateCompanyMetrics(safetyScores, incidents, hosViolations);

      // Create safety alerts for high-risk drivers
      await this.createSafetyAlerts(safetyScores, companyId);

      return {
        safetyScores: safetyScores.sort((a, b) => a.overallScore - b.overallScore), // Lowest scores first
        incidents: incidents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()),
        hosViolations: hosViolations.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()),
        trainingRecommendations: trainingRecommendations.sort((a, b) => {
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }),
        companyMetrics
      };
    } catch (error) {
      console.error('Error in driver safety analysis:', error);
      throw error;
    }
  }

  /**
   * Calculate comprehensive safety score for a driver
   */
  private async calculateDriverSafetyScore(driver: any): Promise<SafetyScore> {
    // Get simulated behavior data (in real implementation, this would come from telematics)
    const behaviorData = await this.getDriverBehaviorData(driver.id);
    
    // Calculate individual component scores
    const speedingScore = this.calculateSpeedingScore(behaviorData);
    const brakingScore = this.calculateBrakingScore(behaviorData);
    const accelerationScore = this.calculateAccelerationScore(behaviorData);
    const corneringScore = this.calculateCorneringScore(behaviorData);
    const idlingScore = this.calculateIdlingScore(behaviorData);
    const hosComplianceScore = this.calculateHOSComplianceScore(driver.hos_logs);
    
    // Calculate overall score (weighted average)
    const weights = {
      speeding: 0.25,
      braking: 0.20,
      acceleration: 0.15,
      cornering: 0.15,
      idling: 0.10,
      hosCompliance: 0.15
    };
    
    const overallScore = (
      speedingScore * weights.speeding +
      brakingScore * weights.braking +
      accelerationScore * weights.acceleration +
      corneringScore * weights.cornering +
      idlingScore * weights.idling +
      hosComplianceScore * weights.hosCompliance
    );
    
    // Determine trend and risk level
    const trend = await this.calculateScoreTrend(driver.id);
    const riskLevel = this.determineRiskLevel(overallScore, driver.dot_inspections);
    
    // Generate recommendations
    const recommendations = this.generateSafetyRecommendations({
      speedingScore,
      brakingScore,
      accelerationScore,
      corneringScore,
      idlingScore,
      hosComplianceScore
    });
    
    return {
      driverId: driver.id,
      overallScore: Math.round(overallScore),
      speedingScore: Math.round(speedingScore),
      brakingScore: Math.round(brakingScore),
      accelerationScore: Math.round(accelerationScore),
      corneringScore: Math.round(corneringScore),
      idlingScore: Math.round(idlingScore),
      hosComplianceScore: Math.round(hosComplianceScore),
      trend,
      riskLevel,
      recommendations
    };
  }

  /**
   * Get simulated driver behavior data
   */
  private async getDriverBehaviorData(driverId: number): Promise<DriverBehaviorData[]> {
    // In a real implementation, this would fetch from telematics devices
    // For now, we'll simulate behavior data based on driver history
    
    const data: DriverBehaviorData[] = [];
    const now = new Date();
    
    // Generate 30 days of behavior data
    for (let i = 0; i < 30; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      
      // Simulate daily driving behavior
      for (let j = 0; j < 10; j++) {
        data.push({
          driverId,
          vehicleId: 1, // Simplified
          timestamp: new Date(date.getTime() + j * 60 * 60 * 1000),
          speed: 55 + (Math.random() * 20), // 55-75 mph
          acceleration: Math.random() * 2 - 1, // -1 to 1 m/s²
          braking: Math.random() * -2, // 0 to -2 m/s²
          cornering: Math.random() * 0.5, // 0 to 0.5 g
          idleTime: Math.random() * 30, // 0-30 minutes
          fuelConsumption: 6 + (Math.random() * 2), // 6-8 mpg
          location: { lat: 40.7128, lng: -74.0060 }
        });
      }
    }
    
    return data;
  }

  /**
   * Calculate speeding score
   */
  private calculateSpeedingScore(behaviorData: DriverBehaviorData[]): number {
    const speedLimit = 65; // Assumed speed limit
    const speedingEvents = behaviorData.filter(data => data.speed > speedLimit + 5);
    const severeSpeedingEvents = behaviorData.filter(data => data.speed > speedLimit + 15);
    
    let score = 100;
    score -= speedingEvents.length * 2; // -2 points per speeding event
    score -= severeSpeedingEvents.length * 5; // Additional -5 points for severe speeding
    
    return Math.max(0, score);
  }

  /**
   * Calculate braking score
   */
  private calculateBrakingScore(behaviorData: DriverBehaviorData[]): number {
    const hardBrakingEvents = behaviorData.filter(data => data.braking < -1.5);
    const severeHardBrakingEvents = behaviorData.filter(data => data.braking < -2.5);
    
    let score = 100;
    score -= hardBrakingEvents.length * 3; // -3 points per hard braking event
    score -= severeHardBrakingEvents.length * 7; // Additional -7 points for severe hard braking
    
    return Math.max(0, score);
  }

  /**
   * Calculate acceleration score
   */
  private calculateAccelerationScore(behaviorData: DriverBehaviorData[]): number {
    const rapidAccelerationEvents = behaviorData.filter(data => data.acceleration > 1.5);
    const severeAccelerationEvents = behaviorData.filter(data => data.acceleration > 2.5);
    
    let score = 100;
    score -= rapidAccelerationEvents.length * 2; // -2 points per rapid acceleration
    score -= severeAccelerationEvents.length * 5; // Additional -5 points for severe acceleration
    
    return Math.max(0, score);
  }

  /**
   * Calculate cornering score
   */
  private calculateCorneringScore(behaviorData: DriverBehaviorData[]): number {
    const sharpTurnEvents = behaviorData.filter(data => data.cornering > 0.3);
    const severeSharpTurnEvents = behaviorData.filter(data => data.cornering > 0.5);
    
    let score = 100;
    score -= sharpTurnEvents.length * 2; // -2 points per sharp turn
    score -= severeSharpTurnEvents.length * 4; // Additional -4 points for severe sharp turns
    
    return Math.max(0, score);
  }

  /**
   * Calculate idling score
   */
  private calculateIdlingScore(behaviorData: DriverBehaviorData[]): number {
    const totalIdleTime = behaviorData.reduce((sum, data) => sum + data.idleTime, 0);
    const averageIdleTime = totalIdleTime / behaviorData.length;
    
    let score = 100;
    if (averageIdleTime > 15) score -= 20; // Excessive idling
    else if (averageIdleTime > 10) score -= 10;
    else if (averageIdleTime > 5) score -= 5;
    
    return Math.max(0, score);
  }

  /**
   * Calculate HOS compliance score
   */
  private calculateHOSComplianceScore(hosLogs: any[]): number {
    let score = 100;
    
    // Check for violations
    const violationCount = hosLogs.reduce((count, log) => {
      return count + log.violation_indicators.length;
    }, 0);
    
    score -= violationCount * 10; // -10 points per violation
    
    // Check for proper rest breaks
    const drivingLogs = hosLogs.filter(log => log.duty_status === 'driving');
    const longDrivingPeriods = drivingLogs.filter(log => (log.duration_minutes || 0) > 8 * 60);
    
    score -= longDrivingPeriods.length * 5; // -5 points for driving over 8 hours
    
    return Math.max(0, score);
  }

  /**
   * Calculate score trend
   */
  private async calculateScoreTrend(driverId: number): Promise<'improving' | 'declining' | 'stable'> {
    // In a real implementation, this would compare current scores with historical data
    // For now, we'll simulate the trend
    const trends = ['improving', 'declining', 'stable'] as const;
    return trends[Math.floor(Math.random() * trends.length)];
  }

  /**
   * Determine risk level
   */
  private determineRiskLevel(overallScore: number, dotInspections: any[]): 'low' | 'medium' | 'high' | 'critical' {
    // Factor in DOT inspection results
    const recentViolations = dotInspections.filter(inspection => 
      inspection.total_violations > 0 && 
      new Date(inspection.inspection_date) > new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)
    ).length;
    
    let adjustedScore = overallScore - (recentViolations * 5);
    
    if (adjustedScore >= 85) return 'low';
    if (adjustedScore >= 70) return 'medium';
    if (adjustedScore >= 50) return 'high';
    return 'critical';
  }

  /**
   * Generate safety recommendations
   */
  private generateSafetyRecommendations(scores: any): string[] {
    const recommendations: string[] = [];
    
    if (scores.speedingScore < 80) {
      recommendations.push('Enroll in speed management training program');
    }
    
    if (scores.brakingScore < 80) {
      recommendations.push('Practice smooth braking techniques and maintain safe following distance');
    }
    
    if (scores.accelerationScore < 80) {
      recommendations.push('Focus on gradual acceleration to improve fuel efficiency and safety');
    }
    
    if (scores.corneringScore < 80) {
      recommendations.push('Reduce speed when approaching turns and curves');
    }
    
    if (scores.idlingScore < 80) {
      recommendations.push('Minimize idle time to reduce fuel consumption and emissions');
    }
    
    if (scores.hosComplianceScore < 90) {
      recommendations.push('Review HOS regulations and ensure proper rest break compliance');
    }
    
    return recommendations;
  }

  /**
   * Analyze driver incidents
   */
  private async analyzeDriverIncidents(driverId: number): Promise<SafetyIncident[]> {
    // In a real implementation, this would analyze telematics data for incidents
    // For now, we'll simulate some incidents
    
    const incidents: SafetyIncident[] = [];
    const incidentTypes = ['hard_braking', 'rapid_acceleration', 'speeding', 'sharp_turn'] as const;
    
    // Generate random incidents for demonstration
    for (let i = 0; i < Math.floor(Math.random() * 5); i++) {
      const incidentType = incidentTypes[Math.floor(Math.random() * incidentTypes.length)];
      const severity = Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low';
      
      incidents.push({
        id: `incident_${driverId}_${i}`,
        driverId,
        vehicleId: 1,
        incidentType,
        severity: severity as any,
        timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        location: { lat: 40.7128, lng: -74.0060 },
        speed: 45 + Math.random() * 30,
        description: this.getIncidentDescription(incidentType, severity),
        preventable: Math.random() > 0.3,
        cost: severity === 'high' ? 5000 : severity === 'medium' ? 1000 : 0
      });
    }
    
    return incidents;
  }

  /**
   * Get incident description
   */
  private getIncidentDescription(type: string, severity: string): string {
    const descriptions = {
      hard_braking: `${severity} hard braking event detected`,
      rapid_acceleration: `${severity} rapid acceleration event detected`,
      speeding: `${severity} speeding violation detected`,
      sharp_turn: `${severity} sharp turn event detected`
    };
    
    return descriptions[type as keyof typeof descriptions] || 'Safety incident detected';
  }

  /**
   * Analyze HOS compliance
   */
  private async analyzeHOSCompliance(driver: any): Promise<HOSViolation[]> {
    const violations: HOSViolation[] = [];
    
    // Analyze HOS logs for violations
    for (const log of driver.hos_logs) {
      if (log.violation_indicators.length > 0) {
        for (const violation of log.violation_indicators) {
          violations.push({
            driverId: driver.id,
            violationType: this.mapViolationType(violation),
            severity: this.mapViolationSeverity(violation),
            description: `HOS violation: ${violation}`,
            timestamp: log.start_time,
            potentialFine: this.calculatePotentialFine(violation),
            correctionRequired: true
          });
        }
      }
      
      // Check for driving time violations
      if (log.duty_status === 'driving' && (log.duration_minutes || 0) > 11 * 60) {
        violations.push({
          driverId: driver.id,
          violationType: 'driving_time',
          severity: 'violation',
          description: 'Exceeded 11-hour driving limit',
          timestamp: log.start_time,
          potentialFine: 2750,
          correctionRequired: true
        });
      }
    }
    
    return violations;
  }

  /**
   * Map violation type
   */
  private mapViolationType(violation: string): 'driving_time' | 'duty_time' | 'rest_break' | 'weekly_limit' {
    if (violation.includes('driving')) return 'driving_time';
    if (violation.includes('duty')) return 'duty_time';
    if (violation.includes('rest') || violation.includes('break')) return 'rest_break';
    return 'weekly_limit';
  }

  /**
   * Map violation severity
   */
  private mapViolationSeverity(violation: string): 'warning' | 'violation' | 'critical' {
    if (violation.includes('critical') || violation.includes('severe')) return 'critical';
    if (violation.includes('warning')) return 'warning';
    return 'violation';
  }

  /**
   * Calculate potential fine
   */
  private calculatePotentialFine(violation: string): number {
    const fines = {
      driving_time: 2750,
      duty_time: 2750,
      rest_break: 1100,
      weekly_limit: 2750
    };
    
    const violationType = this.mapViolationType(violation);
    return fines[violationType] || 1100;
  }

  /**
   * Generate training recommendations
   */
  private async generateTrainingRecommendations(
    driver: any,
    safetyScore: SafetyScore,
    incidents: SafetyIncident[]
  ): Promise<DriverTrainingRecommendation[]> {
    const recommendations: DriverTrainingRecommendation[] = [];
    
    // Defensive driving training
    if (safetyScore.overallScore < 70 || incidents.filter(i => i.severity === 'high').length > 0) {
      recommendations.push({
        driverId: driver.id,
        trainingType: 'defensive_driving',
        priority: safetyScore.overallScore < 50 ? 'urgent' : 'high',
        reason: 'Low safety score and high-severity incidents detected',
        estimatedCost: 500,
        expectedImprovement: '15-20% improvement in safety score',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });
    }
    
    // Fuel efficiency training
    if (safetyScore.idlingScore < 80 || safetyScore.accelerationScore < 80) {
      recommendations.push({
        driverId: driver.id,
        trainingType: 'fuel_efficiency',
        priority: 'medium',
        reason: 'Poor idling and acceleration scores affecting fuel efficiency',
        estimatedCost: 300,
        expectedImprovement: '10-15% improvement in fuel efficiency'
      });
    }
    
    // HOS compliance training
    if (safetyScore.hosComplianceScore < 90) {
      recommendations.push({
        driverId: driver.id,
        trainingType: 'hos_compliance',
        priority: 'high',
        reason: 'HOS violations detected',
        estimatedCost: 250,
        expectedImprovement: 'Reduced violation risk and potential fines',
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      });
    }
    
    return recommendations;
  }

  /**
   * Calculate company-wide metrics
   */
  private async calculateCompanyMetrics(safetyScores: SafetyScore[], incidents: SafetyIncident[], violations: HOSViolation[]) {
    const averageScore = safetyScores.reduce((sum, score) => sum + score.overallScore, 0) / safetyScores.length;
    const highRiskDrivers = safetyScores.filter(score => score.riskLevel === 'high' || score.riskLevel === 'critical').length;
    const totalIncidents = incidents.length;
    const totalViolations = violations.length;
    const estimatedInsuranceSavings = this.calculateInsuranceSavings(averageScore, totalIncidents);
    
    return {
      averageSafetyScore: Math.round(averageScore),
      highRiskDriverCount: highRiskDrivers,
      totalIncidents,
      totalViolations,
      estimatedInsuranceSavings,
      complianceRate: Math.round(((safetyScores.length - violations.length) / safetyScores.length) * 100),
      recommendations: [
        averageScore < 75 ? 'Implement company-wide safety training program' : null,
        highRiskDrivers > safetyScores.length * 0.2 ? 'Focus on high-risk driver coaching' : null,
        totalViolations > 5 ? 'Review HOS compliance procedures' : null
      ].filter(Boolean)
    };
  }

  /**
   * Calculate insurance savings
   */
  private calculateInsuranceSavings(averageScore: number, incidentCount: number): number {
    // Higher safety scores and fewer incidents lead to insurance savings
    const baseInsuranceCost = 50000; // Annual insurance cost
    const scoreMultiplier = averageScore / 100;
    const incidentPenalty = incidentCount * 1000;
    
    const adjustedCost = baseInsuranceCost * (2 - scoreMultiplier) + incidentPenalty;
    return Math.max(0, baseInsuranceCost - adjustedCost);
  }

  /**
   * Create safety alerts for high-risk drivers
   */
  private async createSafetyAlerts(safetyScores: SafetyScore[], companyId: number) {
    const highRiskDrivers = safetyScores.filter(score => 
      score.riskLevel === 'high' || score.riskLevel === 'critical'
    );
    
    for (const driver of highRiskDrivers) {
      await this.prisma.predictive_alerts.create({
        data: {
          driver_id: driver.driverId,
          alert_type: `Driver Safety Risk - ${driver.riskLevel.toUpperCase()}`,
          risk_score: 100 - driver.overallScore,
          description: `Driver safety score: ${driver.overallScore}/100. Risk level: ${driver.riskLevel}. Immediate attention required.`,
          recommendation: driver.recommendations.join('; '),
          acknowledged: false
        }
      });
    }
  }

  /**
   * Get driver safety analytics
   */
  async getDriverSafetyAnalytics(companyId: number, dateRange: { start: Date; end: Date }) {
    const analysis = await this.analyzeDriverSafety(companyId);
    
    return {
      summary: {
        totalDrivers: analysis.safetyScores.length,
        averageSafetyScore: analysis.companyMetrics.averageSafetyScore,
        highRiskDrivers: analysis.companyMetrics.highRiskDriverCount,
        totalIncidents: analysis.companyMetrics.totalIncidents,
        complianceRate: analysis.companyMetrics.complianceRate
      },
      trends: {
        improvingDrivers: analysis.safetyScores.filter(s => s.trend === 'improving').length,
        decliningDrivers: analysis.safetyScores.filter(s => s.trend === 'declining').length,
        stableDrivers: analysis.safetyScores.filter(s => s.trend === 'stable').length
      },
      costImpact: {
        estimatedInsuranceSavings: analysis.companyMetrics.estimatedInsuranceSavings,
        potentialFines: analysis.hosViolations.reduce((sum, v) => sum + v.potentialFine, 0),
        incidentCosts: analysis.incidents.reduce((sum, i) => sum + (i.cost || 0), 0)
      },
      recommendations: analysis.companyMetrics.recommendations
    };
  }
}