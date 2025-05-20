# Secure Deployment Guide

This guide provides instructions for securely deploying the Simple Scale Solutions application using Docker with various cloud providers.

## Security Features

This deployment approach includes several security features:

1. **No Vulnerable Dependencies**: All dependencies have been updated to remove vulnerabilities.
2. **Docker Containerization**: Application runs in isolated containers.
3. **Non-Root User**: Application runs as a non-root user inside the container.
4. **HTTPS Enforcement**: All HTTP traffic is redirected to HTTPS.
5. **Security Headers**: Includes all recommended security headers.
6. **Content Security Policy**: Strict CSP to prevent XSS attacks.
7. **Health Monitoring**: Built-in health check endpoint.
8. **Rate Limiting**: Nginx configuration includes rate limiting.

## Prerequisites

1. Docker and Docker Compose installed
2. SSL certificates for your domain
3. Environment variables set up

## Environment Variables

Create a `.env` file with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://pczfmxigimuluacspxse.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
NEXT_PUBLIC_CESIUM_TOKEN=your_cesium_token
NEXT_PUBLIC_HCAPTCHA_SITE_KEY=your_hcaptcha_site_key
HCAPTCHA_SECRET_KEY=your_hcaptcha_secret_key
```

## Local Deployment

To run the application locally:

```bash
docker-compose up -d
```

The application will be available at http://localhost:3000.

## Cloud Provider Deployment Options

### 1. AWS Elastic Container Service (ECS)

1. Create an ECR repository:
   ```bash
   aws ecr create-repository --repository-name simple-scale-solutions
   ```

2. Build and push the Docker image:
   ```bash
   aws ecr get-login-password | docker login --username AWS --password-stdin your-aws-account-id.dkr.ecr.region.amazonaws.com
   docker build -t your-aws-account-id.dkr.ecr.region.amazonaws.com/simple-scale-solutions:latest .
   docker push your-aws-account-id.dkr.ecr.region.amazonaws.com/simple-scale-solutions:latest
   ```

3. Create an ECS cluster, task definition, and service using the AWS console or CLI.

4. Set up environment variables in the task definition.

### 2. Google Cloud Run

1. Build and push the Docker image:
   ```bash
   gcloud auth configure-docker
   docker build -t gcr.io/your-project-id/simple-scale-solutions:latest .
   docker push gcr.io/your-project-id/simple-scale-solutions:latest
   ```

2. Deploy to Cloud Run:
   ```bash
   gcloud run deploy simple-scale-solutions \
     --image gcr.io/your-project-id/simple-scale-solutions:latest \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars="NEXT_PUBLIC_SUPABASE_URL=https://pczfmxigimuluacspxse.supabase.co,NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key,..."
   ```

### 3. Azure Container Instances

1. Create an Azure Container Registry:
   ```bash
   az acr create --resource-group myResourceGroup --name myRegistry --sku Basic
   ```

2. Build and push the Docker image:
   ```bash
   az acr login --name myRegistry
   docker build -t myregistry.azurecr.io/simple-scale-solutions:latest .
   docker push myregistry.azurecr.io/simple-scale-solutions:latest
   ```

3. Deploy to Azure Container Instances:
   ```bash
   az container create \
     --resource-group myResourceGroup \
     --name simple-scale-solutions \
     --image myregistry.azurecr.io/simple-scale-solutions:latest \
     --dns-name-label simple-scale-solutions \
     --ports 3000 \
     --environment-variables NEXT_PUBLIC_SUPABASE_URL=https://pczfmxigimuluacspxse.supabase.co NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key ...
   ```

### 4. Digital Ocean App Platform

1. Push your code to a GitHub repository.

2. In the Digital Ocean dashboard, create a new app from your GitHub repository.

3. Select the "Docker" deployment type.

4. Configure environment variables in the app settings.

### 5. Kubernetes Deployment

For more complex deployments, you can use Kubernetes:

1. Create Kubernetes deployment and service files:

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: simple-scale-solutions
spec:
  replicas: 3
  selector:
    matchLabels:
      app: simple-scale-solutions
  template:
    metadata:
      labels:
        app: simple-scale-solutions
    spec:
      containers:
      - name: simple-scale-solutions
        image: your-registry/simple-scale-solutions:latest
        ports:
        - containerPort: 3000
        env:
        - name: NEXT_PUBLIC_SUPABASE_URL
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: NEXT_PUBLIC_SUPABASE_URL
        # Add other environment variables
        resources:
          limits:
            cpu: "1"
            memory: "1Gi"
          requests:
            cpu: "0.5"
            memory: "512Mi"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
```

```yaml
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: simple-scale-solutions
spec:
  selector:
    app: simple-scale-solutions
  ports:
  - port: 80
    targetPort: 3000
  type: ClusterIP
```

2. Apply the Kubernetes configurations:
   ```bash
   kubectl apply -f deployment.yaml
   kubectl apply -f service.yaml
   ```

## SSL Certificate Setup

For production deployments, you'll need SSL certificates. You can use Let's Encrypt to get free SSL certificates:

1. Install certbot:
   ```bash
   apt-get update
   apt-get install certbot
   ```

2. Generate certificates:
   ```bash
   certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
   ```

3. Copy certificates to the nginx/ssl directory:
   ```bash
   cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ./nginx/ssl/cert.pem
   cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ./nginx/ssl/key.pem
   ```

## Security Best Practices

1. **Regularly Update Dependencies**: Run `npm audit` and update dependencies regularly.
2. **Scan Docker Images**: Use tools like Trivy to scan Docker images for vulnerabilities.
3. **Use Secrets Management**: Store sensitive information in a secrets manager.
4. **Enable Logging**: Configure comprehensive logging for security monitoring.
5. **Implement Rate Limiting**: Protect against brute force attacks.
6. **Set Up Monitoring**: Monitor application health and security.
7. **Regular Backups**: Implement regular backups of your data.

## Temporary Subdomain Deployment

For temporary subdomain deployments (e.g., for staging environments), you can use services like:

1. **ngrok**: Provides temporary public URLs for your local development server.
2. **Cloudflare Tunnel**: Securely exposes your local server to the internet.
3. **Serveo**: Simple SSH-based service for exposing local servers.

Example with ngrok:
```bash
# Run your Docker containers
docker-compose up -d

# Expose your local server with ngrok
ngrok http 3000
```

This will provide a temporary URL like `https://abc123.ngrok.io` that you can use for testing.
