---
title: Helmchart
icon: paste
order: 3
category:
  - Guide
tag:
  - kubernetes
---

Na potrzeby uruchamiania różnych aplikacji na klastrze kubernetes przygotowałem helmchart, który dostępny jest w repozytorium [https://github.com/HomeDevopsLab/appchart](https://github.com/HomeDevopsLab/appchart). Helmchart automatyzuje i co za tym idzie upraszcza tworzenie obiektów kubernetes. Na podstawie jednego obiektu `HelmRelease` generowanych jest wiele resource'ów kubenetes.

W tej dokumentacji będzie opis poszczególnych sekcji pliku HelmRelease.

## Specyfikacja

W specyfikacji zdefiniowany jest interwał. To okres czasu, który mówi co ile flux ma przeprowadzać proces rekonsyliacji helm release. Poza nim zdefiniowane jest repozytorium git w którym znajduje się definicja helmcharta.

```yaml
spec:
  interval: 1m
  chart:
    spec:
      chart: ./chart
      sourceRef:
        kind: GitRepository
        name: homelab-app-chart-multiple-ingresses
        namespace: default
      interval: 1m
```

## Values

### nodeSelector

Za pomocą nodeSelectora określam na której grupie nodów ma zostać uruchomiony pod z aplikacją. W moim środowisku używam rozgraniczenia na podstawie architektury procesora. Dzięki temu mogę sobie wybrać czy coś mi się uruchomi na raspberry pi, czy na vm-ce z proxmoxa.

```yaml
nodeSelector:
  kubernetes.io/arch: amd64
```

Możliwe do skonfigurowania opcje

| kubernetes.io/arch | amd64      | arm64        |
| ------------------ | ---------- | ------------ |
| Platforma          | VM-Proxmox | Raspberry Pi |

### startupProbes

StartupProbes odpowiedzialne są za sprawdzanie, czy aplikacja działająca w podzie już działa. W tym helmcharcie check jest bardzo prosty. Wykonuje http get na wskazany port.

```yaml
startupProbes:
  enabled: true
  port: 3000
```

Jeśli nie chcemy uruchamiać startupProbes stosujemy konnfigurację poniżej:

```yaml
startupProbes:
  enabled: false
```

### replicaCount

ReplicaCount jest bardzo prostym parametrem. Za jego pomocą na sztywno można określić na ilu podach ma zostać uruchomiona aplikacja. W środowisku domowym zazwyczaj będzie to wartość: 1 aby zaoszczędzić zasoby. W środowiskach produkcyjnych można użyć większej liczby aby zapewnić aplikacji większą moc obliczeniową i HA.

```yaml
replicaCount: 1
```

### database

Opcja database odpowiada za stworzenie ssecretu do bazy MySQL w kubernetes oraz za uruchomienie skryptu tworzącego bazę danych i konto użytkownika na podstawie stworzonego secretu. Akcje związane z tworzeniem bazy uruchamiają się w pre-install hooku, zanim aplikacja zostanie uruchomiona.

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: {{.Release.Name }}-db
  annotations:
    "helm.sh/hook": pre-install
    "helm.sh/hook-weight": "-5"
    "helm.sh/hook-delete-policy": before-hook-creation
type: Opaque
data:
  login: {{ .Release.Name | trimSuffix "-www" | b64enc | quote }}
  password: {{ randAlphaNum 32 | b64enc | quote }}
```

Do wygenerowania hasła wykorzyystywana jest funckcja helma: `randAlphaNum`.

::: warning Secret
Jeśli secret o tej nazwie już istnieje, zostanie on wygenerowany od nowa. Może to doprowadzić do problemów z działaniem aplikacji, jeśli dane konta w bazie się nie zmienią.
:::


