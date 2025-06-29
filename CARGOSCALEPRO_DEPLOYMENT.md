# 🚀 CargoScalePro Production Deployment Guide

## 📋 Overview

This guide provides comprehensive instructions for deploying CargoScalePro to production using the new `cargoscalepro.com` domain infrastructure.

## 🌐 Domain Architecture

### Production Domains
- **Frontend**: `https://cargoscalepro.com`
- **API**: `https://api.cargoscalepro.com`
- **Admin**: `https://admin.cargoscalepro.com` (optional)
- **Monitoring**: `https://cargoscalepro.com/grafana`

### DNS Configuration Required
```bash
# A Records
cargoscalepro.com → Frontend Server IP
api.cargoscalepro.com → Backend Server IP

# CNAME Records
www.cargoscalepro.com → cargoscalepro.com
admin.cargoscalepro.com → cargoscalepro.com
```

## 🐳 Docker Deployment

### Quick Start with Docker Compose

1. **Clone and Setup**
```bash
git clone https://github.com/simplehostingserverd/truckingweight.git
cd truckingweight
cp .env.example .env
```

2. **Configure Environment**
```bash
# Edit .env with your production values
nano .env
```

3. **Deploy with Docker Compose**
```bash
# Development
docker-compose up -d

# Production
docker-compose -f docker-compose.production.yml up -d
```

### Production Services Included

- **Nginx**: Reverse proxy with SSL termination
- **Frontend**: Next.js application (CargoScalePro)
- **Backend**: Fastify API server
- **Redis**: Caching and session storage
- **Grafana**: Monitoring dashboards
- **Prometheus**: Metrics collection
- **Node Exporter**: System metrics

## 🔧 Environment Configuration

### Frontend Environment (.env.production)
```bash
# Domain Configuration
NEXT_PUBLIC_APP_URL=https://cargoscalepro.com
NEXT_PUBLIC_API_URL=https://api.cargoscalepro.com

# Security
AUTHORIZED_DOMAINS=cargoscalepro.com,api.cargoscalepro.com,www.cargoscalepro.com

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://pczfmxigimuluacspxse.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key-here

# Map Services
NEXT_PUBLIC_MAPBOX_TOKEN=your-token-here
NEXT_PUBLIC_CESIUM_TOKEN=your-token-here
```

### Backend Environment (.env.production)
```bash
# Domain Configuration
FRONTEND_URL=https://cargoscalepro.com
ALLOWED_ORIGINS=https://cargoscalepro.com,https://www.cargoscalepro.com
API_BASE_URL=https://api.cargoscalepro.com

# Security
JWT_SECRET=your-production-jwt-secret
PASETO_SECRET_KEY=your-production-paseto-key

# Database
DATABASE_URL=your-supabase-database-url

# Redis
REDIS_URL=redis://redis:6379
```

## 🔒 SSL Certificate Setup

### Using Let's Encrypt (Recommended)
```bash
# Install Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Generate certificates
sudo certbot --nginx -d cargoscalepro.com -d www.cargoscalepro.com
sudo certbot --nginx -d api.cargoscalepro.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Manual Certificate Installation
```bash
# Place certificates in nginx/ssl/
nginx/ssl/
├── cargoscalepro.com.crt
├── cargoscalepro.com.key
├── api.cargoscalepro.com.crt
└── api.cargoscalepro.com.key
```

## 📊 Monitoring Setup

### Grafana Configuration
- **URL**: `https://cargoscalepro.com/grafana`
- **Default Login**: admin/admin (change immediately)
- **Dashboards**: Pre-configured for CargoScalePro metrics

### Prometheus Metrics
- **URL**: `https://cargoscalepro.com/prometheus`
- **Targets**: Frontend, Backend, Redis, System metrics

## 🚀 Deployment Steps

### 1. Server Preparation
```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Application Deployment
```bash
# Clone repository
git clone https://github.com/simplehostingserverd/truckingweight.git
cd truckingweight

# Setup environment
cp .env.example .env
# Edit .env with production values

# Deploy
docker-compose -f docker-compose.production.yml up -d
```

### 3. Verify Deployment
```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs -f frontend
docker-compose logs -f backend

# Test endpoints
curl https://cargoscalepro.com/api/health
curl https://api.cargoscalepro.com/health
```

## 🔧 Maintenance

### Backup Procedures
```bash
# Database backup (automated via Supabase)
# Redis backup
docker exec cargoscalepro-redis redis-cli BGSAVE

# Application backup
tar -czf cargoscalepro-backup-$(date +%Y%m%d).tar.gz \
  --exclude=node_modules \
  --exclude=.git \
  /path/to/truckingweight/
```

### Updates and Rollbacks
```bash
# Update application
git pull origin main
docker-compose -f docker-compose.production.yml build
docker-compose -f docker-compose.production.yml up -d

# Rollback if needed
git checkout previous-commit
docker-compose -f docker-compose.production.yml build
docker-compose -f docker-compose.production.yml up -d
```

## 📞 Support

For deployment assistance:
- **Email**: [support@cargoscalepro.com](mailto:support@cargoscalepro.com)
- **Documentation**: [docs.cargoscalepro.com](https://docs.cargoscalepro.com)
- **Emergency**: (555) 123-HELP

---

**© 2025 Cargo Scale Pro Inc. All Rights Reserved.**
