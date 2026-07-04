---
title: Gitops
index: false
icon: infinity
category:
  - Guide
---

## Architektura

![Homelab repositories graph](/assets/image/homelab-ecosystem.svg)

Homelab składa się z kilku mniej lub bardziej zależnych od siebie repozytoriów. Dzięki temu podejściu jestem w stanie z użyciem kodu konfigurować i monitorować całe środowisko. Całe środowisko GitOps znajduje się na lokalnym Gitlabie.

## Wirtualizacja

::: info Repozytoria
- proxmox-vm-templates
- angrybit-homelab
:::

Wirtualizacja jest fundamentem działania homelabu. Platforma jest uruchomiona na klastrze Proxmox.

### Funkcjonalności

#### Template'y cloud-init

Do twoerzenia template'ów służy repozytorium `proxmox-vm-templates`. Dzięki niemu można tworzyć template'y dla każdej dystrybucji linuksa, która udostępnia obrazy cloud-init. Cloud-init oferuje możliwość wgrania kluczy ssh, instalację oprogramowania oraz wstępna konfigurację usług.

[Dokumentacja](/proxmox/vmtemplates)

#### Tworzenie VM

Maszyny wirtualne tworzone są z kodu w repozytorium `angrybit-homelab`. Funchonalność umożliwia stworzenie maszyny wirtualnej o dowolych parametrach (CPU/RAM/Dysk) na jednym z trzech węzłów klastra proxmox.

[Dokumentacja](/proxmox/vmmachines)

## Konteneryzacja
