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

const path = require('path');
const fs = require('fs');
const Store = require('electron-store');
const { v4: uuidv4 } = require('uuid');
const { nanoid } = require('nanoid');
const { DateTime } = require('luxon');

try {
  console.log('Starting script...');

  // Initialize store
  const store = new Store({
    name: 'cosmo-license-settings',
    encryptionKey: 'cosmo-exploit-group-license-generator-key',
  });

  console.log('Store initialized');

  // Add Horizon Freight Systems as a customer
  const customers = store.get('customers') || [];

  // Check if customer already exists
  const existingCustomer = customers.find(c => c.email === 'admin@horizonfreight.com');

  let customerId;

  if (existingCustomer) {
    console.log('Customer already exists:', existingCustomer);
    customerId = existingCustomer.id;
  } else {
    // Create new customer
    const newCustomer = {
      id: uuidv4(),
      name: 'Horizon Freight Systems',
      email: 'admin@horizonfreight.com',
      company: 'Horizon Freight Systems',
      phone: '555-123-4567',
      createdAt: new Date().toISOString(),
      notes: 'Enterprise customer with API access for demo purposes',
    };

    customers.push(newCustomer);
    store.set('customers', customers);

    customerId = newCustomer.id;
    console.log('Customer added successfully:', newCustomer);
  }

  // Generate license for Horizon Freight Systems
  const licenses = store.get('licenses') || [];

  // Check if license already exists
  const existingLicense = licenses.find(
    l => l.customerName === 'Horizon Freight Systems' && l.status === 'active'
  );

  if (existingLicense) {
    console.log('License already exists:', existingLicense);
    console.log('License Key:', existingLicense.key);
  } else {
    // Generate a unique license key
    const licenseId = nanoid(12).toUpperCase();
    const licenseKey = `CEG-${licenseId}-${nanoid(8).toUpperCase()}`;

    // Create license object
    const license = {
      id: uuidv4(),
      key: licenseKey,
      customerId: customerId,
      customerName: 'Horizon Freight Systems',
      customerEmail: 'admin@horizonfreight.com',
      plan: 'enterprise',
      createdAt: new Date().toISOString(),
      expiresAt: DateTime.now().plus({ days: 365 }).toISO(),
      maxUsers: 50,
      maxTenants: 5,
      features: ['basic', 'advanced', 'api', 'premium'],
      status: 'active',
      domains: ['horizonfreight.com', 'api.horizonfreight.com'],
      notes: 'Enterprise license with API access for demo purposes',
    };

    licenses.push(license);
    store.set('licenses', licenses);

    console.log('License generated successfully:', license);
    console.log('License Key:', licenseKey);
  }
} catch (error) {
  console.error('Error:', error);
}
