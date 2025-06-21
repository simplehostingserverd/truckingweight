# 🔌 Port Configuration Guide

## 📋 Current Port Configuration

The Cargo Scale Pro Weight Management System uses the following ports:

| Service               | Port | URL                                 | Description                |
| --------------------- | ---- | ----------------------------------- | -------------------------- |
| **Frontend**          | 3000 | http://localhost:3000               | Next.js development server |
| **Backend API**       | 5001 | http://localhost:5001               | Fastify backend server     |
| **API Documentation** | 5001 | http://localhost:5001/documentation | Swagger UI                 |
| **Grafana**           | 3001 | http://localhost:3001               | Monitoring dashboard       |
| **Prometheus**        | 9090 | http://localhost:9090               | Metrics collection         |

## ⚠️ Why Port 5001 Instead of 5000?

**Issue**: Port 5000 is commonly used by Windows system services and may be occupied by:

- Windows System process (PID 4)
- UPnP services
- Other system services

**Solution**: We moved the backend to port 5001 to avoid conflicts.

## 🔧 What Was Changed

### Backend Configuration

- `backend/.env`: `PORT=5001`
- `backend/.env.example`: `PORT=5001`

### Frontend Configuration

- `frontend/next.config.mjs`: API proxy destination updated to `http://localhost:5001`

### Docker Configuration

- `docker-compose.yml`: Backend port mapping changed to `5001:5001`
- Health check URL updated to `http://localhost:5001/health`

### Scripts and Documentation

- `scripts/velociraptor.mjs`: Port list updated to include 5001
- `start-app.sh`: Backend URL updated to `http://localhost:5001`
- `SETUP.md`: Documentation updated with new port numbers

## 🚀 Starting the Application

```bash
# Start both frontend and backend
npm run dev

# Frontend will be available at: http://localhost:3000
# Backend API will be available at: http://localhost:5001
# API Documentation: http://localhost:5001/documentation
```

## 🔍 Port Troubleshooting

### Check Port Availability

```bash
# Run our port checker
node scripts/velociraptor.mjs

# Or check manually
netstat -ano | findstr :5001
```

### If Port 5001 is Occupied

```bash
# Kill processes on development ports
node scripts/velociraptor.mjs

# Or manually kill specific process
taskkill /PID <process_id> /F
```

### Change to Different Port

If you need to use a different port:

1. **Update backend/.env**:

   ```bash
   PORT=5002  # or any available port
   ```

2. **Update frontend/next.config.mjs**:

   ```javascript
   destination: 'http://localhost:5002/api/:path*',
   ```

3. **Update docker-compose.yml**:
   ```yaml
   ports:
     - '5002:5002'
   ```

## 🐛 Common Issues

### "EADDRINUSE: address already in use"

- **Cause**: Another process is using the port
- **Solution**: Run `node scripts/velociraptor.mjs` or change the port

### "Cannot connect to backend"

- **Cause**: Backend not running or wrong port
- **Solution**: Check that backend is running on the correct port

### "API calls failing"

- **Cause**: Frontend proxy configuration mismatch
- **Solution**: Verify `next.config.mjs` has correct backend URL

## 📊 Port Monitoring

### Check What's Running

```bash
# List all TCP connections
netstat -ano

# Check specific port
Get-NetTCPConnection -LocalPort 5001

# List processes by port
Get-Process -Id (Get-NetTCPConnection -LocalPort 5001).OwningProcess
```

### Development Tools

- **Frontend**: http://localhost:3000
- **Backend Health**: http://localhost:5001/health
- **API Docs**: http://localhost:5001/documentation
- **Grafana**: http://localhost:3001 (admin/admin)
- **Prometheus**: http://localhost:9090

## 🔒 Security Notes

- **Development Only**: These ports are for development use
- **Production**: Use proper reverse proxy (nginx/Apache) in production
- **Firewall**: Ensure development ports are not exposed externally
- **HTTPS**: Use HTTPS in production environments

## 📝 Environment Variables

Key environment variables for port configuration:

```bash
# Backend
PORT=5001
NODE_ENV=development

# Frontend (Next.js handles this automatically)
# No explicit port configuration needed

# Docker
# Ports are mapped in docker-compose.yml
```

## 🆘 Need Help?

If you encounter port-related issues:

1. Run the port checker: `node scripts/velociraptor.mjs`
2. Check the logs for specific error messages
3. Verify environment configuration
4. Contact: info@cosmoexploitgroup.com

---

**Note**: This configuration ensures smooth development without conflicts with Windows system services.
