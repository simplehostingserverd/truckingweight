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

import { app, BrowserWindow, ipcMain, dialog, Menu } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import crypto from 'crypto';
import { nanoid } from 'nanoid';
import { DateTime } from 'luxon';
import Store from 'electron-store';
import { v4 as uuidv4 } from 'uuid';
import forge from 'node-forge';
import { Stripe } from 'stripe';
import axios from 'axios';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize store for settings
const store = new Store({
  name: 'cosmo-license-settings',
  encryptionKey: 'cosmo-exploit-group-license-generator-key',
});

// Initialize Stripe with API key from environment or settings
const initializeStripe = () => {
  const stripeApiKey = process.env.STRIPE_API_KEY || store.get('stripeApiKey');
  if (stripeApiKey) {
    return new Stripe(stripeApiKey);
  }
  return null;
};

let stripe = initializeStripe();

// Generate RSA key pair if not already stored
if (!store.has('privateKey') || !store.has('publicKey')) {
  const rsa = forge.pki.rsa;
  rsa.generateKeyPair({ bits: 2048, workers: 2 }, (err, keypair) => {
    if (err) {
      console.error('Error generating key pair:', err);
      return;
    }

    // Convert to PEM format
    const privateKeyPem = forge.pki.privateKeyToPem(keypair.privateKey);
    const publicKeyPem = forge.pki.publicKeyToPem(keypair.publicKey);

    // Store keys
    store.set('privateKey', privateKeyPem);
    store.set('publicKey', publicKeyPem);

    console.log('New RSA key pair generated and stored');
  });
} else {
  console.log('Using existing RSA key pair');
}

// Create the browser window
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, 'assets/icon.png'),
  });

  // Load the index.html file
  mainWindow.loadFile('index.html');

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  // Create application menu
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Settings',
          click: () => mainWindow.webContents.send('open-settings'),
        },
        { type: 'separator' },
        {
          label: 'Export License Database',
          click: exportLicenseDatabase,
        },
        {
          label: 'Import License Database',
          click: importLicenseDatabase,
        },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'delete' },
        { type: 'separator' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              title: 'About Cosmo License Generator',
              message: 'Cosmo License Generator',
              detail: 'Version 1.0.0\n© 2025 Cosmo Exploit Group LLC\nAll Rights Reserved.',
              buttons: ['OK'],
              icon: path.join(__dirname, 'assets/icon.png'),
            });
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Export license database
function exportLicenseDatabase() {
  dialog
    .showSaveDialog(mainWindow, {
      title: 'Export License Database',
      defaultPath: path.join(app.getPath('documents'), 'cosmo-licenses.json'),
      filters: [{ name: 'JSON Files', extensions: ['json'] }],
    })
    .then(({ filePath }) => {
      if (filePath) {
        const licenses = store.get('licenses') || [];
        const customers = store.get('customers') || [];

        // Create export data with encrypted sensitive information
        const exportData = {
          licenses: licenses.map(license => ({
            ...license,
            key: encrypt(license.key), // Encrypt license keys
          })),
          customers,
          exportDate: new Date().toISOString(),
          version: '1.0',
        };

        fs.writeFileSync(filePath, JSON.stringify(exportData, null, 2));

        dialog.showMessageBox(mainWindow, {
          type: 'info',
          title: 'Export Successful',
          message: 'License database exported successfully.',
          buttons: ['OK'],
        });
      }
    })
    .catch(err => {
      console.error('Error exporting license database:', err);
      dialog.showErrorBox('Export Error', 'Failed to export license database.');
    });
}

// Import license database
function importLicenseDatabase() {
  dialog
    .showOpenDialog(mainWindow, {
      title: 'Import License Database',
      filters: [{ name: 'JSON Files', extensions: ['json'] }],
      properties: ['openFile'],
    })
    .then(({ filePaths }) => {
      if (filePaths && filePaths.length > 0) {
        try {
          const data = JSON.parse(fs.readFileSync(filePaths[0], 'utf8'));

          // Decrypt sensitive information
          if (data.licenses) {
            data.licenses = data.licenses.map(license => ({
              ...license,
              key: decrypt(license.key), // Decrypt license keys
            }));
          }

          // Confirm import
          dialog
            .showMessageBox(mainWindow, {
              type: 'question',
              title: 'Confirm Import',
              message: 'Import License Database',
              detail: `This will replace your current database with ${data.licenses?.length || 0} licenses and ${
                data.customers?.length || 0
              } customers. Continue?`,
              buttons: ['Cancel', 'Import'],
              defaultId: 0,
              cancelId: 0,
            })
            .then(({ response }) => {
              if (response === 1) {
                // Save imported data
                store.set('licenses', data.licenses || []);
                store.set('customers', data.customers || []);

                dialog.showMessageBox(mainWindow, {
                  type: 'info',
                  title: 'Import Successful',
                  message: 'License database imported successfully.',
                  buttons: ['OK'],
                });

                // Refresh UI
                mainWindow.webContents.send('refresh-data');
              }
            });
        } catch (err) {
          console.error('Error importing license database:', err);
          dialog.showErrorBox(
            'Import Error',
            'Failed to import license database. Invalid file format.'
          );
        }
      }
    })
    .catch(err => {
      console.error('Error selecting import file:', err);
      dialog.showErrorBox('Import Error', 'Failed to select import file.');
    });
}

