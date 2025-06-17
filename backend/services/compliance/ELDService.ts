/**
 * Electronic Logging Device (ELD) Service
 * DOT-compliant Hours of Service tracking and violation detection
 */

import prisma from '../../config/prisma';
import { logger } from '../../utils/logger';

export interface HOSStatus {
  driverId: number;
  currentStatus: 'off_duty' | 'sleeper_berth' | 'driving' | 'on_duty_not_driving';
  availableDriveTime: number; // minutes
  availableOnDutyTime: number; // minutes
  availableWorkShift: number; // minutes
  availableCycle: number; // minutes
  violations: HOSViolation[];
  nextRequiredBreak?: Date;
  nextRequiredRest?: Date;
}

export interface HOSViolation {
  type: 'drive_time' | 'on_duty_time' | 'work_shift' | 'cycle' | 'break_required';
  severity: 'warning' | 'violation';
  description: string;
  timestamp: Date;
  duration?: number; // minutes over limit
}

export interface ELDEvent {
  driverId: number;
  vehicleId: number;
  eventType: 'duty_status_change' | 'location_update' | 'engine_on' | 'engine_off' | 'malfunction';
  dutyStatus?: string;
  location: {
    latitude: number;
    longitude: number;
    description?: string;
  };
  odometer: number;
  engineHours?: number;
  timestamp: Date;
}

export class ELDService {
  // DOT HOS Limits (in minutes)
  private readonly HOS_LIMITS = {
    DAILY_DRIVE_TIME: 11 * 60,        // 11 hours
    DAILY_ON_DUTY_TIME: 14 * 60,      // 14 hours
    WORK_SHIFT_LIMIT: 14 * 60,        // 14 hours from start of shift
    WEEKLY_CYCLE: 70 * 60,            // 70 hours in 8 days
    BREAK_REQUIRED_AFTER: 8 * 60,     // 8 hours driving requires 30-min break
    BREAK_DURATION: 30,               // 30 minutes
    OFF_DUTY_REQUIRED: 10 * 60        // 10 hours off duty
  };

  /**
   * Record a duty status change
   */
  async recordDutyStatusChange(
    driverId: number,
    vehicleId: number,
    newStatus: string,
    location: { latitude: number; longitude: number; description?: string },
    odometer: number
  ): Promise<void> {
    try {
      const now = new Date();

      // Get current active log to end it
      const currentLog = await prisma.hos_logs.findFirst({
        where: {
          driver_id: driverId,
          end_time: null
        },
        orderBy: { start_time: 'desc' }
      });

      // End current log if exists
      if (currentLog) {
        const duration = Math.floor((now.getTime() - currentLog.start_time.getTime()) / 60000);
        await prisma.hos_logs.update({
          where: { id: currentLog.id },
          data: {
            end_time: now,
            duration_minutes: duration,
            odometer_end: odometer
          }
        });
      }

      // Create new log entry
      await prisma.hos_logs.create({
        data: {
          driver_id: driverId,
          vehicle_id: vehicleId,
          log_date: new Date(now.toDateString()),
          duty_status: newStatus,
          start_time: now,
          location_lat: location.latitude,
          location_lng: location.longitude,
          location_description: location.description,
          odometer_start: odometer,
          company_id: await this.getDriverCompanyId(driverId)
        }
      });

      // Check for violations
      await this.checkHOSCompliance(driverId);

      logger.info(`Duty status changed for driver ${driverId} to ${newStatus}`);

    } catch (error) {
      logger.error('Error recording duty status change:', error);
      throw error;
    }
  }

