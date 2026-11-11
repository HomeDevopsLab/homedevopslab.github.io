---
layout: LabHome
icon: house
title: Home

hero:
  title: Angrybits Homelab
  tagline: Infrastruktura jako kod, automatyzacja jako standard
  image: /logo.svg
  imageAlt: Logo Angrybits Homelab — zdenerwowany procesor
  actions:
    - text: Baza Wiedzy
      link: "#baza-wiedzy"
      type: primary

milestones:
  title: Kamienie milowe
  image: /assets/image/milestones.jpg
  imageAlt: Ścieżka rozwoju homelaba — od dwóch Raspberry Pi, przez NAS i repozytorium IaC, po klaster serwerów
  items:
    - date: 25.02.2023
      text: Uruchamiam 2-node cluster na Raspberry Pi4
    - date: 17.06.2023
      text: Cluster zwiększa się o dwa RPi + serwer Proxmox
    - date: 18.04.2025
      text: Uruchamiam duży NAS (8TB) do backupów
    - date: 11.07.2025
      text: Centralne repozytorium IaC (Terragrunt / Terraform / Ansible)
    - date: 21.02.2026
      text: "Pełne capacity klastra Proxmox: 3x 64GB RAM"

knowledge:
  id: baza-wiedzy
  title: Baza Wiedzy
  description: Wybierz interesujący Cię obszar, aby przejść do szczegółów
  cards:
    - title: Proxmox Cluster
      icon: server
      details: Opis architektury clustra proxmox
      link: /proxmox/
    - title: Talos Cluster
      icon: https://cdn.simpleicons.org/talos/fff
      details: Budowa klastra Kubernetes z wykorzystaniem dystrybucji Talos Linux
      link: /talos/
    - title: Kubernetes Cluster
      icon: dharmachakra
      details: Budowa lokalnego clustra kubernetes
      link: /kubernetes/
    - title: GitOps
      icon: infinity
      details: Zarządzanie środowiskiem w oparciu o repozytoria git
      link: /gitops/
    - title: Security
      icon: shield
      details: Backupy i ciągłość działania środowiska
      link: /security/

sections:
  - title: Wirtualizacja & High Availability
    description: Ultra-niezawodne środowisko obliczeniowe oparte o 3-węzłowy klaster hypervisorów Proxmox VE. Dzięki pełnej integracji hiperkonwergentnej, awaria pojedynczego serwera nie przerywa działania krytycznych usług.
    cta:
      text: Zobacz architekturę Proxmox
      link: /proxmox/
    image: /assets/image/rack.jpg
    imageAlt: Szafa rack z klastrem Proxmox VE i konsolą wysokiej dostępności
    stats:
      - value: 42 vCPU
        label: Moc obliczeniowa klastra
      - value: 184 GB RAM
        label: Pamięć z obsługą HA
      - value: 14 TB Ceph NVMe
        label: Replikowany storage

  - title: Orkiestracja & GitOps (Kubernetes)
    description: Główne, wysoce dostępne środowisko aplikacyjne klastra k3s. Całość infrastruktury oraz cykl życia usług są zarządzane w pełni deklaratywnie, eliminując potrzebę ręcznej konfiguracji i wdrażania zmian przez SSH.
    cta:
      text: Zobacz dokumentację Kubernetes
      link: /kubernetes/
    image: /assets/image/k3s.jpg
    imageAlt: Klaster k3s zarządzany przez FluxCD z repozytorium Git
    features:
      - title: 100% GitOps Driven
        details: Zero manualnych zmian – stan klastra zsynchronizowany z Git
      - title: FluxCD Reconcile
        details: Ciągłe sprawdzanie spójności i automatyczne wdrażanie poprawek
      - title: Helm & Kustomize
        details: Pełna standaryzacja, reużywalność kodu i separacja środowisk

  - title: Ekosystem GitOps — Repozytoria Infrastruktury
    description: Całe środowisko homelab utrzymywane jest w oparciu o rozproszony ekosystem repozytoriów Git, gdzie każde z nich odpowiada za osobny etap cyklu życia infrastruktury — od provisioningu, przez utrzymanie, aż po obserwowalność. Dzięki takiemu podziałowi każda zmiana jest w pełni wersjonowana, powtarzalna i łatwa do audytu.
    cta:
      text: Zobacz repozytoria GitOps
      link: /gitops/
    image: /assets/image/gitops-ecosystem.jpg
    imageAlt: Ekosystem repozytoriów GitOps homelaba
    features:
      - title: Infrastructure as Code
        details: angrybits-homelab — 3-warstwowy kod IaC zarządzający VM, kontenerami Docker, firewallem, DNS i inventory
      - title: Provisioning & Utrzymanie
        details: proxmox-vm-templates (obrazy cloud-init) oraz homelab-tasks (aktualizacje, dystrybucja kluczy SSH)
      - title: Monitoring
        details: proxmox-metrics, grafana-matrix-api — alerty progowe

  - title: Bezpieczeństwo & Ciągłość Działania
    description: Dane w homelabie chronione są dwuwarstwowo — snapshotami całych maszyn wirtualnych na poziomie klastra Proxmox oraz szczegółowymi zrzutami baz danych. Kopie baz spełniają kryteria strategii 3-2-1, a każde zadanie backupu raportuje własne metryki, dzięki czemu awaria procesu jest widoczna zanim kopia okaże się potrzebna.
    cta:
      text: Zobacz strategię backupów
      link: /security/
    image: /assets/image/homelab-security.jpg
    imageAlt: Strategia backupów 3-2-1 — Proxmox, NAS, AWS S3 i Grafana
    features:
      - title: Snapshoty maszyn wirtualnych
        details: Nocny cronjob klastra Proxmox zapisujący pełne obrazy VM na NAS przez NFS
      - title: Strategia 3-2-1
        details: Bazy danych kopiowane równolegle na lokalny NAS oraz do AWS S3 — dwa nośniki, jedna kopia off-site
      - title: Obserwowalność backupów
        details: Rozmiar snapshotu i czas wykonania każdego zadania trafiają do Prometheusa i na dashboardy Grafany
---
