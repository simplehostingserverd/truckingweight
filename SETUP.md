# 🚀 Quick Setup Guide

This guide will help you get the Cosmo Exploit Group LLC Weight Management System running locally in under 10 minutes.

## Prerequisites

- **Node.js 20.x** (Required - newer versions like 24.x may cause issues)
- **npm 10.x** (Comes with Node.js 20)
- **Git** (For cloning the repository)

### ⚠️ Important: Node.js Version

This application is designed for **Node.js 20.x only**. If you're using a different version:

```bash
# Check your current version
node --version

# If not v20.x, switch using our helper script
npm run switch-node

# Or manually with nvm
nvm install 20
nvm use 20
```

## Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/simplehostingserverd/truckingweight.git
cd truckingweight

# Install all dependencies (frontend, backend, and root)
npm run install-deps
```

### 2. Environment Setup

```bash
# Copy environment files
cp frontend/.env.example frontend/.env.local

# Backend .env file is already created with working values
# If you need to customize, copy from example:
# cp backend/.env.example backend/.env

# The backend/.env file contains pre-configured values including:
# - Generated JWT_SECRET for NextAuth compatibility
# - Generated PASETO_SECRET_KEY for secure tokens
# - Supabase configuration
# - Database connection string
```

### 3. Database Setup

```bash
# Generate Prisma client and push schema to database
npm run setup-db

# Add telematics columns (required for vehicle tracking)
npm run add-telematics-columns
```

### 4. Start Development Servers

```bash
# Start both frontend and backend concurrently
npm run dev
```

This will start:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **API Documentation**: http://localhost:5001/documentation

## Test Accounts

Use these accounts to test the application:

- **Admin**: `truckadmin@example.com` / `TruckAdmin123!`
- **Dispatcher**: `dispatcher@example.com` / `Dispatch123!`
- **Manager**: `manager@example.com` / `Manager123!`

## Troubleshooting

### Port Conflicts
If you get port conflicts, run the port killer:
```bash
node scripts/velociraptor.mjs
```

### Database Connection Issues
Test your Supabase connection:
```bash
node scripts/test-supabase-connection.mjs
```

### Clean Install
If you encounter dependency issues:
```bash
npm run clean
npm run install-deps
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development servers |
| `npm run build` | Build for production |
| `npm run start` | Start production servers |
| `npm run setup-db` | Initialize database |
| `npm run lint` | Check code quality |
| `npm run test` | Run tests |
| `npm run docker:up` | Start with Docker |

## Next Steps

1. **Explore the Dashboard**: Navigate to http://localhost:3000 and log in
2. **Check API Docs**: Visit http://localhost:5001/documentation
3. **Review the Code**: Start with `frontend/src/app` and `backend/routes`
4. **Read the Full Documentation**: See the main README.md

## Need Help?

- Check the [main README](README.md) for detailed information
- Review the [Information](Information/) directory for guides
- Contact: info@cosmoexploitgroup.com
