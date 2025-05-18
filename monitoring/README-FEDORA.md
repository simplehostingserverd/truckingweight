# Docker and Grafana Setup for Fedora Workstation

This guide will help you set up Docker and Grafana on your Fedora Workstation.

## Installing Docker on Fedora

We've provided a script to automate the Docker installation process. Follow these steps:

1. Open a terminal
2. Navigate to the scripts directory:
   ```bash
   cd /home/joker/Pictures/truckingweight/scripts
   ```

3. Run the Docker installation script with sudo:
   ```bash
   sudo ./install-docker-fedora.sh
   ```

4. The script will:
   - Remove old Docker versions if they exist
   - Set up the Docker repository
   - Install Docker Engine
   - Start and enable the Docker service
   - Add your user to the docker group
   - Verify the installation
   - Test Docker with the hello-world container

5. After installation, log out and log back in to apply the docker group changes.

6. Verify Docker works without sudo:
   ```bash
   docker run hello-world
   ```

## Starting Grafana and Prometheus

Once Docker is installed, you can start Grafana and Prometheus using Docker Compose:

1. Navigate to the project root:
   ```bash
   cd /home/joker/Pictures/truckingweight
   ```

2. Start the services:
   ```bash
   docker compose up -d
   ```

3. Access Grafana:
   - URL: http://localhost:3001
   - Default credentials: admin / admin
   - You'll be prompted to change the password on first login

## Grafana Configuration

After logging in to Grafana, you'll need to configure it:

1. Add Prometheus as a data source:
   - Go to Configuration > Data Sources
   - Click "Add data source"
   - Select "Prometheus"
   - Set the URL to: http://prometheus:9090
   - Click "Save & Test"

2. Import the dashboard:
   - Go to Dashboards > Import
   - Click "Upload JSON file"
   - Select the file: `/home/joker/Pictures/truckingweight/monitoring/grafana/dashboards/main-dashboard.json`
   - Select the Prometheus data source
   - Click "Import"

## Accessing Metrics

The application exposes metrics at the following endpoints:

- Backend metrics: http://localhost:5000/metrics
- Frontend metrics: http://localhost:3000/api/metrics

## Troubleshooting

### Docker Issues

1. If you get a permission denied error:
   ```
   Got permission denied while trying to connect to the Docker daemon socket
   ```
   
   Solution:
   - Make sure you've logged out and logged back in after installation
   - Or run the command with sudo
   - Or manually add your user to the docker group:
     ```bash
     sudo usermod -aG docker $USER
     ```

2. If Docker service fails to start:
   ```
   Failed to start docker.service: Unit docker.service not found
   ```
   
   Solution:
   - Try reinstalling Docker:
     ```bash
     sudo dnf reinstall docker-ce
     ```
   - Then start the service:
     ```bash
     sudo systemctl start docker
     ```

### Grafana Issues

1. If you can't access Grafana:
   - Check if the container is running:
     ```bash
     docker ps | grep grafana
     ```
   - Check the logs:
     ```bash
     docker logs grafana
     ```

2. If Prometheus data source fails:
   - Make sure Prometheus is running:
     ```bash
     docker ps | grep prometheus
     ```
   - Check the Prometheus logs:
     ```bash
     docker logs prometheus
     ```
   - Verify the URL is correct (http://prometheus:9090)

## Stopping the Services

To stop Grafana and Prometheus:

```bash
cd /home/joker/Pictures/truckingweight
docker compose down
```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Prometheus Documentation](https://prometheus.io/docs/introduction/overview/)
