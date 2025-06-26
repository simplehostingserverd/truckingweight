# Coolify Deployment & Troubleshooting Guide

## 🚀 Running Scripts on Coolify Server

### Method 1: SSH Access (Recommended)

1. **Connect to your Coolify server via SSH:**
   ```bash
   ssh root@your-server-ip
   # or
   ssh your-username@your-server-ip
   ```

2. **Upload the health check script:**
   ```bash
   # Option A: Using SCP from your local machine
   scp coolify-health-check.sh root@your-server-ip:/root/
   
   # Option B: Create the script directly on server
   nano /root/coolify-health-check.sh
   # Copy and paste the script content
   ```

3. **Make the script executable and run it:**
   ```bash
   chmod +x /root/coolify-health-check.sh
   ./coolify-health-check.sh
   ```

### Method 2: Coolify Web Interface

1. **Access Coolify Dashboard:**
   - Go to your Coolify web interface
   - Navigate to your application

2. **Use the Terminal/Console feature:**
   - Look for "Terminal" or "Console" in your application dashboard
   - Run commands directly in the web terminal

3. **Execute health checks:**
   ```bash
   # Check container status
   docker ps
   
   # Check logs
   docker logs <container-name>
   
   # Check resource usage
   docker stats --no-stream
   ```

### Method 3: Coolify CLI (if available)

```bash
# Install Coolify CLI
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash

# Connect to your server
coolify server connect

# Run commands
coolify app logs <app-name>
```

## 🔧 Troubleshooting Web Application Loading Issues

### Common Issues and Solutions

#### 1. License Key Issues (Most Likely Cause)

**Problem:** Application not loading due to missing or invalid license configuration.

**Solution:**
```bash
# Check if environment variables are set
docker exec <frontend-container> env | grep LICENSE
docker exec <frontend-container> env | grep SECURITY_TOKEN

# Verify license configuration
docker exec <frontend-container> cat /app/.env.production
```

**Required Environment Variables:**
- `NEXT_PUBLIC_LICENSE_KEY=CEG-6CC6D8E50E6F-1F5C8AEB`
- `NEXT_PUBLIC_SECURITY_TOKEN=dfddee9031627f8a533182791cb937a3f7ee748fa56e7317241245c79c493554`

#### 2. Supabase Configuration

**Problem:** Database connection issues.

**Solution:**
```bash
# Check Supabase environment variables
docker exec <frontend-container> env | grep SUPABASE
docker exec <backend-container> env | grep SUPABASE
```

**Required Variables:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_JWT_SECRET`

#### 3. Domain and SSL Issues

**Problem:** Domain not resolving or SSL certificate issues.

**Solution:**
```bash
# Check DNS resolution
nslookup cargoscalepro.com
nslookup www.cargoscalepro.com
nslookup api.cargoscalepro.com

# Check SSL certificates
openssl s_client -connect cargoscalepro.com:443 -servername cargoscalepro.com

# Check Traefik configuration
docker logs <traefik-container>
```

#### 4. Container Health Issues

**Problem:** Containers not starting or crashing.

**Solution:**
```bash
# Check container status
docker ps -a

# Check container logs
docker logs <container-name>

# Restart containers
docker restart <container-name>

# Check resource usage
docker stats
```

## 📋 Step-by-Step Deployment Verification

### 1. Environment Setup Verification

```bash
# Run the health check script
./coolify-health-check.sh

# Manual checks
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
docker logs <frontend-container> --tail 50
docker logs <backend-container> --tail 50
```

### 2. Network Connectivity Test

```bash
# Test internal connectivity
docker exec <frontend-container> curl -I http://localhost:3000
docker exec <backend-container> curl -I http://localhost:5000/health

# Test external connectivity
curl -I https://cargoscalepro.com
curl -I https://www.cargoscalepro.com
curl -I https://api.cargoscalepro.com
```

### 3. License Validation

```bash
# Check license configuration in frontend
docker exec <frontend-container> node -e "
  const fs = require('fs');
  try {
    const env = fs.readFileSync('.env.production', 'utf8');
    console.log('License Key:', env.match(/NEXT_PUBLIC_LICENSE_KEY=(.+)/)?.[1] || 'NOT FOUND');
    console.log('Security Token:', env.match(/NEXT_PUBLIC_SECURITY_TOKEN=(.+)/)?.[1] || 'NOT FOUND');
  } catch (e) {
    console.log('Error reading .env.production:', e.message);
  }
"
```

### 4. Database Connection Test

```bash
# Test Supabase connection
docker exec <frontend-container> node -e "
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  supabase.from('profiles').select('count').then(console.log).catch(console.error);
"
```

## 🔄 Quick Fixes

### Restart All Services

```bash
# Restart all containers
docker restart $(docker ps -q)

# Or restart specific services
docker restart <frontend-container>
docker restart <backend-container>
docker restart <traefik-container>
```

### Update Environment Variables

```bash
# If using Coolify, update through the web interface:
# 1. Go to your application settings
# 2. Navigate to Environment Variables
# 3. Add/update the missing variables
# 4. Redeploy the application

# Or update directly in container (temporary fix)
docker exec <frontend-container> sh -c 'echo "NEXT_PUBLIC_LICENSE_KEY=CEG-6CC6D8E50E6F-1F5C8AEB" >> .env.production'
docker exec <frontend-container> sh -c 'echo "NEXT_PUBLIC_SECURITY_TOKEN=dfddee9031627f8a533182791cb937a3f7ee748fa56e7317241245c79c493554" >> .env.production'
```

### Force Rebuild and Deploy

```bash
# In Coolify interface:
# 1. Go to your application
# 2. Click "Deploy" with "Force Rebuild" option
# 3. Monitor the deployment logs

# Or using CLI (if available)
coolify app deploy <app-name> --force-rebuild
```

## 📊 Monitoring Commands

### Real-time Monitoring

```bash
# Follow logs in real-time
docker logs -f <frontend-container>
docker logs -f <backend-container>
docker logs -f <traefik-container>

# Monitor resource usage
watch docker stats

# Monitor container health
watch docker ps
```

### Performance Monitoring

```bash
# Check system resources
htop
df -h
free -h

# Check network connections
netstat -tulpn | grep :80
netstat -tulpn | grep :443
```

## 🆘 Emergency Recovery

### If Application is Completely Down

1. **Check server resources:**
   ```bash
   df -h  # Check disk space
   free -h  # Check memory
   top  # Check CPU usage
   ```

2. **Restart Docker service:**
   ```bash
   systemctl restart docker
   ```

3. **Restart Coolify:**
   ```bash
   systemctl restart coolify
   ```

4. **Check Coolify logs:**
   ```bash
   journalctl -u coolify -f
   ```

### Contact Information

If issues persist:
- Check Coolify documentation: https://coolify.io/docs
- Review application logs for specific error messages
- Ensure all environment variables are properly set
- Verify domain DNS settings
- Check SSL certificate validity

---

**Note:** The license key setup was likely the main issue preventing the web application from loading. After updating the environment variables in `.env.production`, the application should load properly once redeployed.