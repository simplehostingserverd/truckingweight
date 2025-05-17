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

import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('api', {
  // License operations
  generateLicense: customerData => ipcRenderer.invoke('generate-license', customerData),
  getLicenses: () => ipcRenderer.invoke('get-licenses'),
  revokeLicense: licenseId => ipcRenderer.invoke('revoke-license', licenseId),

  // Customer operations
  getCustomers: () => ipcRenderer.invoke('get-customers'),
  addCustomer: customer => ipcRenderer.invoke('add-customer', customer),

  // Settings operations
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: settings => ipcRenderer.invoke('save-settings', settings),

  // Event listeners
  on: (channel, callback) => {
    // Whitelist channels
    const validChannels = ['open-settings', 'refresh-data'];
    if (validChannels.includes(channel)) {
      // Deliberately strip event as it includes `sender`
      ipcRenderer.on(channel, (event, ...args) => callback(...args));
    }
  },

  // Remove event listener
  removeListener: (channel, callback) => {
    const validChannels = ['open-settings', 'refresh-data'];
    if (validChannels.includes(channel)) {
      ipcRenderer.removeListener(channel, callback);
    }
  },
});