  /**
   * Get current HOS status for a driver
   */
  async getHOSStatus(driverId: number): Promise<HOSStatus> {
    try {
      const today = new Date();
      const eightDaysAgo = new Date(today.getTime() - 8 * 24 * 60 * 60 * 1000);

      // Get logs for the past 8 days
      const logs = await prisma.hos_logs.findMany({
        where: {
          driver_id: driverId,
          log_date: {
            gte: eightDaysAgo
          }
        },
        orderBy: { start_time: 'asc' }
      });

      // Get current status
      const currentLog = logs.find(log => !log.end_time);
      const currentStatus = currentLog?.duty_status || 'off_duty';

      // Calculate available times
      const todayLogs = logs.filter(log => 
        log.log_date.toDateString() === today.toDateString()
      );

      const driveTime = this.calculateDriveTime(todayLogs);
      const onDutyTime = this.calculateOnDutyTime(todayLogs);
      const cycleTime = this.calculateCycleTime(logs);

      // Find work shift start
      const workShiftStart = this.findWorkShiftStart(todayLogs);
      const workShiftDuration = workShiftStart ? 
        Math.floor((Date.now() - workShiftStart.getTime()) / 60000) : 0;

      // Calculate available times
      const availableDriveTime = Math.max(0, this.HOS_LIMITS.DAILY_DRIVE_TIME - driveTime);
      const availableOnDutyTime = Math.max(0, this.HOS_LIMITS.DAILY_ON_DUTY_TIME - onDutyTime);
      const availableWorkShift = Math.max(0, this.HOS_LIMITS.WORK_SHIFT_LIMIT - workShiftDuration);
      const availableCycle = Math.max(0, this.HOS_LIMITS.WEEKLY_CYCLE - cycleTime);

      // Check for violations
      const violations = await this.detectViolations(driverId, logs);

      // Calculate next required breaks/rest
      const nextRequiredBreak = this.calculateNextRequiredBreak(todayLogs);
      const nextRequiredRest = this.calculateNextRequiredRest(todayLogs);

      return {
        driverId,
        currentStatus: currentStatus as any,
        availableDriveTime,
        availableOnDutyTime,
        availableWorkShift,
        availableCycle,
        violations,
        nextRequiredBreak,
        nextRequiredRest
      };

    } catch (error) {
      logger.error('Error getting HOS status:', error);
      throw error;
    }
  }

  /**
   * Check HOS compliance and create violation records
   */
  async checkHOSCompliance(driverId: number): Promise<HOSViolation[]> {
    const hosStatus = await this.getHOSStatus(driverId);
    const violations: HOSViolation[] = [];

    // Check drive time violation
    if (hosStatus.availableDriveTime <= 0) {
      violations.push({
        type: 'drive_time',
        severity: 'violation',
        description: 'Daily 11-hour drive time limit exceeded',
        timestamp: new Date(),
        duration: Math.abs(hosStatus.availableDriveTime)
      });
    }

    // Check on-duty time violation
    if (hosStatus.availableOnDutyTime <= 0) {
      violations.push({
        type: 'on_duty_time',
        severity: 'violation',
        description: 'Daily 14-hour on-duty time limit exceeded',
        timestamp: new Date(),
        duration: Math.abs(hosStatus.availableOnDutyTime)
      });
    }

    // Check work shift violation
    if (hosStatus.availableWorkShift <= 0) {
      violations.push({
        type: 'work_shift',
        severity: 'violation',
        description: '14-hour work shift limit exceeded',
        timestamp: new Date(),
        duration: Math.abs(hosStatus.availableWorkShift)
      });
    }

    // Check cycle violation
    if (hosStatus.availableCycle <= 0) {
      violations.push({
        type: 'cycle',
        severity: 'violation',
        description: '70-hour/8-day cycle limit exceeded',
        timestamp: new Date(),
        duration: Math.abs(hosStatus.availableCycle)
      });
    }

    // Save violations to database
    for (const violation of violations) {
      await this.recordViolation(driverId, violation);
    }

    return violations;
  }

