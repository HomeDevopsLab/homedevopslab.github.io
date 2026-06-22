---
title: Let's encrypt
icon: lock
order: 4
category:
  - Guide
tag:
  - kubernetes
---

## cert-manager

cert-manager jest odpowiedzialny za instalację certyfikatów SSL dla aplikacji, które mają skonfigurowaną obsługę SSL. Zainstalowane certyfikaty znajdują się w namespace `default`, tam gdzie uruchomione są aplikacje.

```yaml {3}
ingress:
  enabled: true
  ssl: true
```

### Instalacja

::: note
W momencie pisania tej dokumentacji aktualna wersja cert-managera to `v1.20.2`. W przypadku stawiania nowego klastra warto wybrać najnowszą:
[dokumentacja instalacji](https://cert-manager.io/docs/installation/kubectl/)
:::

```bash :no-line-numbers
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.20.2/cert-manager.yaml
```

cert-manager instaluje się w namespace `cert-manager`.

```bash :no-line-numbers title="🖥️ kubectl get pods --namespace cert-manager"
NAME                                       READY   STATUS    RESTARTS   AGE
cert-manager-69c7fcbf78-hdvl4              1/1     Running   0          3h4m
cert-manager-cainjector-69f8c8cdbf-rcfjq   1/1     Running   0          3h4m
cert-manager-webhook-84fd89df64-z9gtp      1/1     Running   0          3h4m
```


## Cluster issuer

Podczas instalacji aplikacji w klastrze jednocześnie uruchamia się pod **cluster-issuer**, który wystawia wygenerowany w imieniu aplikacji CSR (Certificate Signing Request). Jest on wystawiony pod adresem `http://aplikacja.domena.com/.well-known/`. Let's encrypt pobiera z tego adresu CSR, następnie podpisuje go i udostępnia do pobrania. cert-manager instaluje podpisany certyfikat w klastrze. Dzieje się to automatycznie. Po wykonanym zadaniu pod cert-managera kończy działanie.

![Lets encrypt infrastructure](/assets/image/letsencrypt-infra.png)

::: important DNS
W obecnej architekturze, do poprawnego działania cert-managera należy zastosować wewnętrzną strefę DNS `example.com`, która odpowiada wewnętrznym adresem IP dla subdomen.
:::

Aby działało generowanie certyfikatów SSL, trzeba zainstalować na klastrze zasób ClusterIssuer.

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

Komponent Middleware jest używany do automatycznego ustawiania przekierowania `HTTP → HTTPS`.

```yaml
apiVersion: traefik.io/v1alpha1
kind: Middleware
metadata:
  name: redirect-https
  namespace: default
spec:
  redirectScheme:
    scheme: https
    permanent: true
```

## Wdrożenie przez Flux

Dzięki temu, że klaster ma uruchomionego Fluxa, wystarczy utworzyć katalog `apps/certmanager` z oboma manifestami: `ClusterIssuer` oraz `Middleware`. Po opublikowaniu plików w repozytorium Flux wykona automatycznie wdrożenie.

## Traefik

Poniższa konfiguracja dotyczy Traefika, który działa jako ingress controller w klastrze Kubernetes.

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress
  namespace: default
  annotations:
    kubernetes.io/ingress.class: traefik
    cert-manager.io/cluster-issuer: letsencrypt
    traefik.ingress.kubernetes.io/router.middlewares: default-redirect-https@kubernetescrd
```

Dzięki tej konfiguracji Traefik komunikuje się z cluster-issuerem, żeby zażądać wystawienia certyfikatu, a także konfiguruje przekierowanie na HTTPS dla aplikacji za pomocą komponentu Middleware.

::: info HelmChart
Ta konfiguracja jest automatycznie generowana przez helmchart, jeśli zostanie włączona opcja `ssl: true` w konfiguracji ingress.
:::
