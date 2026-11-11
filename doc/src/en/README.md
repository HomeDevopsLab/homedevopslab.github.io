---
layout: SpaceHome
icon: house
title: Home

hero:
  title: Angrybits Homelab
  tagline: Infrastructure as code, automation as standard
  image: /logo.svg
  imageAlt: Angrybits Homelab logo — a planet with an orbit
  actions:
    - text: Knowledge Base
      link: "#knowledge-base"
      type: primary
    - text: Proxmox Architecture
      link: /en/proxmox/

milestones:
  title: Milestones
  image: /assets/image/milestones.jpg
  imageAlt: The homelab's growth path — from two Raspberry Pis, through a NAS and an IaC repository, to a server cluster
  items:
    - date: 25.02.2023
      text: Launching a 2-node cluster on Raspberry Pi 4
    - date: 17.06.2023
      text: Cluster scales up with two additional RPis and Proxmox server
    - date: 18.04.2025
      text: Deploying a large NAS (8TB) for backups
    - date: 11.07.2025
      text: Central IaC Repository (Terragrunt / Terraform / Ansible)
    - date: 21.02.2026
      text: "Proxmox cluster reaches full capacity: 3x 64GB RAM"

knowledge:
  id: knowledge-base
  title: Knowledge Base
  description: Select a category below to explore the documentation
  cards:
    - title: Proxmox Cluster
      icon: server
      details: Proxmox Cluster Architecture Overview
      link: /en/proxmox/
    - title: Talos Cluster
      icon: https://cdn.simpleicons.org/talos/fff
      details: Building a Kubernetes cluster on the Talos Linux distribution
      link: /en/talos/
    - title: Kubernetes Cluster
      icon: dharmachakra
      details: Building a local Kubernetes cluster
      link: /en/kubernetes/
    - title: GitOps
      icon: infinity
      details: Git-driven environment management
      link: /en/gitops/
    - title: Security
      icon: shield
      details: Backups and environment continuity
      link: /en/security/

sections:
  - title: Virtualization & High Availability
    description: An ultra-reliable computing environment based on a 3-node Proxmox VE hypervisor cluster. Thanks to full hyper-converged integration, a single server failure does not interrupt the operation of critical services.
    cta:
      text: Explore Proxmox architecture
      link: /en/proxmox/
    image: /assets/image/rack.jpg
    imageAlt: Server rack running the Proxmox VE cluster with a high-availability console
    stats:
      - value: 42 vCPU
        label: Cluster computing power
      - value: 184 GB RAM
        label: HA-backed memory pool
      - value: 14 TB Ceph NVMe
        label: Replicated storage

  - title: Orchestration & GitOps (Kubernetes)
    description: A primary, highly available application environment powered by a k3s cluster. The entire infrastructure and service lifecycle are managed declaratively, eliminating the need for manual configuration or deployments via SSH.
    cta:
      text: Explore Kubernetes docs
      link: /en/kubernetes/
    image: /assets/image/k3s.jpg
    imageAlt: k3s cluster reconciled by FluxCD from a Git repository
    features:
      - title: 100% GitOps Driven
        details: Zero manual changes – cluster state is fully synchronized with Git.
      - title: FluxCD Reconcile
        details: Continuous consistency checks and automatic auto-remediation of drifts.
      - title: Helm & Kustomize
        details: Full standardization, code reusability, and environment isolation.

  - title: GitOps Ecosystem — Infrastructure Repositories
    description: The entire homelab environment is maintained through a distributed ecosystem of Git repositories, where each one owns a distinct stage of the infrastructure lifecycle — from provisioning, through maintenance, to observability. This split keeps every change fully versioned, repeatable, and easy to audit.
    cta:
      text: Explore GitOps repositories
      link: /en/gitops/
    image: /assets/image/gitops-ecosystem.jpg
    imageAlt: The homelab's GitOps repository ecosystem
    features:
      - title: Infrastructure as Code
        details: angrybits-homelab — a 3-layer IaC codebase managing VMs, Docker containers, firewall configuration, DNS, and inventory
      - title: Provisioning & Maintenance
        details: proxmox-vm-templates builds cloud-init images, while homelab-tasks handles recurring updates and SSH key distribution
      - title: Monitoring
        details: proxmox-metrics, grafana-matrix-api — threshold alerts

  - title: Security & Business Continuity
    description: Homelab data is protected in two layers — snapshots of entire virtual machines at the Proxmox cluster level, and fine-grained dumps of the databases. Database copies satisfy the 3-2-1 strategy, and every backup job reports its own metrics, so a broken process becomes visible before the copy is actually needed.
    cta:
      text: Explore the backup strategy
      link: /en/security/
    image: /assets/image/homelab-security.jpg
    imageAlt: 3-2-1 backup strategy — Proxmox, NAS, AWS S3 and Grafana
    features:
      - title: Virtual machine snapshots
        details: A nightly Proxmox cluster cronjob writing full VM images to the NAS over NFS
      - title: 3-2-1 strategy
        details: Databases copied in parallel to the local NAS and to AWS S3 — two media types, one off-site copy
      - title: Backup observability
        details: Snapshot size and duration of every job land in Prometheus and on Grafana dashboards
---
