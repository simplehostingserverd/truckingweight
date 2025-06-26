# Coolify Server Health Check Script (PowerShell)
# © 2025 Cargo Scale Pro. All Rights Reserved.
# This script checks all components of the application deployment

Write-Host "🔍 Cargo Scale Pro - Coolify Health Check" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Timestamp: $(Get-Date)" -ForegroundColor Gray
Write-Host ""

# Function to print status
function Print-Status {
    param(
        [bool]$Success,
        [string]$Message
    )
    if ($Success) {
        Write-Host "✅ $Message" -ForegroundColor Green
    } else {
        Write-Host "❌ $Message" -ForegroundColor Red
    }
}

function Print-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Blue
}

function Print-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

Write-Host "1. 🐳 Docker Container Status" -ForegroundColor Yellow
Write-Host "-----------------------------" -ForegroundColor Yellow
try {
    docker ps --format "table {{.Names}}`t{{.Status}}`t{{.Ports}}" | Select-String -Pattern "(frontend|backend|traefik)"
} catch {
    Write-Host "Error checking Docker containers: $_" -ForegroundColor Red
}
Write-Host ""

Write-Host "2. 🌐 Network Connectivity" -ForegroundColor Yellow
Write-Host "---------------------------" -ForegroundColor Yellow

# Check if containers are running
try {
    $frontendRunning = (docker ps --filter "name=frontend" --format "{{.Names}}" | Measure-Object).Count -gt 0
    $backendRunning = (docker ps --filter "name=backend" --format "{{.Names}}" | Measure-Object).Count -gt 0
    $traefikRunning = (docker ps --filter "name=traefik" --format "{{.Names}}" | Measure-Object).Count -gt 0

    Print-Status $frontendRunning "Frontend container running"
    Print-Status $backendRunning "Backend container running"
    Print-Status $traefikRunning "Traefik container running"
} catch {
    Write-Host "Error checking container status: $_" -ForegroundColor Red
}
Write-Host ""

Write-Host "3. 🔗 Internal Service Health" -ForegroundColor Yellow
Write-Host "------------------------------" -ForegroundColor Yellow

# Check internal container connectivity
if ($frontendRunning) {
    try {
        $frontendContainer = docker ps --filter "name=frontend" --format "{{.Names}}" | Select-Object -First 1
        $frontendStatus = docker exec $frontendContainer curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>$null
        if (-not $frontendStatus) { $frontendStatus = "000" }
        Print-Status ($frontendStatus -eq "200") "Frontend internal health (HTTP $frontendStatus)"
    } catch {
        Print-Status $false "Frontend internal health (check failed)"
    }
} else {
    Print-Status $false "Frontend internal health (container not running)"
}

if ($backendRunning) {
    try {
        $backendContainer = docker ps --filter "name=backend" --format "{{.Names}}" | Select-Object -First 1
        $backendStatus = docker exec $backendContainer curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/health 2>$null
        if (-not $backendStatus) { $backendStatus = "000" }
        Print-Status ($backendStatus -eq "200") "Backend internal health (HTTP $backendStatus)"
    } catch {
        Print-Status $false "Backend internal health (check failed)"
    }
} else {
    Print-Status $false "Backend internal health (container not running)"
}
Write-Host ""

Write-Host "4. 🌍 External Domain Access" -ForegroundColor Yellow
Write-Host "-----------------------------" -ForegroundColor Yellow

# Check external domain access
$domains = @("cargoscalepro.com", "www.cargoscalepro.com", "api.cargoscalepro.com")

foreach ($domain in $domains) {
    try {
        $response = Invoke-WebRequest -Uri "https://$domain" -Method Head -TimeoutSec 10 -ErrorAction SilentlyContinue
        $statusCode = $response.StatusCode
        Print-Status (($statusCode -ge 200) -and ($statusCode -lt 400)) "$domain (HTTP $statusCode)"
    } catch {
        Print-Status $false "$domain (Connection failed)"
    }
}
Write-Host ""

Write-Host "5. 🔧 Traefik Configuration" -ForegroundColor Yellow
Write-Host "---------------------------" -ForegroundColor Yellow

if ($traefikRunning) {
    try {
        $traefikContainer = docker ps --filter "name=traefik" --format "{{.Names}}" | Select-Object -First 1
        
        Print-Info "Traefik container: $traefikContainer"
        Print-Info "Checking Traefik API availability..."
        
        # Try to get Traefik API info
        $traefikApi = docker exec $traefikContainer wget -qO- http://localhost:8080/api/overview 2>$null
        if ($traefikApi) {
            Print-Status $true "Traefik API accessible"
        } else {
            Print-Status $false "Traefik API not accessible"
        }
    } catch {
        Print-Status $false "Error checking Traefik configuration: $_"
    }
} else {
    Print-Status $false "Traefik not running - cannot check configuration"
}
Write-Host ""

