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

W trakcie uruchamiania aplikacji w klastrze, jednocześnie uruchamia się pod **cluster-issuer**, który wystawia wygenerowany w imieniu
aplikacji CSR (Certificate Sign Request). Jest on wystawiony pod adresem `http://aplikacja.domena.com/.well-known/`. Let's encrypt pobiera z
tego adresu CSR, następnie podpisuje go i udostępnia do pobrania. Cert manager instaluje podpisany certyfikat w clustrze.

![Lets encrypt infrastructure](/assets/image/letsencrypt-infra.png)

::: important DNS
W obecnej architekturze, do poprawnego działania certmanagera musiałem zastosować wewnętrzną strefę dns `example.com`, która odpowiada
wewnętrznym adresem ip dla subdomen.
:::
Konfiguracja ClusterIssuera

```yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt
  namespace: default
spec:
  acme:
    email: admin@domena.com
    server: https://acme-v02.api.letsencrypt.org/directory
    privateKeySecretRef:
      name: letsencrypt
    solvers:
      - http01:
          ingress:
            class: traefik
```

## Middleware

Komponent Middleware jest używany do automatycznego ustawiania przekierowania `HTTP -> HTTPS`

```yaml
apiVersion: traefik.containo.us/v1alpha1
kind: Middleware
metadata:
  name: redirect-https
  namespace: default
spec:
  redirectScheme:
    scheme: https
    permanent: true
```

## Traefik
