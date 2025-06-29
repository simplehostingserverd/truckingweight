# 🚀 CargoScalePro Coolify Environment Variables

## Required Environment Variables for Production Deployment

### 🌐 **Domain Configuration**

```bash
NEXT_PUBLIC_APP_URL=https://cargoscalepro.com
NEXT_PUBLIC_API_URL=https://api.cargoscalepro.com
BACKEND_URL=https://api.cargoscalepro.com
```

### 🔒 **Security & Authentication**

```bash
NODE_ENV=production
JWT_SECRET=089c8aea07a1c5974098d08cd53b8539c0b7b9b8cc10e0532b78587b23c3fbe2c645231162e9b194677a1c117e651f85e5563129d9f4a45ef64bc3f09916f9109
PASETO_SECRET_KEY=VoCXFgz32I6Sb7OZGtzrbYuMvdDVRBM4htoJox0o0Kk=
AUTHORIZED_DOMAINS=cargoscalepro.com,api.cargoscalepro.com,www.cargoscalepro.com
```

### 🗄️ **Supabase Database Configuration**

```bash
NEXT_PUBLIC_SUPABASE_URL=https://pczfmxigimuluacspxse.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjemZteGlnaW11bHVhY3NweHNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2NjczNjUsImV4cCI6MjA2MjI0MzM2NX0.SyWZsCDWc5u5oXIR4IHBTcT63Le0HyjCZQJK0E6FO7w

SUPABASE_URL=https://pczfmxigimuluacspxse.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjemZteGlnaW11bHVhY3NweHNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2NjczNjUsImV4cCI6MjA2MjI0MzM2NX0.SyWZsCDWc5u5oXIR4IHBTcT63Le0HyjCZQJK0E6FO7w
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjemZteGlnaW11bHVhY3NweHNlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjY2NzM2NSwiZXhwIjoyMDYyMjQzMzY1fQ.3UZzJl0LLGyMW9QqGQLx6Dkyzn_29l8rxTbRahUoTWE
SUPABASE_JWT_SECRET=5KYUyCsHvxw3vG7QTtOywMFazTGpWE5VvbPNYgPXK+xiQCybFn9ts4ZLMU2QiGKAVfWuU2SR+N4fJuiJxwQx9Q==

DATABASE_URL=postgresql://postgres.pczfmxigimuluacspxse:jt!EkWFCsaXq1NJCVZMv@aws-0-us-east-2.pooler.supabase.com:6543/postgres
```

### 🗺️ **Map Services**

```bash
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1Ijoic2ltcGxlaG9zdGluZ3NlcnZlcmQiLCJhIjoiY21haTl1dXhpMGJ2bzJ1cTVlY2p4ajhzZCJ9.AUS7RZCMk1vnR4yQR5RAEQ
NEXT_PUBLIC_CESIUM_TOKEN=your-cesium-token-here
NEXT_PUBLIC_MAPTILER_KEY=WPXCcZzL6zr6JzGBzMUK
```

### 🚩 **Feature Flags**

```bash
NEXT_PUBLIC_ENABLE_MAPS=true
NEXT_PUBLIC_ENABLE_REPORTS=true
NEXT_PUBLIC_ENABLE_ADMIN=true
NEXT_PUBLIC_ENABLE_TELEMATICS=true
NEXT_PUBLIC_ENABLE_GEOFENCING=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

### 🔐 **Security Features**

```bash
NEXT_PUBLIC_ENABLE_CAPTCHA=true
NEXT_PUBLIC_HCAPTCHA_SITE_KEY=your-hcaptcha-site-key
HCAPTCHA_SECRET_KEY=your-hcaptcha-secret-key
```

### 📊 **Monitoring & Analytics**

```bash
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=your-secure-grafana-password
```

### 🗄️ **Redis Configuration**

```bash
REDIS_URL=redis://redis:6379
CACHE_TTL=3600
```

### 🚦 **Rate Limiting**

```bash
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 🌐 **CORS Configuration**

```bash
CORS_ORIGIN=https://cargoscalepro.com,https://www.cargoscalepro.com
CORS_CREDENTIALS=true
FRONTEND_URL=https://cargoscalepro.com
ALLOWED_ORIGINS=https://cargoscalepro.com,https://www.cargoscalepro.com
```

### 🚛 **External API Keys (Optional)**

```bash
PCMILER_API_KEY=your-pcmiler-api-key
IPASS_API_KEY=your-ipass-api-key
BESTPASS_CLIENT_ID=your-bestpass-client-id
BESTPASS_CLIENT_SECRET=your-bestpass-client-secret
PREPASS_API_KEY=your-prepass-api-key
PREPASS_CUSTOMER_ID=your-prepass-customer-id
```

### 📧 **Email Configuration (Optional)**

```bash
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
SMTP_FROM=noreply@cargoscalepro.com
```

### 📁 **File Upload Configuration**

```bash
MAX_FILE_SIZE=10485760
UPLOAD_PATH=/tmp/uploads
```

### 🐳 **Docker Configuration**

```bash
DOCKER_REGISTRY=cargoscalepro
TAG=latest
```

### 📝 **Logging**

```bash
LOG_LEVEL=info
```

### 🔧 **Build Configuration**

```bash
NEXT_TELEMETRY_DISABLED=1
ANALYZE=false
```

### 🔒 **Security Headers**

```bash
HELMET_ENABLED=true
TRUST_PROXY=true
```

### 📈 **Performance**

```bash
METRICS_ENABLED=true
HEALTH_CHECK_ENABLED=true
NEXT_PUBLIC_ENABLE_PWA=true
```

---

## 🚀 **Coolify Deployment Steps**

1. **Create New Project** in Coolify
2. **Set Git Repository**: Contact development team for private repository access
3. **Set Build Context**: `frontend/`
4. **Set Dockerfile Path**: `frontend/Dockerfile`
5. **Add ALL environment variables** listed above
6. **Set Custom Domains**:
   - Primary: `cargoscalepro.com`
   - API: `api.cargoscalepro.com`
7. **Enable SSL** for both domains
8. **Deploy**

## ⚠️ **Important Notes**

- **Replace placeholder values** with your actual API keys and secrets
- **Generate secure JWT_SECRET** (256-bit minimum)
- **Update GRAFANA_ADMIN_PASSWORD** with a strong password
- **Obtain Cesium token** from cesium.com for 3D maps
- **Configure hCaptcha** for security if needed
- **Set up monitoring** with Sentry for error tracking

## 🔗 **Post-Deployment**

After deployment, verify:

- ✅ Frontend loads at `https://cargoscalepro.com`
- ✅ API responds at `https://api.cargoscalepro.com/health`
- ✅ Database connections work
- ✅ Maps load correctly
- ✅ Authentication functions

---

**© 2025 Cargo Scale Pro. All Rights Reserved.**
