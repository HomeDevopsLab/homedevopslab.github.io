---
title: SOPS
icon: key
order: 6
category:
  - Guide
tag:
  - kubernetes
---

[SOPS](https://getsops.io/) jest narzędziem, które wykorzystuję do szyfrowania secretów kubernetes. Potrafi wykonać enkrypcję w oparciu o mechanizmy dostarczane przez chmury publiczne oraz lokalne narzędzia takie jak PGP oraz [Age](https://github.com/FiloSottile/age).

## Instalacja

::: important SOPS Install
Jeśli mamy inny system operacyjny niż linux oraz inną architekturę procesora trzeba pobrać curlem odpowiedni link ze strony [https://github.com/getsops/sops/releases](https://github.com/getsops/sops/releases)
:::

::: tabs

@tab SOPS

```bash
curl -LO https://github.com/getsops/sops/releases/download/v3.9.0/sops-v3.9.0.linux.amd64
sudo mv sops-v3.9.0.linux.amd64 /usr/local/bin/sops
sudo chmod +x /usr/local/bin/sops
```

@tab Age

```bash
# MacOSX
brew install age

# Linux
sudo apt install age

# Windows
choco install age.portable
```

:::

## Instalacja klucza age

```bash
age-keygen -o age.agekey
cat age.agekey |
kubectl create secret generic sops-age \
--namespace=flux-system \
--from-file=age.agekey=/dev/stdin
```

## Konfiguracja w repozytorium

Klucz `age` zawiera string będący kluczem publicznym age. Można go odczytać z utworzonego wcześniej secretu

```yaml  :no-line-numbers title="🖥️ kubectl get secret sops-age -n flux-system -o json | jq '.data | map_values(@base64d)'"
{
  "age.agekey": "# created: 2026-06-25T22:40:53+02:00\n# public key: agexxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx\nAGE-SECRET-KEY-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxZ\n"
}
```

W głównym katalogu repozytorium należy utworzyć plik `.sops.yaml` wykorzystując pozyskany we wcześniejszym kroku klucz publiczny.

```yaml
creation_rules:
  - encrypted_regex: "^(data|stringData)$"
    age: agexxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```


Konfigurację pliku `clusters/raspberry/apps.yaml` wzbogacamy o konfigurację dekrypcji

```yaml {12-15}
---
apiVersion: kustomize.toolkit.fluxcd.io/v1beta2
kind: Kustomization
metadata:
  name: apps-cl2
  namespace: flux-system
spec:
  interval: 1m0s
  sourceRef:
    kind: GitRepository
    name: flux-system
  decryption:
    provider: sops
    secretRef:
      name: sops-age
  path: ./apps-raspberry
  prune: true
  wait: true
  timeout: 1m0s
```

## Szyfrowanie secretów

W repozytorium clustra przyjęta została zasada, że pliki z secretami mają nazwę pasującą co wzorca: `*-secrets-clear.yaml` oraz `*-secrets-enc.yaml`. Te z **clear** w nazwie pliku nie są publikowane w repozytorium.

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secret
  namespace: default
type: Opaque
data:
  secret_password: U3VwZXJTZWNyZXRQYXNzd29yZA==
```


::: important .gitignore
Koniecznie należy zaktualizować plik .gitignore aby przypadkowo nie ujawnić żadnuch secretów. Wystarczy wpis: `**/*-secrets-clear.yaml`
:::

Aby zaszyfrować dany secret, należy wejść do katalogu z manifestem secretu i wykonać polecenie:

```bash
sops -e app-secrets-clear.yaml | tee app-secrets-enc.yaml
```

Spowoduje to utworzenie pliku app-secrets-enc.yaml, który jest zaszyfrowany z użyciem Age. Tak przygotowany plik można opublikować w repozytorium clustra. Zostanie on automatycznie wdrożony przez fluxa.
