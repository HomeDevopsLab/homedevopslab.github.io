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

### Instalacja

```bash :no-line-numbers
kubectl apply -f https://raw.githubusercontent.com/metallb/metallb/v0.16.1/config/manifests/metallb-native.yaml
```

### Konfiguracja

Trzeba skonfigurować rozgłaszanie adresów IP oraz pulę z której może korzystać MetalLB. Konfiguracja zostanie zapisana w **clusters/talos-dev/metallb**. FluxCD zajmie się wdrożeniem w klastrze.

```yaml title="clusters/talos-dev/metallb/advertisement.yaml"
apiVersion: metallb.io/v1beta1
kind: L2Advertisement
metadata:
  name: example
  namespace: metallb-system
```

```yaml title="clusters/talos-dev/metallb/addresspool.yaml"
apiVersion: metallb.io/v1beta1
kind: IPAddressPool
metadata:
  name: metallb-ip-pool
  namespace: metallb-system
spec:
  addresses:
  - 192.168.3.170-192.168.3.179
```

Adresacja dla **IPAddressPool** nie może być przez nic innego używana.

## Ingress
