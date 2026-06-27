---
title: SOPS
icon: key
order: 3
category:
  - Guide
tag:
  - kubernetes
---

[SOPS](https://getsops.io/) is a tool I use to encrypt Kubernetes secrets. It supports encryption based on mechanisms provided by public clouds as well as local tools such as PGP and [Age](https://github.com/FiloSottile/age).

## Installation

::: important SOPS Install
If you are running an operating system other than Linux or a different processor architecture, download the appropriate binary using curl from [https://github.com/getsops/sops/releases](https://github.com/getsops/sops/releases)
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

## Installing the Age key

```bash
age-keygen -o age.agekey
cat age.agekey |
kubectl create secret generic sops-age \
--namespace=flux-system \
--from-file=age.agekey=/dev/stdin
```

## Repository configuration

The `age` key contains a string with the Age public key. It can be read from the previously created secret:

```yaml  :no-line-numbers title="🖥️ kubectl get secret sops-age -n flux-system -o json | jq '.data | map_values(@base64d)'"
{
  "age.agekey": "# created: 2026-06-25T22:40:53+02:00\n# public key: agexxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx\nAGE-SECRET-KEY-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxZ\n"
}
```

In the root directory of the repository, create a `.sops.yaml` file using the public key obtained in the previous step:

```yaml
creation_rules:
  - encrypted_regex: "^(data|stringData)$"
    age: agexxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Extend the `clusters/raspberry/apps.yaml` configuration with the decryption settings:

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

## Encrypting secrets

The cluster repository follows a naming convention where secret files match the pattern: `*-secrets-clear.yaml` and `*-secrets-enc.yaml`. Files with **clear** in the name are not published to the repository.

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
Make sure to update your `.gitignore` file to avoid accidentally exposing any secrets. A single entry is enough: `**/*-secrets-clear.yaml`
:::

To encrypt a secret, navigate to the directory containing the secret manifest and run:

```bash
sops -e app-secrets-clear.yaml | tee app-secrets-enc.yaml
```

This will create an `app-secrets-enc.yaml` file encrypted with Age. The resulting file can be safely published to the cluster repository and will be automatically deployed by Flux.
