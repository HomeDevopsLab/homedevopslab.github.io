---
title: Kubernetes
index: false
icon: dharmachakra
category:
  - Guide
---
Kubernetes stanowi centralny punt w moim homelabie. Jest to miejsce w którym hostuję wszystkie aplikacje. Ruch internetowy skierowany na porty 80 i 443 skierowany jest na jeden zadresów IP wystawionych przez LoadBalancer wbudowany w K3S.

## Architektura
![Architektura Kubernetes w HomeLAB](/assets/image/kubernetes-arch.png)

## Implementacja klastra
Klaster, który powstał w oparciu o [K3S](https://k3s.io/) został zainicjowany w bardzo prostym kształcie:
* 1x master-node (Raspberry Pi4)
* 3x worker-nodes (Raspberry Pi4)
* 2x worker-nodes (Proxmox VM)

## Inicjalizacja klastra
### Przygotowanie Raspberry

Klaster został zainicjowany z pojedynczym master-nodem, który znajduje się na hoście k3s-master.

<Catalog />