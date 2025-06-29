/**
 * Copyright (c) 2025 Cargo Scale Pro Inc. All Rights Reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * 
 * This file is part of the Cargo Scale Pro Inc Weight Management System.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * 
 * This file contains proprietary and confidential information of 
 * Cargo Scale Pro Inc and may not be copied, distributed, or used
 * in any way without explicit written permission.
 * 
 * Designed and built by Michael Anthony Trevino Jr., Lead Full-Stack Developer
 */

import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Default license configuration path
const DEFAULT_LICENSE_PATH = path.join(__dirname, '..', 'config', 'license.json');

/**
 * License Validator Class
 * Handles license validation and feature access control
 */
class LicenseValidator {
  constructor(licenseFilePath = DEFAULT_LICENSE_PATH) {
    this.licenseFilePath = licenseFilePath;
    this.licenseData = null;
    this.isValid = false;
    this.apiUrl = process.env.LICENSE_API_URL || 'https://api.cosmoexploitgroup.com/license';
    this.offlineMode = process.env.LICENSE_OFFLINE_MODE === 'true';
    this.lastValidated = null;
    this.validationInterval = 24 * 60 * 60 * 1000; // 24 hours
  }

  /**
   * Initialize the license validator
   */
  async initialize() {
    try {
      // Load license from file
      await this.loadLicenseFromFile();
      
      // Validate license
      if (this.offlineMode) {
        this.isValid = this.validateOffline();
      } else {
        this.isValid = await this.validateOnline();
      }
      
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
      if (fs.existsSync(this.licenseFilePath)) {
        const licenseFileContent = await fs.promises.readFile(this.licenseFilePath, 'utf8');
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
   * Validate license offline
   */
  validateOffline() {
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
   * Validate license online
   */
  async validateOnline() {
    if (!this.licenseData) return false;
    
    // Skip online validation if we've validated recently
    if (this.lastValidated && (Date.now() - this.lastValidated) < this.validationInterval) {
      return this.isValid;
    }
    
    try {
      const response = await axios.post(this.apiUrl + '/validate', {
        licenseKey: this.licenseData.licenseKey,
        customer: this.licenseData.customer
      });
      
      this.lastValidated = Date.now();
      
      if (response.data && response.data.valid) {
        // Update license data with any changes from server
        if (response.data.license) {
          this.licenseData = { ...this.licenseData, ...response.data.license };
          // Save updated license data
          await this.saveLicenseToFile();
        }
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Online license validation error:', error);
      // Fall back to offline validation if online fails
      return this.validateOffline();
    }
  }

  /**
   * Save license data to file
   */
  async saveLicenseToFile() {
    try {
      await fs.promises.writeFile(
        this.licenseFilePath,
        JSON.stringify(this.licenseData, null, 2),
        'utf8'
      );
      return true;
    } catch (error) {
      console.error('Error saving license file:', error);
      return false;
    }
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
const licenseValidator = new LicenseValidator();

export default licenseValidator;
