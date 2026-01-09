# ADR-003: Persistent Storage Solution for Kubernetes

## Status
Proposed

## Date
2026-01-09

## Context
The Evolution of Todo application requires persistent storage for its database and shared data. In a Kubernetes environment, storage must persist across pod restarts, rescheduling, and deployments. The solution must work reliably in local development environments while providing a path to production-grade storage solutions. The choice affects data durability, accessibility, and scalability.

## Decision
We will use Kubernetes PersistentVolumeClaims (PVCs) with hostPath provisioner for local development. This approach provides persistent storage that survives pod restarts and rescheduling while being simple to set up in local environments. For production deployments, this will migrate to cloud provider storage solutions (AWS EBS, GCP Persistent Disk, Azure Disk, etc.).

## Consequences
### Positive
- Provides true persistence across pod lifecycle events
- Simple to configure and understand in local environments
- Follows Kubernetes best practices for persistent storage
- Clear migration path to production storage solutions
- Compatible with backup and snapshot operations
- Supports the required access modes for the application

### Negative
- hostPath volumes are node-specific and won't work in multi-node clusters
- Less resilient than distributed storage solutions
- Requires careful management of disk space on the host
- Not suitable for production environments
- May have performance characteristics different from cloud storage

## Alternatives
- **NFS (Network File System)**: Shared network storage. Rejected because it adds infrastructure complexity for local development.
- **CephFS**: Distributed storage solution. Rejected because it's overly complex for local development needs.
- **Cloud-specific solutions**: AWS EBS, GCP Persistent Disk, etc. Rejected because they don't work in local development environments.
- **StatefulSets with dynamic provisioning**: More complex Kubernetes resource. Rejected because hostPath is sufficient for local development requirements.

## References
- plan.md: Implementation Plan for Phase IV
- research.md: Research findings on persistent storage options
- spec.md: Feature specification for Phase IV
- data-model.md: Data model defining storage requirements