Write-Host "6. 📋 Environment Variables Check" -ForegroundColor Yellow
Write-Host "----------------------------------" -ForegroundColor Yellow

if ($frontendRunning) {
    Print-Info "Frontend environment variables:"
    try {
        docker exec $frontendContainer env | Select-String -Pattern "(NEXT_PUBLIC_|NODE_ENV|SUPABASE)" | Sort-Object
    } catch {
        Write-Host "  Could not fetch frontend env vars" -ForegroundColor Red
    }
}

if ($backendRunning) {
    Print-Info "Backend environment variables:"
    try {
        docker exec $backendContainer env | Select-String -Pattern "(NODE_ENV|DATABASE_URL|SUPABASE|PORT)" | Sort-Object
    } catch {
        Write-Host "  Could not fetch backend env vars" -ForegroundColor Red
    }
}
Write-Host ""

Write-Host "7. 📊 Resource Usage" -ForegroundColor Yellow
Write-Host "--------------------" -ForegroundColor Yellow
try {
    docker stats --no-stream --format "table {{.Container}}`t{{.CPUPerc}}`t{{.MemUsage}}`t{{.NetIO}}" | Select-String -Pattern "(frontend|backend|traefik)"
} catch {
    Write-Host "Error getting resource usage: $_" -ForegroundColor Red
}
Write-Host ""

Write-Host "8. 📝 Recent Logs (Last 10 lines)" -ForegroundColor Yellow
Write-Host "----------------------------------" -ForegroundColor Yellow

if ($frontendRunning) {
    Print-Info "Frontend logs:"
    try {
        docker logs --tail 10 $frontendContainer 2>&1
    } catch {
        Write-Host "Could not fetch frontend logs" -ForegroundColor Red
    }
    Write-Host ""
}

if ($backendRunning) {
    Print-Info "Backend logs:"
    try {
        docker logs --tail 10 $backendContainer 2>&1
    } catch {
        Write-Host "Could not fetch backend logs" -ForegroundColor Red
    }
    Write-Host ""
}

if ($traefikRunning) {
    Print-Info "Traefik logs:"
    try {
        docker logs --tail 10 $traefikContainer 2>&1
    } catch {
        Write-Host "Could not fetch Traefik logs" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host "9. 🔍 SSL Certificate Status" -ForegroundColor Yellow
Write-Host "-----------------------------" -ForegroundColor Yellow

foreach ($domain in $domains) {
    try {
        $cert = [System.Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}
        $req = [System.Net.WebRequest]::Create("https://$domain")
        $req.Timeout = 10000
        $response = $req.GetResponse()
        $cert = $req.ServicePoint.Certificate
        if ($cert) {
            $expiry = [DateTime]::Parse($cert.GetExpirationDateString())
            Print-Status $true "$domain SSL certificate (expires: $expiry)"
        } else {
            Print-Status $false "$domain SSL certificate (not found)"
        }
        $response.Close()
    } catch {
        Print-Status $false "$domain SSL certificate (check failed)"
    }
}
Write-Host ""

Write-Host "10. 🎯 Quick Fix Recommendations" -ForegroundColor Yellow
Write-Host "--------------------------------" -ForegroundColor Yellow

if (-not $frontendRunning) {
    Print-Warning "Frontend container is not running - check deployment logs"
}

if (-not $backendRunning) {
    Print-Warning "Backend container is not running - check deployment logs"
}

if (-not $traefikRunning) {
    Print-Warning "Traefik is not running - check reverse proxy configuration"
}

Write-Host ""
Write-Host "🏁 Health Check Complete" -ForegroundColor Green
Write-Host "========================" -ForegroundColor Green
Write-Host "Run this script regularly to monitor your application health." -ForegroundColor Gray
Write-Host "For detailed logs, use: docker logs <container_name>" -ForegroundColor Gray
Write-Host "For real-time monitoring, use: docker logs -f <container_name>" -ForegroundColor Gray
Write-Host ""
Write-Host "💡 To run this script on Coolify server:" -ForegroundColor Cyan
Write-Host "   1. Upload this script to your server" -ForegroundColor Gray
Write-Host "   2. Run it: powershell -ExecutionPolicy Bypass -File coolify-health-check.ps1" -ForegroundColor Gray
Write-Host "   Or on Linux: pwsh coolify-health-check.ps1" -ForegroundColor Gray
Write-Host ""