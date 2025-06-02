# 🔧 Environment Configuration Guide

This guide explains how to properly configure environment variables for the Cosmo Exploit Group LLC Weight Management System.

## 📁 Environment Files Structure

```
truckingweight/
├── .env                           # Root environment (created by start-app.sh)
├── frontend/
│   ├── .env.example              # Frontend template
│   ├── .env.local                # Frontend development (copy from .env.example)
│   └── .env.production           # Frontend production
└── backend/
    ├── .env.example              # Backend template (placeholders only)
    ├── .env                      # Backend development (pre-configured)
    └── .env.production           # Backend production (create manually)
```

## 🚀 Quick Setup

### Option 1: Use Pre-configured Files (Recommended)
```bash
# Frontend environment
cp frontend/.env.example frontend/.env.local

# Backend environment is already configured in backend/.env
# No action needed - it contains working values
```

### Option 2: Generate New Secrets
```bash
# Generate fresh secrets
npm run generate-secrets

# Copy the output to your backend/.env file
# Replace the existing JWT_SECRET and PASETO_SECRET_KEY values
```

## 🔑 Environment Variables Explained

### Frontend (.env.local)
```bash
# Supabase Configuration (Public)
NEXT_PUBLIC_SUPABASE_URL=https://pczfmxigimuluacspxse.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Map Services (Public)
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1Ijoic2ltcGxlaG9zdGluZ3NlcnZlcmQi...
NEXT_PUBLIC_CESIUM_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_MAPTILER_KEY=WPXCcZzL6zr6JzGBzMUK

# Security (Public)
NEXT_PUBLIC_HCAPTCHA_SITE_KEY=10000000-ffff-ffff-ffff-000000000001

# Feature Flags (Public)
NEXT_PUBLIC_ENABLE_MAPS=true
NEXT_PUBLIC_ENABLE_REPORTS=true
NEXT_PUBLIC_ENABLE_ADMIN=true
```

### Backend (.env)
```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# Security Keys (KEEP SECRET!)
JWT_SECRET=089c8aea07a1c5974098d08cd53b8539c0b7b9b8cc10e0532b78587b23c3fbe2c645231162e9b194677a1c117e651f85e5563129d9f4a45ef64bc3f09916f9109
PASETO_SECRET_KEY=VoCXFgz32I6Sb7OZGtzrbYuMvdDVRBM4htoJox0o0Kk=

# Supabase Configuration
SUPABASE_URL=https://pczfmxigimuluacspxse.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database
DATABASE_URL=postgresql://postgres.pczfmxigimuluacspxse:password@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

## 🔒 Security Best Practices

### Development
- ✅ Use the provided `.env` files for development
- ✅ Keep secrets in `.env` files (already in `.gitignore`)
- ✅ Use different secrets for each environment
- ⚠️ Never commit real secrets to version control

### Production
- 🔐 Generate new secrets for production: `npm run generate-secrets`
- 🔐 Use environment variables or secret management systems
- 🔐 Rotate secrets regularly
- 🔐 Use strong, unique passwords for database connections
- 🔐 Enable SSL/TLS for all connections

## 🛠️ Customization

### Generate New Secrets
```bash
# Generate fresh secrets for your environment
npm run generate-secrets

# Copy the output to your .env files
```

### Update Database Connection
```bash
# For local PostgreSQL
DATABASE_URL=postgresql://username:password@localhost:5432/truckingweight

# For Supabase (recommended)
DATABASE_URL=postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres
```

### Environment-Specific Configuration
```bash
# Development
NODE_ENV=development
LOG_LEVEL=debug

# Production
NODE_ENV=production
LOG_LEVEL=info
```

## 🔍 Troubleshooting

### Missing Environment Variables
```bash
# Check if all required variables are set
node scripts/test-supabase-connection.mjs
```

### Invalid Secrets
```bash
# Generate new secrets if authentication fails
npm run generate-secrets
```

### Database Connection Issues
```bash
# Verify database URL format
# Check network connectivity
# Verify credentials
```

## 📋 Environment Checklist

- [ ] Frontend `.env.local` copied from `.env.example`
- [ ] Backend `.env` exists with valid secrets
- [ ] Database connection string is correct
- [ ] Supabase keys are valid
- [ ] Map service tokens are configured
- [ ] All secrets are unique and secure
- [ ] Production secrets are different from development

## 🆘 Need Help?

If you encounter issues:
1. Run `node scripts/check-requirements.mjs`
2. Run `node scripts/test-supabase-connection.mjs`
3. Check the main [SETUP.md](SETUP.md) guide
4. Contact: info@cosmoexploitgroup.com
