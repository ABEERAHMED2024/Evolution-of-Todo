# Data Model: Phase IV Local Kubernetes Deployment

## Application Pod
**Description**: Kubernetes pod containing one of the application services (frontend, backend, agent)
**Configuration**:
- Resource limits and requests
- Health checks (liveness/readiness probes)
- Environment variables and ConfigMap/Secret mounts

## Service
**Description**: Kubernetes service providing networking and load balancing for pods
**Configuration**:
- ClusterIP, NodePort, or LoadBalancer type
- Port mappings
- Selector for pod identification

## PersistentVolumeClaim
**Description**: Resource requesting persistent storage for data persistence
**Configuration**:
- Storage size requirements
- Access modes (ReadWriteOnce, ReadWriteMany)
- Storage class specification

## ConfigMap
**Description**: Kubernetes resource storing configuration parameters
**Configuration**:
- Environment-specific settings
- Application configuration
- Non-sensitive data only

## Secret
**Description**: Kubernetes resource storing sensitive information like API keys
**Configuration**:
- Encrypted storage
- Base64 encoded values
- Limited access permissions

## Ingress
**Description**: Kubernetes resource managing external access to services
**Configuration**:
- Host and path routing rules
- TLS/SSL termination
- Load balancer configuration

## HelmChart
**Description**: Package containing all Kubernetes manifests and configurations for the application
**Configuration**:
- Values customization
- Template definitions
- Dependency management

## NetworkPolicy
**Description**: Kubernetes resource defining network traffic rules between services
**Configuration**:
- Ingress and egress rules
- Pod selectors
- Namespace selectors

## RBAC Resources
**Description**: Kubernetes resources defining role-based access control
**Configuration**:
- Roles and RoleBindings
- ClusterRoles and ClusterRoleBindings
- ServiceAccounts