# Kubernetes Cluster Setup Guide for Hackathon II

**Purpose**: Set up Minikube Kubernetes cluster for deploying Dapr + Kafka

**Estimated Time**: 15-30 minutes (depending on internet speed)

---

## Option 1: Using Minikube (Recommended)

### Step 1: Install Minikube

#### Download Minikube (PowerShell as Administrator)

```powershell
# Create installation directory
New-Item -ItemType Directory -Force -Path "C:\Program Files\Minikube"

# Download Minikube
$url = "https://github.com/kubernetes/minikube/releases/latest/download/minikube-windows-amd64.exe"
$output = "C:\Program Files\Minikube\minikube.exe"

Write-Host "Downloading Minikube..."
Invoke-WebRequest -Uri $url -OutFile $output

# Add to PATH
$env:Path += ";C:\Program Files\Minikube"
[Environment]::SetEnvironmentVariable("Path", $env:Path, [System.EnvironmentVariableTarget]::Machine)

Write-Host "Minikube installed successfully!"
```

#### Verify Installation

```powershell
minikube version
```

Expected output: `minikube version: v1.x.x`

---

### Step 2: Install Docker Desktop (Required for Minikube)

1. **Download Docker Desktop**: https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe

2. **Run Installer** and follow these steps:
   - Accept license agreement
   - Choose "Use WSL 2 instead of Hyper-V" (recommended)
   - Click "Install"

3. **After Installation**:
   - Start Docker Desktop
   - Wait for Docker to start (whale icon in system tray should be steady)

4. **Verify Docker**:
   ```powershell
   docker --version
   docker ps
   ```

---

### Step 3: Start Minikube Cluster

```powershell
# Start Minikube with recommended resources for Hackathon II
minikube start --cpus=4 --memory=8192 --disk-size=50gb --driver=docker

# This will:
# - Allocate 4 CPUs
# - Allocate 8GB RAM
# - Allocate 50GB disk space
# - Use Docker as the driver
```

**Expected Output:**
```
* minikube v1.x.x on Microsoft Windows 11
* Using the docker driver based on existing profile
* Starting "minikube" control plane node
* Preparing Kubernetes v1.x.x on Docker x.x.x ...
* Verifying Kubernetes components...
* Enabled addons: default-storageclass, storage-provisioner
* Done! kubectl is now configured to use "minikube" cluster
```

---

### Step 4: Verify Cluster

```powershell
# Check cluster info
kubectl cluster-info

# Check nodes
kubectl get nodes

# Expected output:
# NAME       STATUS   ROLES           AGE   VERSION
# minikube   Ready    control-plane   1m    v1.x.x
```

---

## Option 2: Docker Desktop Kubernetes (Alternative)

If you already have Docker Desktop installed, you can enable its built-in Kubernetes:

### Step 1: Enable Kubernetes in Docker Desktop

1. Open Docker Desktop
2. Go to **Settings** (gear icon)
3. Select **Kubernetes** from left menu
4. Check **"Enable Kubernetes"**
5. Click **"Apply & Restart"**
6. Wait for Kubernetes to start (may take 2-3 minutes)

### Step 2: Verify

```powershell
kubectl cluster-info
kubectl get nodes
```

---

## Troubleshooting

### Issue: "minikube command not found"

**Solution**: Add Minikube to PATH manually:

```powershell
$env:Path += ";C:\Program Files\Minikube"
[Environment]::SetEnvironmentVariable("Path", $env:Path, [System.EnvironmentVariableTarget]::Machine)
```

Then restart PowerShell.

---

### Issue: "driver 'docker' not found"

**Solution**: Ensure Docker Desktop is running:

```powershell
docker ps
```

If Docker is not running, start Docker Desktop and wait for it to fully start.

---

### Issue: "insufficient memory"

**Solution**: Reduce Minikube resource allocation:

```powershell
minikube start --cpus=2 --memory=4096 --driver=docker
```

---

### Issue: "Hyper-V not enabled" (if using Hyper-V driver)

**Solution**: Enable Hyper-V (requires Windows Pro/Enterprise):

```powershell
# Run as Administrator
Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V -All
Restart-Computer
```

Or use Docker driver instead:
```powershell
minikube start --driver=docker
```

---

## Next Steps After Cluster Setup

Once Minikube is running successfully, proceed with:

1. **Install Helm** (Package Manager for Kubernetes)
2. **Install Dapr CLI**
3. **Deploy Dapr on Kubernetes**
4. **Deploy Redpanda (Kafka)**
5. **Create Kafka Topics**
6. **Apply Dapr Components**

See: `deploy-k8s.ps1` for automated deployment script.

---

## Quick Verification Checklist

- [ ] Minikube installed: `minikube version`
- [ ] Docker running: `docker ps`
- [ ] Cluster started: `minikube status`
- [ ] kubectl configured: `kubectl cluster-info`
- [ ] Nodes ready: `kubectl get nodes`

---

## Estimated Time

- **Minikube Installation**: 5-10 minutes
- **Docker Desktop Setup**: 5-10 minutes
- **Cluster Start**: 2-5 minutes
- **Verification**: 1-2 minutes

**Total**: 15-30 minutes

---

## Resources

- **Minikube Docs**: https://minikube.sigs.k8s.io/docs/
- **Docker Desktop**: https://www.docker.com/products/docker-desktop/
- **Hackathon II Guide**: `specs/005-advanced-cloud-deployment/DEPLOYMENT_GUIDE.md`

---

**Status**: READY TO START SETUP  
**Last Updated**: 2026-03-26
