# Cosmo License Generator Guide

## Overview

The Cosmo License Generator is a tool for creating and managing licenses for the Cosmo Exploit Group LLC Weight Management System. This guide will help you understand how to use the license generator to create, manage, and distribute licenses to customers.

## Getting Started

### Installation

1. Make sure you have Node.js (v21 or later) installed on your system
2. Clone the repository or extract the license generator files
3. Navigate to the license-generator directory
4. Install dependencies:
   ```
   npm install
   ```

### Running the License Generator

To start the license generator application:

```
npm start
```

Or directly with Electron:

```
npx electron .
```

## Using the License Generator

### Main Interface

The license generator has three main tabs:
- **Licenses**: View, generate, and manage licenses
- **Customers**: Add and manage customer information
- **Settings**: Configure the license generator

### Adding a New Customer

1. Click on the "Customers" tab
2. Click the "Add New Customer" button
3. Fill in the customer details:
   - Name
   - Email
   - Company
   - Phone (optional)
   - Stripe Customer ID (optional)
   - Notes (optional)
4. Click "Add Customer"

### Generating a New License

#### Method 1: From the Licenses Tab

1. Click on the "Licenses" tab
2. Click the "Generate New License" button
3. Select a customer from the dropdown
4. Choose a plan (Basic, Professional, Enterprise, Custom)
5. Set the license duration (in days)
6. Configure max users and tenants
7. Select features (Advanced Features, API Access, Premium Support)
8. Add authorized domains (optional)
9. Add notes (optional)
10. Click "Generate License"

#### Method 2: From the Customers Tab

1. Click on the "Customers" tab
2. Find the customer you want to generate a license for
3. Click the key icon in the Actions column
4. Follow steps 4-10 from Method 1

### Revoking a License

1. Click on the "Licenses" tab
2. Find the license you want to revoke
3. Click the X icon in the Actions column
4. Confirm the revocation

### Exporting/Importing License Database

To export the license database:
1. Click on "File" in the menu bar
2. Select "Export License Database"
3. Choose a location to save the file

To import a license database:
1. Click on "File" in the menu bar
2. Select "Import License Database"
3. Select the database file
4. Confirm the import

## Command Line Usage

### Adding a Customer via Command Line

Create a script file (e.g., `add-customer.cjs`) with the following content:

```javascript
const Store = require('electron-store');
const { v4: uuidv4 } = require('uuid');

// Initialize store
const store = new Store({
  name: 'cosmo-license-settings',
  encryptionKey: 'cosmo-exploit-group-license-generator-key',
});

// Add customer
const customers = store.get('customers') || [];
const newCustomer = {
  id: uuidv4(),
  name: 'Customer Name',
  email: 'customer@example.com',
  company: 'Company Name',
  phone: '555-123-4567',
  createdAt: new Date().toISOString(),
  notes: 'Notes about the customer',
};

customers.push(newCustomer);
store.set('customers', customers);

console.log('Customer added successfully:', newCustomer);
```

Run the script:

```
node add-customer.cjs
```

### Generating a License via Command Line

Create a script file (e.g., `generate-license.cjs`) with the following content:

```javascript
const Store = require('electron-store');
const { v4: uuidv4 } = require('uuid');
const { nanoid } = require('nanoid');
const { DateTime } = require('luxon');

// Initialize store
const store = new Store({
  name: 'cosmo-license-settings',
  encryptionKey: 'cosmo-exploit-group-license-generator-key',
});

// Get customer
const customers = store.get('customers') || [];
const customer = customers.find(c => c.email === 'customer@example.com');

if (!customer) {
  console.error('Customer not found');
  process.exit(1);
}

// Generate license
const licenses = store.get('licenses') || [];
const licenseId = nanoid(12).toUpperCase();
const licenseKey = `CEG-${licenseId}-${nanoid(8).toUpperCase()}`;

const license = {
  id: uuidv4(),
  key: licenseKey,
  customerId: customer.id,
  customerName: customer.name,
  customerEmail: customer.email,
  plan: 'enterprise',
  createdAt: new Date().toISOString(),
  expiresAt: DateTime.now().plus({ days: 365 }).toISO(),
  maxUsers: 50,
  maxTenants: 5,
  features: ['basic', 'advanced', 'api', 'premium'],
  status: 'active',
  domains: ['example.com', 'api.example.com'],
  notes: 'License notes',
};

licenses.push(license);
store.set('licenses', licenses);

console.log('License generated successfully:', license);
console.log('License Key:', licenseKey);
```

Run the script:

```
node generate-license.cjs
```

## Integrating Licenses with the Application

### Configuration File

Create a `license.json` file in the application's config directory:

```json
{
  "licenseKey": "YOUR-LICENSE-KEY",
  "customer": {
    "name": "Customer Name",
    "email": "customer@example.com",
    "company": "Company Name"
  },
  "plan": "enterprise",
  "features": ["basic", "advanced", "api", "premium"],
  "maxUsers": 50,
  "maxTenants": 5,
  "expiresAt": "2026-05-17T03:42:28.100-05:00"
}
```

### License Validation

Use the provided `licenseValidator.js` utility to validate licenses in your application:

```javascript
import licenseValidator from './utils/licenseValidator.js';

// Initialize license
await licenseValidator.initialize();

// Check if license is valid
if (licenseValidator.isValid) {
  // License is valid
  console.log('License is valid');
  
  // Check for specific features
  if (licenseValidator.hasFeature('api')) {
    // Enable API access
  }
} else {
  // License is invalid
  console.log('License is invalid');
}
```

## Troubleshooting

### License Not Found

If the application cannot find the license file:
1. Verify that the license.json file exists in the config directory
2. Check file permissions
3. Ensure the file is properly formatted JSON

### Invalid License

If the license is invalid:
1. Verify the license key format (should be CEG-XXXXXXXXXXXX-XXXXXXXX)
2. Check if the license has expired
3. Ensure the customer information matches

### Database Issues

If you encounter issues with the license database:
1. Check if the electron-store database file exists
2. Try exporting and reimporting the database
3. Ensure you have proper permissions to read/write the database file

## Support

For support with the license generator, contact:
- Email: support@cosmoexploitgroup.com
- Phone: 555-COSMO-EG