// Encrypt sensitive data
function encrypt(text) {
  try {
    const encryptionKey = store.get('encryptionKey') || generateEncryptionKey();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(encryptionKey, 'hex'), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  } catch (err) {
    console.error('Encryption error:', err);
    return text;
  }
}

// Decrypt sensitive data
function decrypt(text) {
  try {
    const encryptionKey = store.get('encryptionKey');
    if (!encryptionKey) return text;

    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(encryptionKey, 'hex'), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (err) {
    console.error('Decryption error:', err);
    return text;
  }
}

// Generate encryption key
function generateEncryptionKey() {
  const key = crypto.randomBytes(32).toString('hex');
  store.set('encryptionKey', key);
  return key;
}

// App ready event
app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// IPC handlers for license operations
ipcMain.handle('generate-license', async (event, customerData) => {
  try {
    // Generate a unique license key
    const licenseId = nanoid(12).toUpperCase();
    const licenseKey = `CEG-${licenseId}-${nanoid(8).toUpperCase()}`;

    // Create license object
    const license = {
      id: uuidv4(),
      key: licenseKey,
      customerId: customerData.id,
      customerName: customerData.name,
      customerEmail: customerData.email,
      plan: customerData.plan,
      createdAt: new Date().toISOString(),
      expiresAt: DateTime.now()
        .plus({ days: customerData.duration || 365 })
        .toISO(),
      maxUsers: customerData.maxUsers || 10,
      maxTenants: customerData.maxTenants || 1,
      features: customerData.features || ['basic'],
      status: 'active',
      stripeSubscriptionId: customerData.stripeSubscriptionId,
      domains: customerData.domains || [],
      notes: customerData.notes || '',
    };

    // Save license to store
    const licenses = store.get('licenses') || [];
    licenses.push(license);
    store.set('licenses', licenses);

    // Return the license
    return license;
  } catch (error) {
    console.error('Error generating license:', error);
    throw new Error('Failed to generate license');
  }
});

// Get all licenses
ipcMain.handle('get-licenses', () => {
  return store.get('licenses') || [];
});

// Get all customers
ipcMain.handle('get-customers', () => {
  return store.get('customers') || [];
});

// Add customer
ipcMain.handle('add-customer', async (event, customer) => {
  try {
    const customers = store.get('customers') || [];
    const newCustomer = {
      id: uuidv4(),
      ...customer,
      createdAt: new Date().toISOString(),
    };
    customers.push(newCustomer);
    store.set('customers', customers);
    return newCustomer;
  } catch (error) {
    console.error('Error adding customer:', error);
    throw new Error('Failed to add customer');
  }
});

// Revoke license
ipcMain.handle('revoke-license', async (event, licenseId) => {
  try {
    const licenses = store.get('licenses') || [];
    const licenseIndex = licenses.findIndex(license => license.id === licenseId);

    if (licenseIndex === -1) {
      throw new Error('License not found');
    }

    // Update license status
    licenses[licenseIndex].status = 'revoked';
    licenses[licenseIndex].revokedAt = new Date().toISOString();

    // Save updated licenses
    store.set('licenses', licenses);

    // If connected to Stripe, cancel subscription
    if (stripe && licenses[licenseIndex].stripeSubscriptionId) {
      try {
        await stripe.subscriptions.cancel(licenses[licenseIndex].stripeSubscriptionId);
      } catch (stripeError) {
        console.error('Error cancelling Stripe subscription:', stripeError);
      }
    }

    return licenses[licenseIndex];
  } catch (error) {
    console.error('Error revoking license:', error);
    throw new Error('Failed to revoke license');
  }
});

// Save settings
ipcMain.handle('save-settings', async (event, settings) => {
  try {
    // Save settings to store
    Object.entries(settings).forEach(([key, value]) => {
      store.set(key, value);
    });

    // Reinitialize Stripe if API key was updated
    if (settings.stripeApiKey) {
      stripe = new Stripe(settings.stripeApiKey);
    }

    return { success: true };
  } catch (error) {
    console.error('Error saving settings:', error);
    throw new Error('Failed to save settings');
  }
});

// Get settings
ipcMain.handle('get-settings', () => {
  return {
    apiUrl: store.get('apiUrl'),
    stripeApiKey: store.get('stripeApiKey'),
    publicKey: store.get('publicKey'),
    adminEmail: store.get('adminEmail'),
  };
});
