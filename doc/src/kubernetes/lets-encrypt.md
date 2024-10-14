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

Certmanager jest odpowiedzialny za instalację certyfikatów SSL dla aplikacji, które mają skonfigurowaną obsługę SSL. Zainstalowane
certyfikaty znajdują się w namespace `default`, tam gdzie uruchomione są aplikacje.

```yaml {3}
ingress:
  enabled: true
  ssl: true
```

### Instalacja

```bash
kubectl apply -f https://github.com/jetstack/cert-manager/releases/download/v1.11.0/cert-manager.yaml
```

Certnamager instaluje się w namespace `cert-manager`.

## Cluster issuer

## Middleware

## Traefik
