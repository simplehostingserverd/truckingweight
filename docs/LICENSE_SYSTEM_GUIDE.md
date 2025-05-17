# Cosmo Exploit Group LLC License System Guide

## Overview

This guide provides comprehensive information on the license system for the Cosmo Exploit Group LLC Weight Management System. It covers how to generate, validate, and manage licenses for the application.

## License System Components

The license system consists of the following components:

1. **License Generator**: A desktop application for creating and managing licenses
2. **License File**: A JSON file containing license information
3. **License Manager**: A utility for validating and checking license features
4. **License API**: (Future) A RESTful API for online license validation

## License Generator

The License Generator is an Electron-based desktop application that allows administrators to create and manage licenses for customers.

### Running the License Generator

```bash
cd license-generator
npm start
```

### Using the License Generator

The License Generator provides a user interface for:
- Adding customers
- Generating licenses
- Revoking licenses
- Managing license settings

For detailed instructions, see the [License Generator Guide](../license-generator/GUIDE.md).

### Command Line Usage

You can also use the License Generator from the command line:

```bash
# Add a customer
cd license-generator
node add-customer.cjs

# Generate a license
node generate-license.cjs
```

## License File

The license file (`config/license.json`) contains all the information needed to validate and use a license:

```json
{
  "licenseKey": "CEG-7NANHMX_G71E-XYGNCLZY",
  "customer": {
    "name": "Horizon Freight Systems",
    "email": "admin@horizonfreight.com",
    "company": "Horizon Freight Systems"
  },
  "plan": "enterprise",
  "features": ["basic", "advanced", "api", "premium"],
  "maxUsers": 50,
  "maxTenants": 5,
  "expiresAt": "2026-05-17T03:42:28.100-05:00"
}
```

### License Key Format

The license key follows the format: `CEG-XXXXXXXXXXXX-XXXXXXXX`

- `CEG`: Prefix for Cosmo Exploit Group
- `XXXXXXXXXXXX`: 12-character unique identifier
- `XXXXXXXX`: 8-character validation code

### License Features

The license system supports the following features:

- `basic`: Basic functionality
- `advanced`: Advanced features
- `api`: API access
- `premium`: Premium support

## License Manager

The License Manager (`utils/license.js`) is a utility for validating and checking license features in the application.

### Using the License Manager

```javascript
import licenseManager from './utils/license.js';

// Initialize the license manager
await licenseManager.initialize();

// Check if license is valid
if (licenseManager.isValid) {
  console.log('License is valid');
  
  // Check for specific features
  if (licenseManager.hasFeature('api')) {
    // Enable API access
  }
} else {
  console.log('License is invalid');
}

// Get license information
const licenseInfo = licenseManager.getLicenseInfo();
console.log(`Customer: ${licenseInfo.customer.name}`);
```

### Testing the License

You can test the license using the provided test script:

```bash
npm run test-license
```

## Integrating with the Application

### Frontend Integration

To integrate the license system with the frontend:

1. Import the license manager:
   ```javascript
   import licenseManager from '../utils/license.js';
   ```

2. Initialize the license manager in your app initialization:
   ```javascript
   useEffect(() => {
     const initializeLicense = async () => {
       await licenseManager.initialize();
       setLicenseValid(licenseManager.isValid);
     };
     
     initializeLicense();
   }, []);
   ```

3. Check for features before enabling functionality:
   ```javascript
   {licenseManager.hasFeature('api') && (
     <ApiAccessComponent />
   )}
   ```

### Backend Integration

To integrate the license system with the backend:

1. Import the license manager:
   ```javascript
   import licenseManager from './utils/license.js';
   ```

2. Initialize the license manager when the server starts:
   ```javascript
   const startServer = async () => {
     await licenseManager.initialize();
     
     if (!licenseManager.isValid) {
       console.error('Invalid license. Server will not start.');
       process.exit(1);
     }
     
     // Continue with server initialization
   };
   ```

3. Check for features in API routes:
   ```javascript
   app.use('/api', (req, res, next) => {
     if (!licenseManager.hasFeature('api')) {
       return res.status(403).json({ error: 'API access not included in license' });
     }
     next();
   });
   ```

## License Validation Process

The license validation process includes:

1. **Format Validation**: Checking if the license key follows the correct format
2. **Expiration Check**: Verifying that the license has not expired
3. **Feature Validation**: Confirming that requested features are included in the license

## Troubleshooting

### License Not Found

If the application cannot find the license file:

1. Verify that the `config/license.json` file exists
2. Check file permissions
3. Ensure the file is properly formatted JSON

### Invalid License

If the license is invalid:

1. Verify the license key format
2. Check if the license has expired
3. Generate a new license if necessary

### Feature Not Available

If a feature is not available:

1. Check the license features array
2. Upgrade the license to include the required feature
3. Generate a new license with the required features

## Demo License

For demonstration purposes, a license for Horizon Freight Systems has been created:

- **License Key**: CEG-7NANHMX_G71E-XYGNCLZY
- **Customer**: Horizon Freight Systems
- **Plan**: Enterprise
- **Features**: Basic, Advanced, API Access, Premium Support
- **Max Users**: 50
- **Max Tenants**: 5
- **Expires**: May 17, 2026

This license can be used for demonstration and testing purposes.

## Future Enhancements

Future enhancements to the license system may include:

1. **Online Validation**: Validating licenses against an online service
2. **Automatic Renewal**: Automatically renewing licenses before expiration
3. **Usage Tracking**: Tracking feature usage for billing purposes
4. **License Transfer**: Transferring licenses between customers
5. **AI-Assisted License Management**: Using AI to optimize license management

## Support

For support with the license system, contact:

- Email: support@cosmoexploitgroup.com
- Phone: 555-COSMO-EG
