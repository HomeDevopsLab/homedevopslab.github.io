---
home: true
icon: house
title: Home
heroImage: /assets/image/homelab-logo2.png
bgImage: /assets/image/hero-bg.svg
bgImageDark: /assets/image/hero-bg.svg
bgImageStyle:
  background-attachment: fixed
  background-position: center -15%
  background-size: contain # <--- KLUCZOWA ZMIANA
  background-repeat: no-repeat # Zabezpieczenie przed kafelkowaniem
  filter: brightness(0.80) contrast(0.7)
heroText: Angrybits Homelab
tagline: My homelab environment documentation

highlights:
  - header: Milestones
    image: /assets/image/highlights-img.png
    bgImage: /assets/image/highlights-light.svg
    bgImageDark: /assets/image/highlights.svg
    bgImageStyle:
      background-size: cover
      background-position: center
      filter: brightness(0.5) contrast(0.8) # Przyciemnia niebieską sieć i wtapia ją w głęboki granat
    highlights:
      - title: "<strong>🚀 25.02.2023</strong> — Launching a 2-node cluster on Raspberry Pi 4"
      - title: "<strong>🏗️ 17.06.2023</strong> — Cluster scales up with two additional RPis and Proxmox server"
      - title: "<strong>💾 18.04.2025</strong> — Deploying a large NAS (8TB) for backups"
      - title: "<strong>🛠️ 11.07.2025</strong> — Central IaC Repository (Terragrunt / Terraform / Ansible)"
      - title: "<strong>🔥 21.02.2026</strong> — Proxmox cluster reaches full capacity: 3x 64GB RAM"

  - header: Knowledge Base
    description: Select a category below to explore the documentation
    image: /assets/image/docs-image.png
    bgImage: https://theme-hope-assets.vuejs.press/bg/2-light.svg
    bgImageDark: https://theme-hope-assets.vuejs.press/bg/2-dark.svg
    bgImageStyle:
      background-repeat: repeat
      background-size: initial
    features:
      - title: Proxmox Cluster
        icon: server
        details: Proxmox Cluster Architecture Overview
        link: ./proxmox/
      - title: Kubernetes Cluster
        icon: dharmachakra
        details: Building a local Kubernetes cluster
        link: ./kubernetes/
      - title: GitOps
        icon: infinity
        details: Git-driven environment management
        link: ./gitops/

  - header: Virtualization & High Availability
    description: 'An ultra-reliable computing environment based on a 3-node Proxmox VE hypervisor cluster. Thanks to full hyper-converged integration, a single server failure does not interrupt the operation of critical services.<br/><br/><a href="./proxmox/" class="vp-section-cta">Explore Proxmox architecture →</a>'
    image: /assets/image/rack.jpg
    bgImage: /assets/image/virtualization-bg-light.svg
    bgImageDark: /assets/image/virtualization-bg.svg
    bgImageStyle:
      background-size: cover
      background-position: center
      filter: brightness(0.5) contrast(0.8)
    highlights:
      - title: <strong>42 vCPU</strong> – Moc obliczeniowa klastra
        icon: microchip
      - title: <strong>184 GB RAM</strong> – Pamięć z obsługą HA
        icon: memory
      - title: <strong>14 TB Ceph NVMe</strong> – Replikowany storage
        icon: hard-drive
  - header: Orchestration & GitOps (Kubernetes)
    description: 'A primary, highly available application environment powered by a k3s cluster. The entire infrastructure and service lifecycle are managed declaratively, eliminating the need for manual configuration or deployments via SSH.<br/><br/><a href="./kubernetes/" class="vp-section-cta">Explore Kubernetes docs →</a>'
    image: /assets/image/k3s.jpg
    bgImage: /assets/image/cloudy-light.svg
    bgImageDark: /assets/image/cloudy.svg
    bgImageStyle:
      background-attachment: fixed
      background-position: center -15%
      background-size: contain
      filter: brightness(0.80) contrast(0.7)
    highlights:
      - title: <strong>100% GitOps Driven</strong>
        icon: code-branch
        details: Zero manual changes – cluster state is fully synchronized with Git.
      - title: <strong>FluxCD Reconcile</strong>
        icon: infinity
        details: Continuous consistency checks and automatic auto-remediation of drifts.
      - title: <strong>Helm & Kustomize</strong>
        icon: cubes
        details: Full standardization, code reusability, and environment isolation.

  - header: GitOps Ecosystem — Infrastructure Repositories
    description: 'The entire homelab environment is maintained through a distributed ecosystem of Git repositories, where each one owns a distinct stage of the infrastructure lifecycle — from provisioning, through maintenance, to observability. This split keeps every change fully versioned, repeatable, and easy to audit.<br/><br/><a href="./gitops/" class="vp-section-cta">Explore GitOps repositories →</a>'
    image: /assets/image/gitops-ecosystem.jpg
    bgImage: /assets/image/gitops-bg-light.svg
    bgImageDark: /assets/image/gitops-bg.svg
    bgImageStyle:
      background-size: cover
      background-position: center
      filter: brightness(0.5) contrast(0.8)
    highlights:
      - title: <strong>Infrastructure as Code</strong>
        icon: layer-group
        details: angrybits-homelab — a 3-layer IaC codebase managing VMs, Docker containers, firewall configuration, DNS, and inventory
      - title: <strong>Provisioning & Maintenance</strong>
        icon: arrows-rotate
        details: proxmox-vm-templates builds cloud-init images, while homelab-tasks handles recurring updates and SSH key distribution
      - title: <strong>Monitoring & Auto-remediation</strong>
        icon: bell
        details: proxmox-metrix, grafana-matrix-api, grafana-alerts-remediate — threshold alerts and partial automatic remediation