  /**
   * Generate ELD compliance report
   */
  async generateComplianceReport(driverId: number, startDate: Date, endDate: Date) {
    const logs = await prisma.hos_logs.findMany({
      where: {
        driver_id: driverId,
        log_date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { start_time: 'asc' }
    });

    const violations = await prisma.hos_logs.findMany({
      where: {
        driver_id: driverId,
        log_date: {
          gte: startDate,
          lte: endDate
        },
        violation_indicators: {
          not: null
        }
      }
    });

    return {
      driverId,
      reportPeriod: { startDate, endDate },
      totalLogs: logs.length,
      totalViolations: violations.length,
      logs: logs.map(log => ({
        date: log.log_date,
        dutyStatus: log.duty_status,
        startTime: log.start_time,
        endTime: log.end_time,
        duration: log.duration_minutes,
        location: log.location_description,
        violations: log.violation_indicators
      })),
      summary: {
        totalDriveTime: this.calculateDriveTime(logs),
        totalOnDutyTime: this.calculateOnDutyTime(logs),
        averageDailyDriveTime: this.calculateAverageDailyDriveTime(logs),
        complianceRate: this.calculateComplianceRate(logs, violations)
      }
    };
  }

  /**
   * Calculate total drive time from logs
   */
  private calculateDriveTime(logs: any[]): number {
    return logs
      .filter(log => log.duty_status === 'driving')
      .reduce((total, log) => total + (log.duration_minutes || 0), 0);
  }

  /**
   * Calculate total on-duty time from logs
   */
  private calculateOnDutyTime(logs: any[]): number {
    return logs
      .filter(log => log.duty_status !== 'off_duty' && log.duty_status !== 'sleeper_berth')
      .reduce((total, log) => total + (log.duration_minutes || 0), 0);
  }

  /**
   * Calculate cycle time (past 8 days)
   */
  private calculateCycleTime(logs: any[]): number {
    return this.calculateOnDutyTime(logs);
  }

  /**
   * Find work shift start time
   */
  private findWorkShiftStart(todayLogs: any[]): Date | null {
    // Find first on-duty status of the day
    const firstOnDuty = todayLogs.find(log => 
      log.duty_status !== 'off_duty' && log.duty_status !== 'sleeper_berth'
    );
    return firstOnDuty ? firstOnDuty.start_time : null;
  }

  /**
   * Detect HOS violations
   */
  private async detectViolations(driverId: number, logs: any[]): Promise<HOSViolation[]> {
    const violations: HOSViolation[] = [];

    // Check for 8-hour break requirement
    const driveTimeWithoutBreak = this.calculateContinuousDriveTime(logs);
    if (driveTimeWithoutBreak > this.HOS_LIMITS.BREAK_REQUIRED_AFTER) {
      violations.push({
        type: 'break_required',
        severity: 'violation',
        description: '30-minute break required after 8 hours of driving',
        timestamp: new Date()
      });
    }

    return violations;
  }

  /**
   * Calculate continuous drive time without break
   */
  private calculateContinuousDriveTime(logs: any[]): number {
    let continuousDriveTime = 0;
    let lastBreakTime = 0;

    for (const log of logs.reverse()) {
      if (log.duty_status === 'driving') {
        continuousDriveTime += log.duration_minutes || 0;
      } else if (log.duty_status === 'off_duty' || log.duty_status === 'sleeper_berth') {
        if ((log.duration_minutes || 0) >= this.HOS_LIMITS.BREAK_DURATION) {
          continuousDriveTime = 0; // Reset after sufficient break
        }
      }
    }

    return continuousDriveTime;
  }

  /**
   * Calculate next required break time
   */
  private calculateNextRequiredBreak(todayLogs: any[]): Date | null {
    const driveTime = this.calculateDriveTime(todayLogs);
    if (driveTime >= this.HOS_LIMITS.BREAK_REQUIRED_AFTER) {
      return new Date(); // Break required now
    }
    return null;
  }

  /**
   * Calculate next required rest period
   */
  private calculateNextRequiredRest(todayLogs: any[]): Date | null {
    const workShiftStart = this.findWorkShiftStart(todayLogs);
    if (workShiftStart) {
      const restTime = new Date(workShiftStart.getTime() + this.HOS_LIMITS.WORK_SHIFT_LIMIT * 60000);
      return restTime;
    }
    return null;
  }

  /**
   * Record a violation in the database
   */
  private async recordViolation(driverId: number, violation: HOSViolation): Promise<void> {
    // Update the current log with violation indicators
    await prisma.hos_logs.updateMany({
      where: {
        driver_id: driverId,
        end_time: null
      },
      data: {
        violation_indicators: [violation.type]
      }
    });
  }

  /**
   * Calculate average daily drive time
   */
  private calculateAverageDailyDriveTime(logs: any[]): number {
    const dailyTotals = new Map<string, number>();
    
    logs.forEach(log => {
      if (log.duty_status === 'driving') {
        const date = log.log_date.toDateString();
        const current = dailyTotals.get(date) || 0;
        dailyTotals.set(date, current + (log.duration_minutes || 0));
      }
    });

    const total = Array.from(dailyTotals.values()).reduce((sum, time) => sum + time, 0);
    return dailyTotals.size > 0 ? total / dailyTotals.size : 0;
  }

  /**
   * Calculate compliance rate
   */
  private calculateComplianceRate(logs: any[], violations: any[]): number {
    if (logs.length === 0) return 100;
    return ((logs.length - violations.length) / logs.length) * 100;
  }

  /**
   * Get driver's company ID
   */
  private async getDriverCompanyId(driverId: number): Promise<number> {
    const driver = await prisma.drivers.findUnique({
      where: { id: driverId },
      select: { company_id: true }
    });
    return driver?.company_id || 0;
  }
}
