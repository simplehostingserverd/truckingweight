/**
 * Copyright (c) 2025 Cosmo Exploit Group LLC. All Rights Reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * 
 * This file is part of the Cosmo Exploit Group LLC Weight Management System.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * 
 * This file contains proprietary and confidential information of 
 * Cosmo Exploit Group LLC and may not be copied, distributed, or used
 * in any way without explicit written permission.
 * 
 * Designed and built by Michael Anthony Trevino Jr., Lead Full-Stack Developer
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// License file path
const LICENSE_FILE_PATH = path.join(__dirname, '..', 'config', 'license.json');

/**
 * License Manager Class
 * Handles license validation and feature access control
 */
class LicenseManager {
  constructor() {
    this.licenseData = null;
    this.isValid = false;
    this.lastValidated = null;
  }

  /**
   * Initialize the license manager
   */
  async initialize() {
    try {
      // Load license from file
      await this.loadLicenseFromFile();
      
      // Validate license
      this.isValid = this.validateLicense();
      
      return this.isValid;
    } catch (error) {
      console.error('License validation error:', error);
      return false;
    }
  }

  /**
   * Load license data from file
   */
  async loadLicenseFromFile() {
    try {
      if (fs.existsSync(LICENSE_FILE_PATH)) {
        const licenseFileContent = await fs.promises.readFile(LICENSE_FILE_PATH, 'utf8');
        this.licenseData = JSON.parse(licenseFileContent);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error loading license file:', error);
      return false;
    }
  }

  /**
   * Validate license
   */
  validateLicense() {
    if (!this.licenseData) return false;
    
    const { licenseKey, expiresAt } = this.licenseData;
    
    // Check if license key exists
    if (!licenseKey) return false;
    
    // Check if license has expired
    if (expiresAt && new Date(expiresAt) < new Date()) return false;
    
    // Basic format validation
    const keyPattern = /^CEG-[A-Z0-9_]{12}-[A-Z0-9]{8}$/;
    if (!keyPattern.test(licenseKey)) return false;
    
    return true;
  }

  /**
   * Check if a specific feature is available in the current license
   */
  hasFeature(featureName) {
    if (!this.isValid || !this.licenseData) return false;
    
    return this.licenseData.features && 
           this.licenseData.features.includes(featureName);
  }

  /**
   * Get license information
   */
  getLicenseInfo() {
    return {
      isValid: this.isValid,
      licenseKey: this.licenseData?.licenseKey,
      customer: this.licenseData?.customer,
      plan: this.licenseData?.plan,
      expiresAt: this.licenseData?.expiresAt,
      features: this.licenseData?.features || [],
      maxUsers: this.licenseData?.maxUsers,
      maxTenants: this.licenseData?.maxTenants
    };
  }
}

// Create singleton instance
const licenseManager = new LicenseManager();

export default licenseManager;
