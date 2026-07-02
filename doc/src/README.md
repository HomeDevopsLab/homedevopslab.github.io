---
home: true
icon: house
title: Home
heroImage: /assets/image/homelab-logo2.png
bgImage: /assets/image/hero-bg-light.svg
bgImageDark: /assets/image/hero-bg.svg
bgImageStyle:
  background-attachment: fixed
  background-position: center -15%
  background-size: contain
  background-repeat: no-repeat
  filter: brightness(0.80) contrast(0.7)
heroText: Angrybits Homelab
tagline: Dokumentacja mojego środowiska homelab

highlights:

- header: Kamienie milowe
  image: /assets/image/highlights-img.png
  bgImage: /assets/image/highlights-light.svg
  bgImageDark: /assets/image/highlights.svg
  bgImageStyle:
    background-size: cover
    background-position: center
    filter: brightness(0.5) contrast(0.8)
  highlights:
    - title: "<strong>🚀 25.02.2023</strong> — Uruchamiam 2-node cluster na Raspberry Pi4"
    - title: "<strong>🏗️ 17.06.2023</strong> — Cluster zwiększa się o dwa RPi + serwer Proxmox"
    - title: "<strong>💾 18.04.2025</strong> — Uruchamiam duży NAS (8TB) do backupów"
    - title: "<strong>🛠️ 11.07.2025</strong> — Centralne repozytorium IaC (Terragrunt / Terraform / Ansible)"
    - title: "<strong>🔥 21.02.2026</strong> — Pełne capacity klastra Proxmox: 3x 64GB RAM"

- header: Baza Wiedzy
  description: Wybierz interesujący Cię obszar, aby przejść do szczegółów
  image: /assets/image/docs-image.png
  bgImage: https://theme-hope-assets.vuejs.press/bg/2-light.svg
  bgImageDark: https://theme-hope-assets.vuejs.press/bg/2-dark.svg
  bgImageStyle:
    background-repeat: repeat
    background-size: initial
  features:
    - title: Proxmox Cluster
      icon: server
      details: Opis architektury clustra proxmox
      link: ./proxmox/
    - title: Kubernetes Cluster
      icon: dharmachakra
      details: Budowa lokalnego clustra kubernetes
      link: ./kubernetes/
    - title: GitOps
      icon: infinity
      details: Zarządzanie środowiskiem w oparciu o repozytoria git
      link: ./gitops/

- header: Wirtualizacja & High Availability
  description: 'Ultra-niezawodne środowisko obliczeniowe oparte o 3-węzłowy klaster hypervisorów Proxmox VE. Dzięki pełnej integracji hiperkonwergentnej, awaria pojedynczego serwera nie przerywa działania krytycznych usług.<br/><br/><a href="./proxmox/" class="vp-section-cta">Zobacz architekturę Proxmox →</a>'
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

- header: Orkiestracja & GitOps (Kubernetes)
  description: 'Główne, wysoce dostępne środowisko aplikacyjne klastra k3s. Całość infrastruktury oraz cykl życia usług są zarządzane w pełni deklaratywnie, eliminując potrzebę ręcznej konfiguracji i wdrażania zmian przez SSH.<br/><br/><a href="./kubernetes/" class="vp-section-cta">Zobacz dokumentację Kubernetes →</a>'
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
      details: Zero manualnych zmian – stan klastra zsynchronizowany z Git
    - title: <strong>FluxCD Reconcile</strong>
      icon: infinity
      details: Ciągłe sprawdzanie spójności i automatyczne wdrażanie poprawek
    - title: <strong>Helm & Kustomize</strong>
      icon: cubes
      details: Pełna standaryzacja, reużywalność kodu i separacja środowisk

- header: Ekosystem GitOps — Repozytoria Infrastruktury
  description: 'Całe środowisko homelab utrzymywane jest w oparciu o rozproszony ekosystem repozytoriów Git, gdzie każde z nich odpowiada za osobny etap cyklu życia infrastruktury — od provisioningu, przez utrzymanie, aż po obserwowalność. Dzięki takiemu podziałowi każda zmiana jest w pełni wersjonowana, powtarzalna i łatwa do audytu.<br/><br/><a href="./gitops/" class="vp-section-cta">Zobacz repozytoria GitOps →</a>'
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
      details: angrybits-homelab — 3-warstwowy kod IaC zarządzający VM, kontenerami Docker, firewallem, DNS i inventory
    - title: <strong>Provisioning & Utrzymanie</strong>
      icon: arrows-rotate
      details: proxmox-vm-templates (obrazy cloud-init) oraz homelab-tasks (aktualizacje, dystrybucja kluczy SSH)
    - title: <strong>Monitoring & Auto-remediation</strong>
      icon: bell
      details: proxmox-metrix, grafana-matrix-api, grafana-alerts-remediate — alerty progowe i częściowa autoremediacja
