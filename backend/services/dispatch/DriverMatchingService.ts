/**
 * Driver Matching Service
 * Handles intelligent driver-to-load matching based on various criteria
 */

import prisma from '../../config/prisma';
import { logger } from '../../utils/logger';

export interface DriverMatchCriteria {
  loadId: number;
  companyId: number;
  requiredLicenseClass?: string;
  hazmatRequired?: boolean;
  maxDistance?: number;
  preferredExperience?: number;
}

export interface DriverMatch {
  driverId: number;
  vehicleId: number;
  score: number;
  distance?: number;
  experience?: number;
  availability: boolean;
  reasons: string[];
}

export class DriverMatchingService {
  /**
   * Find the best available drivers for a given load
   */
  async findBestDrivers(
    criteria: DriverMatchCriteria,
    limit: number = 5
  ): Promise<DriverMatch[]> {
    try {
      logger.info(`Finding best drivers for load ${criteria.loadId}`);

      // Get available drivers from the company
      const drivers = await prisma.drivers.findMany({
        where: {
          company_id: criteria.companyId,
          status: 'Active'
        },
        include: {
          vehicles: {
            where: {
              status: 'Active'
            }
          }
        }
      });

      const matches: DriverMatch[] = [];

      for (const driver of drivers) {
        if (driver.vehicles.length === 0) continue;

        const vehicle = driver.vehicles[0]; // Use first available vehicle
        const score = await this.calculateDriverScore(driver, criteria);

        matches.push({
          driverId: driver.id,
          vehicleId: vehicle.id,
          score,
          availability: true,
          reasons: [`Driver ${driver.name} available with vehicle ${vehicle.id}`]
        });
      }

      // Sort by score (highest first) and return top matches
      return matches
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

    } catch (error) {
      logger.error('Error finding best drivers:', error);
      throw error;
    }
  }

  /**
   * Calculate a matching score for a driver based on criteria
   */
  private async calculateDriverScore(
    driver: any,
    criteria: DriverMatchCriteria
  ): Promise<number> {
    let score = 100; // Base score

    // Add scoring logic based on various factors
    // This is a simplified implementation
    
    // License validation
    if (criteria.requiredLicenseClass) {
      // Assume all drivers have valid licenses for now
      score += 10;
    }

    // Hazmat certification
    if (criteria.hazmatRequired) {
      // Assume some drivers have hazmat certification
      score += Math.random() > 0.5 ? 20 : -50;
    }

    // Experience factor (simplified)
    const experienceBonus = Math.floor(Math.random() * 30);
    score += experienceBonus;

    return Math.max(0, score);
  }

  /**
   * Check if a driver is available for assignment
   */
  async isDriverAvailable(driverId: number): Promise<boolean> {
    try {
      const driver = await prisma.drivers.findUnique({
        where: { id: driverId },
        include: {
          loads: {
            where: {
              status: {
                in: ['assigned', 'in_transit']
              }
            }
          }
        }
      });

      return driver?.status === 'Active' && (driver.loads?.length || 0) === 0;
    } catch (error) {
      logger.error('Error checking driver availability:', error);
      return false;
    }
  }
}