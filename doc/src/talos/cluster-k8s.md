---
title: Przygotowanie Kubernetes
order: 4
icon: https://cdn.simpleicons.org/kubernetes/326CE5
category:
  - Guide
---

Klaster Kubernetes Talosa po zakończeniu procesu bootstrap nie jest jeszcze gotowy do uruchamiania na nim aplikaji. Brakuje w nim takich usług jak ingress, loadbalancer oraz monitoring. Trzeba je zainstalować w kolejnym kroku.

Proces warto zacząć od bootstrapu FluxCD. Dzięki temu będzie można utworzyć część zasobów automatycznie.

## FluxCD
<!-- @include: ../kubernetes/flux.md{87-105} -->

### Kustomization
<!-- @include: ../kubernetes/flux.md{143-173} -->

Więcej szczegółów dotyczących FluxCD: [Kubernetes/FluxCD](/kubernetes/flux)

## SOPS

### Instalacja klucza age
<!-- @include: ../kubernetes/sops.md{45-52} -->

### Konfiguracja w repozytorium
<!-- @include: ../kubernetes/sops.md{56-99} -->

Więcej szczegółów dotyczących SOPS: [Kubernetes/SOPS](/kubernetes/sops)

## Load Balancer
## Ingress
