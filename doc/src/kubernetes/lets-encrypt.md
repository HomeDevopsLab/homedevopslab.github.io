---
title: Let's encrypt
icon: lock
order: 3
category:
  - Guide
tag:
  - kubernetes
---

## Certmanager

Certmanager jest odpowiedzialny za wystawianie CSR (Certificate Sign Request) i pośredniczy w podpisywaniu certyfikatów SSL.

```bash
kubectl apply -f https://github.com/jetstack/cert-manager/releases/download/v1.11.0/cert-manager.yaml
```

Certnamager instaluje się w namespace `cert-manager`.

## Cluster issuer

## Middleware

## Traefik
