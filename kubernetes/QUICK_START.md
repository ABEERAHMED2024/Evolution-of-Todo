# Quick Start Deployment Guide

**Prerequisite**: Docker Desktop Installed ✅

---

## **Step 1: Start Docker Desktop** (2 minutes)

1. **Open Docker Desktop**:
   - Press `Windows Key` and search for "Docker Desktop"
   - Click to open
   - Wait for whale icon in system tray to become steady (not animated)

2. **Verify Docker is Running**:
   ```powershell
   docker ps
   ```
   
   **Expected Output**:
   ```
   CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES
   ```
   (may be empty, which is fine)

---

## **Step 2: Install Minikube** (5 minutes)

Run this PowerShell command **as Administrator**:

```powershell
# Create installation directory
New-Item -ItemType Directory -Force -Path "C:\Program Files\Minikube"

# Download Minikube (this takes 2-3 minutes)
$url = "https://github.com/kubernetes/minikube/releases/latest/download/minikube-windows-amd64.exe"
$output = "C:\Program Files\Minikube\minikube.exe"

Write-Host "Downloading Minikube..." -ForegroundColor Cyan
Invoke-WebRequest -Uri $url -OutFile $output

# Add to PATH
$env:Path += ";C:\Program Files\Minikube"
[Environment]::SetEnvironmentVariable("Path", $env:Path, [System.EnvironmentVariableTarget]::Machine)

Write-Host "Minikube installed!" -ForegroundColor Green
Write-Host "Restart your terminal to use minikube command" -ForegroundColor Yellow
```

**After installation, CLOSE and REOPEN PowerShell**, then verify:

```powershell
minikube version
```

---

## **Step 3: Start Minikube Cluster** (3-5 minutes)

```powershell
# Start Minikube with Docker driver
minikube start --cpus=4 --memory=8192 --disk-size=50gb --driver=docker
```

**Expected Output**:
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

## **Step 4: Verify Cluster** (1 minute)

```powershell
kubectl cluster-info
kubectl get nodes
```

**Expected**:
```
Kubernetes control plane is running at https://...
minikube   Ready   control-plane   1m   v1.x.x
```

---

## **Step 5: Run Automated Deployment** (10-15 minutes)

```powershell
cd d:\Evolution-of-Todo\kubernetes
.\deploy-k8s.ps1
```

This script will automatically:
- ✅ Install Helm
- ✅ Install Dapr CLI  
- ✅ Initialize Dapr on Kubernetes
- ✅ Deploy Redpanda (Kafka)
- ✅ Create Kafka topics
- ✅ Apply Dapr components

---

## **Total Estimated Time**: 20-25 minutes

1. Start Docker Desktop: 2 min
2. Install Minikube: 5 min
3. Start Minikube: 3-5 min
4. Verify: 1 min
5. Automated Deployment: 10-15 min

---

## **Troubleshooting**

### Docker Desktop won't start?
- Ensure WSL 2 is enabled: `wsl --list --verbose`
- Restart your computer and try again

### Minikube download fails?
- Try downloading manually: https://github.com/kubernetes/minikube/releases/latest
- Save as `C:\Program Files\Minikube\minikube.exe`

### "driver 'docker' not found"?
- Make sure Docker Desktop whale icon is steady (not animated)
- Run: `docker ps` to verify Docker is running

---

## **Next Steps After Deployment**

Once deployment completes successfully:

1. ✅ Verify all pods running
2. ✅ Test event publishing
3. ✅ Record 90-second demo video
4. ✅ Submit to Hackathon II

---

**Ready to start? Begin with Step 1!** 🚀
