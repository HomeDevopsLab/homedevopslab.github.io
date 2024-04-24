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

Opcja database służy do uruchomienia hooków, które mają za zadanie stworzyć bazę danych mysql oraz wygenerować secret dla aplikacji. Uruchamiane są podczas instalacji aplikacji z helmcharta.

```yaml
database:
  enabled: true
```

Jeśli nie chcemy używać tych pre-hooków ustawiamy `enabled: false`.

::: warning Deprecation warning
Obsługa database zostanie usunięta w kolejnych wersjach helmcharta. Utrzymanie tego modelu wymaga zbyt dużo pracy związanej z aktualizacją infrastruktury.
:::

### image

Opcja `image` służy do wskazania kontenera, który ma zostać uruchomiony.

```yaml
image:
  registrySecret: regcred
  imagePolicy: true
  repository: private.registry.address/homelab/documentation
  tag: 2.4.0 # {"$imagepolicy": "flux-system:homelab-doc:tag"}
```

| Opcja          | Wymagane | Opis                                                                                                                |
| -------------- | -------- | ------------------------------------------------------------------------------------------------------------------- |
| registrySecret | Nie      | Opcji używamy w przypadku rejestru prywatnego, który wymaga zalogowania się do niego. Opcja wskazuje nazwę secretu  |
| imagePolicy    | tak      | **false** image policy off, **true** image policy on                                                                |
| repository     | tak      | Wskazanie registry z kontenerami dockera                                                                            |
| tag            | tak      | wskazanie na wersję aplikacji. W przypadku imagepolicy, trzeba podać specjalny string dla fluxa po znaku komentarza |

#### Image Policy

Image policy to specjalny typ resource'u (CRD), który jest dostarczany przez Fluxa. Odpowiada on za wdrożenie najnowszego dostępnego taga/ W homelabie posługuję się patternem [semver](https://semver.org/lang/pl/).

```yaml
policy:
  semver:
    range: ">=0.0.1"
```

Aby można było śledzić wersje w deploymencie, trzeba dodać do linijki `tag` specjalny komentarz: `# {"$imagepolicy": "flux-system:homelab-doc:tag"}`. Wskazuje on namespace oraz nazwę resource'a ImagePolicy, który ma zostać utworzony.

### resources

Całe `resources` jest wczytywane bezpośrednio do deploymentu. Jest to standardowa konfiguracja kubernetes. Pozwala ustawić limity na użycie procesora i ramu w aplikacji.

## Templates

Opis działania poszczególnych elementów helmcharta. Definicje obiektów znajdują się w katalogu [appchart/chart/templates](https://github.com/HomeDevopsLab/appchart/tree/multiple-ingresses/chart/templates) w repozytorium.

### dbsecrets.yaml

Opcja database odpowiada za stworzenie ssecretu do bazy MySQL w kubernetes oraz za uruchomienie skryptu tworzącego bazę danych i konto użytkownika na podstawie stworzonego secretu. Akcje związane z tworzeniem bazy uruchamiają się w pre-install hooku, zanim aplikacja zostanie uruchomiona.

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: {{ .Release.Name }}-db
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

::: important Secret
Jeśli secret o tej nazwie już istnieje, zostanie on wygenerowany od nowa. Może to doprowadzić do problemów z działaniem aplikacji, jeśli dane konta w bazie się nie zmienią.
:::

### mysqlDBhelper.yaml

Jest to pre-hook odpowiedzialny za utworzenie bazy danych oraz konta użytkownika na sewerze mysql. Źródłem danych, na których on operuje jest stworzony w innym pre-hooku secret kubernetes. Prehook uruchamia skrypt w bashu, który jest obudowany kontenerem dockera: mysql-initdb:0.0.1.

::: normal-demo mysql-initdb
**run.sh**

```bash
#!/bin/bash

MYSQL="/usr/bin/mysql"

function mysql_cmd() {
    $MYSQL -u ${DB_ADMIN_LOGIN} -p${DB_ADMIN_PASS} -h ${DB_HOST} -Nsre "$1"
}

function userExists() {
    result=$(mysql_cmd "SELECT count(User) FROM mysql.user WHERE User='${APPDB_LOGIN}'")
    echo $result
}

if [ $(userExists) == "1" ]; then
    mysql_cmd "ALTER USER '${APPDB_LOGIN}'@'%' IDENTIFIED BY '${APPDB_PASS}'"
    mysql_cmd "FLUSH PRIVILEGES"
else
    mysql_cmd "CREATE DATABASE ${APPDB_NAME}"
    mysql_cmd "CREATE USER '${APPDB_LOGIN}'@'%' IDENTIFIED BY '${APPDB_PASS}'"
    mysql_cmd "GRANT ALL ON ${APPDB_NAME}.* TO '${APPDB_LOGIN}'@'%'"
fi
```

**Dockerfile**

```dockerfile
FROM gitea.angrybits.pl/kkrolikowski/toolbox:0.0.1
WORKDIR /usr/local/bin
COPY run.sh .
RUN chmod +x run.sh
ENTRYPOINT [ "/bin/bash", "./run.sh" ]
```

:::
