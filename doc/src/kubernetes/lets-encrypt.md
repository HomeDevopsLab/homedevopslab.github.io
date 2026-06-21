---
title: Let's encrypt
icon: lock
order: 5
category:
  - Guide
tag:
  - kubernetes
---

## Certmanager

Certmanager jest odpowiedzialny za instalację certyfikatów SSL dla aplikacji, które mają skonfigurowaną obsługę SSL. Zainstalowane certyfikaty znajdują się w namespace `default`, tam gdzie uruchomione są aplikacje.

```yaml {3}
ingress:
  enabled: true
  ssl: true
```

### Instalacja

::: note
W trakcie pisania dokumentacji, aktualną wersją certmanagera jest `v1.20.2`. W przypadku stawiania nowego klastra warto wybrać najnowszą
https://cert-manager.io/docs/installation/kubectl/
:::

```bash :no-line-numbers
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.20.2/cert-manager.yaml
```

Certnamager instaluje się w namespace `cert-manager`.

```bash :no-line-numbers title="🖥️ kubectl get pods --namespace cert-manager"
NAME                                       READY   STATUS    RESTARTS   AGE
cert-manager-69c7fcbf78-hdvl4              1/1     Running   0          3h4m
cert-manager-cainjector-69f8c8cdbf-rcfjq   1/1     Running   0          3h4m
cert-manager-webhook-84fd89df64-z9gtp      1/1     Running   0          3h4m
```

## Cluster issuer

### Opis działania

W trakcie uruchamiania aplikacji w klastrze, jednocześnie uruchamia się pod **cluster-issuer**, który wystawia wygenerowany w imieniu aplikacji CSR (Certificate Sign Request). Jest on wystawiony pod adresem `http://aplikacja.domena.com/.well-known/`. Let's encrypt pobiera z tego adresu CSR, następnie podpisuje go i udostępnia do pobrania. Cert manager instaluje podpisany certyfikat w clustrze.

![Lets encrypt infrastructure](/assets/image/letsencrypt-infra.png)

::: important DNS
W obecnej architekturze, do poprawnego działania certmanagera musiałem zastosować wewnętrzną strefę dns `example.com`, która odpowiada wewnętrznym adresem ip dla subdomen.
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

Poniższa konfiguracja dotyczy traefika, który działa jako ingress controller w klastrze kubernetes.

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

Dzięki tej konfiguracji traefik komunikuje się z cluster-issuerem, żeby zarządać wystawienia certyfikatu a także konfiguruje redirect na
https dla aplikacji za pomocą middleware'a.
