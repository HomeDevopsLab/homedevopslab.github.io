---
title: HelmChart
icon: paste
order: 3
category:
  - Guide
tag:
  - kubernetes
---

Na potrzeby uruchamiania różnych aplikacji na klastrze Kubernetes dostępny jest HelmChart w repozytorium [https://github.com/HomeDevopsLab/appchart](https://github.com/HomeDevopsLab/appchart). HelmChart automatyzuje i co za tym idzie upraszcza wdrażanie aplikacji. Na podstawie jednego obiektu `HelmRelease` generowane są potrzebne do działania aplikacji zasoby Kubernetes.

W tej dokumentacji będzie opis poszczególnych sekcji pliku HelmRelease.

## Specyfikacja

W specyfikacji zdefiniowany jest interwał. To okres czasu, który mówi, co ile Flux ma przeprowadzać proces rekonsyliacji helm release. Poza nim zdefiniowane jest repozytorium git w którym znajduje się definicja HelmCharta.

::: info Wersjonowanie
W klastrze Kubernetes w obiektach `gitrepository` podłączone zostały specyficzne wersje appcharta. Pozwala to na elastyczny wybór sposobu konfiguracji aplikacji oraz uniknięcia skutków "breaking changes". Przykładowo: `appchart-320` oznacza wersję 3.2.0.
:::

```yaml
spec:
  interval: 1m
  chart:
    spec:
      chart: ./chart
      sourceRef:
        kind: GitRepository
        name: appchart-320
        namespace: default
      interval: 1m
```

## Values

### nodeSelector

::: info HelmRelease
`values.nodeSelector`
:::

Za pomocą nodeSelectora określa się, na której grupie nodów ma zostać uruchomiony pod z aplikacją. Rozgraniczenie odbywa się na podstawie architektury procesora. Dzięki temu można wybrać, czy aplikacja uruchomi się na Raspberry Pi, czy na maszynie wirtualnej (VM) z Proxmoxa.

```yaml
nodeSelector:
  kubernetes.io/arch: amd64
```

Możliwe do skonfigurowania opcje

| kubernetes.io/arch | amd64      | arm64        |
| ------------------ | ---------- | ------------ |
| Platforma          | VM-Proxmox | Raspberry Pi |

### K8S Probes

::: info HelmRelease
- `values.startupProbe`
- `values.livenessProbe`
- `values.readinessProbe`
:::

AppChart od wersji 3.2.0 obsługuje natywne Startup, Readiness, Liveness Probes. Aby pod z nich korzystał wystarczy dodać je do `values`, zgodnie z [dokumentacją Kubernetes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/).

Więcej przykładów i opracowań w tabelce

| Nazwa artykułu / Blog | Poziom | Główny wyróżnik | Link do artykułu |
| :--- | :--- | :--- | :--- |
| **"Practical Guide to Kubernetes Probes"** <br>*(Civo Blog)* | 🟢 Początkujący | Bardzo proste demo na bazie NGINX, idealne na pierwszy ogień do zrozumienia składni YAML. | [Przejdź do bloga Civo](https://www.civo.com/learn/practical-guide-to-the-kubernetes-probes) |
| **"Mastering Kubernetes Probes: Liveness, Readiness, and Startup"** <br>*(Medium / Steffin Issac)* | 🟡 Średni | Wyjaśnia nowoczesne podejście, w tym sondy oparte o protokół **gRPC** oraz architekturę zależności. | [Przejdź do Medium](https://medium.com/@iamsteffinissac/mastering-kubernetes-probes-liveness-readiness-and-startup-your-guide-to-healthy-deployments-744f9f45a210) |
| **"Kubernetes Probes Deep Dive"** <br>*(iam-rayees / GitHub)* | 🟡 Średni | Podejście czysto warsztatowe. Pokazuje, jak zepsuć aplikację wewnątrz kontenera i obserwować reakcję k8s. | [Przejdź do GitHub/Blog](https://github.com/iam-rayees/Kubernetes-Health-Probes) |
| **"Kubernetes Liveness Probes: Tutorial & Critical Best Practices"** <br>*(Octopus Deploy)* | 🔴 Zaawansowany | Skupia się na tym, jak **nie** zabić produkcji złymi czasami timeoutów i jak optymalizować sondy pod kątem wydajności. | [Przejdź do Octopus Deploy](https://octopus.com/devops/kubernetes-management/kubernetes-liveness-probes/) |

### replicaCount

::: info HelmRelease
`values.replicaCount`
:::

ReplicaCount jest bardzo prostym parametrem. Za jego pomocą statycznie można określić, na ilu podach ma zostać uruchomiona aplikacja. W środowisku domowym zazwyczaj będzie to wartość: 1, aby zaoszczędzić zasoby. W środowiskach produkcyjnych można użyć większej liczby, aby zapewnić aplikacji większą moc obliczeniową i HA.

::: tip
Warto też zweryfikować czy aplikacja może być uruchomiona w tym trybie. Są przypadki w których jeden proces nie może mieć dostępu do tych samych plików w tym samym czasie
:::

```yaml
replicaCount: 1
```

### ServiceAccount

Niektóre aplikacje mogą potrzebować dodatkowych uprawnień w klastrze. Przykładowo: może to być aplikacja, która ma odczytywać informacje na temat podów w Kubernetes. Taka operacja wymaga ustawienie odpowiednich polityk RBAC oraz wskazania nazwy użytkownika serwisowego (Service Account).

::: normal-demo Konfiguracja RBAC

```yaml
# 1. Tożsamość: Tworzymy konto serwisowe (ServiceAccount)
apiVersion: v1
kind: ServiceAccount
metadata:
  namespace: default
  name: pod-reader-sa

---

# 2. Uprawnienia: Definiujemy, co można zrobić (odczyt podów)
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: default
  name: pod-reader
rules:
- apiGroups: [""]       # Pusta grupa to "core" API (m.in. pody, konfiguracyjne)
  resources: ["pods"]   # Zasób, do którego chcemy dać dostęp
  verbs: ["get"]        # Dopuszczalne akcje

---

# 3. Powiązanie: Łączymy konto serwisowe z uprawnieniami
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  namespace: default
  name: read-pods-binding
subjects:
- kind: ServiceAccount
  name: pod-reader-sa    # Musi zgadzać się z nazwą powyższego ServiceAccount
  apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: Role
  name: pod-reader       # Musi zgadzać się z nazwą powyższej roli
  apiGroup: rbac.authorization.k8s.io
```
:::

Plik yaml z uprawnieniami (konto serwisowe i polityka RBAC) umieszczamy w tym samym miejscu co HelmRelease z aplikacją. W Pliku HelmRelease wystarczy wskazać nazwę utworzonego użytkownika serwisowego, z którego ma korzystać aplikacja.

```yaml
serviceAccountName: pod-reader-sa
```

### Env

::: info HelmRelease
`values.env`
:::

Zmienne środowiskowe potrzebne do uruchomienia aplikacji.

Definicja plain text

```yaml
- name: foo
  value: bar
```

Pobranie wartości zmiennej z secretu

```yaml
- name: foo
  valueFrom:
    secretKeyRef:
      name: app-secret
      key: foo
```

W przypadku zmiennych z secretami, trzeba stworzyć manifest z secretem obok pliku helmrelease z konfiguracją aplikacji

```yaml title="Przykładowy secret"
apiVersion: v1
kind: Secret
metadata:
  name: app-secret
  namespace: default
type: Opaque
data:
  foo: base64hash
```

### SecurityContext

::: info HelmRelease
`values.securityContext`
:::

Parametr ten został wdrożony na potrzeby uruchomienia HashiCorp Vault, było to wymagane do jego działania. Dzięki niemu aplikacja uzyskała dostęp do funkcji `mlock()`, która nie zezwala na zapisywanie na dysku niezaszyfrowanym poufnych informacji.

```yaml
securityContext:
  capabilities:
    add: ["IPC_LOCK"]
```

### image

::: info HelmRelease
`values.image`
:::

Opcja `image` służy do wskazania kontenera, który ma zostać uruchomiony.

```yaml
image:
  registrySecret: regcred
  imagePolicy: true
  repository: private.registry.address/homelab/documentation
  tag: 2.4.0 # {"$imagepolicy": "flux-system:homelab-doc:tag"}
  command: ["gotenberg"]
  args:
    - --chromium-disable-javascript=true
    - --chromium-allow-list=file:///tmp/.*
```

| Opcja          | Wymagane | Opis                                                                                                                |
| -------------- | -------- | ------------------------------------------------------------------------------------------------------------------- |
| repository     | Tak      | Wskazanie registry z kontenerami dockera                                                                            |
| tag            | Tak      | wskazanie na wersję aplikacji. W przypadku imagepolicy, trzeba podać specjalny string dla Fluxa po znaku komentarza |
| imagePolicy    | Nie      | **false** image policy off, **true** image policy on                                                                |
| registrySecret | Nie      | Opcji używamy w przypadku rejestru prywatnego, który wymaga zalogowania się do niego. Opcja wskazuje nazwę secretu  |
| command        | Nie      | Niektóre kontenery wymagają do uruchomienia customowego polecenia. Parametr command jest typu: list                 |
| args           | Nie      | Dodatkowe argumenty dla `command` lub dla `ENTRYPOINT` kontenera - cokolwiek jest wymagane                          |  

#### Image Policy

::: info HelmRelease
`values.image.imagePolicy`
:::

Image policy to specjalny typ zasobu (CRD), który jest dostarczany przez Fluxa. Odpowiada on za wdrożenie najnowszego dostępnego taga. W homelabie stosowany jest wzorzec [semver](https://semver.org/lang/pl/).

```yaml
policy:
  semver:
    range: ">=0.0.1"
```

Aby można było śledzić wersje w deploymencie, trzeba dodać do linijki `tag` specjalny komentarz: `# {"$imagepolicy": "flux-system:homelab-doc:tag"}`. Wskazuje on namespace oraz nazwę resource'a ImagePolicy, który ma zostać utworzony.

### imagePullSecrets

::: info HelmRelease
`values.imagePullSecrets`
:::

```yaml
imagePullSecrets:
  - name: regcred
```

Działa podobnie do `registrySecret`. Chociaż ma on z definicji bardziej wszechstronne zastosowanie, w appchart został wykorzystany do tworzenia obiektów `cronJob`, jeśli mają pobierać obraz z wewnętrznego repozytorium kontenerów.

### resources

::: info HelmRelease
`values.resources`
:::

Pozwala ustawić limity na użycie procesora i ramu przez aplikację.

```yaml title="Przykładowa konfiguracja limitów"
resources:
  limits:
    memory: "512Mi"
    cpu: "1"
  requests:
    memory: "256Mi"
    cpu: "250m"
```

Requests pomagają Kubernetes wybrać odpowiedni węzeł klastra, który będzie w stanie uruchomić aplikację. Deklarujemy tutaj ile aplikacja potrzebuje zasobów do działania. Limits określa twardy limit, którego nie możemy przekroczyć. Kiedy zostanie przekroczony CPU limit, aplikacja zaczyna wolniej pracować, włącza się tzw. throttling. W przypadku braku pamięci, aplikacja jest zatrzymywana (OOMKill)

![Infografika Kubernetes Limits](/assets/image/k8s-limits.jpg)

### services

::: info HelmRelease
`values.services`
:::

Services służy do komunikacji aplikacji ze środowiskiem wewnątrz Kubernetes oraz ze światem zewnętrznym. Z obiektem typu service może komunikować się inna aplikacja działająca w tym samym klastrze lub ingress. W zależności od ustawionego typu możemy zrealizować pożądany scenariusz.

| Przykład użycia | Typ | Obiekt zależny |
| ----------------| ----| ---------------|
| Usługa SMTP | LoadBalancer | LoadBalancer |
| Aplikacja www wystawiona przez cloudflare | ClusterIP | Brak |
| Aplikacja www hostowana lokalnie | ClusterIP | Ingress |

#### Wystawienie aplikacji poprzez usługę Cloudflare

![Cloudflare Service Przykład](/assets/image/k8s-cf-service.svg)

#### Wewnętrzna usługa SMTP

![SMTP Service Przykład](/assets/image/k8s-lb-service.svg)

#### Aplikacja wykorzystująca Ingress

![Aplikacja z Ingress Przykład](/assets/image/k8s-ingress-service.svg)

```yaml
services:
  - name: gitlab
    type: ClusterIP
    protocol: 'TCP'
    servicePort: 80
    targetPort: 80
    ....
```

| Opcja       | Opis                                                                                                                                                                                                                          |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| name        | Nazwa serwisu                                                                                                      |
| type        | **ClusterIP** - służy do komunikacji wewnętrznej: service - kontener. Służy do komunikacji z serwerami www działającymi w podach. **LoadBalancer** - mapuje servicePort do IPków wystawianych przez load balancer         |
| protocol    | **TCP** lub **UDP**                                                                                                                                                                                                           |
| servicePort | Port, który wystawia serwis. Korzysta z niego Ingress (w przypadku ClusterIP) lub jest on wystawiony do LoadBalancera (type: LoadBalancer), dzięki czemu możemy np. na porcie: 2222 połączyć się do ssh działającego w podzie. |
| targetPort  | Port wystawiony przez kontener z aplikacją                                                                                                                                                                                    |

::: tip Service
Jedna aplikacja może mieć kilka usług, które potrzebują komunikacji ze światem. Najlepszym przykładem jest gitlab, który posiada serwer www, serwer ssh oraz dodatkowo registry kontenerów dockera.
:::

::: important Service name
Obecna wersja AppChart posiada ograniczenie co do nazwy serwisu do 15 znaków.
:::

### ingress

::: info HelmRelease
`values.ingress`
:::

Ingress jest odpowiedzialny za serwowanie aplikacji webowej pod wybranym adresem domenowym. Ostatnia wersja HelmCharta umożliwia utworzenie więcej niż jednego ingressu dla aplikacji. Przykładem jest Gitlab, który wymaga wystawienia GUI gitlaba oraz registry dockerowego.

```yaml
ingress:
  enabled: true
  ssl: true
  hosts:
    - name: gitlab.example.com
      servicePort: 80
    - name: registry.example.com
      servicePort: 5050
```

| Opcja       | Opis                                                                                                        |
| ----------- | ----------------------------------------------------------------------------------------------------------- |
| enabled     | **true**: ingress zainstalowany, **false**: ingress nie zainstalowany                                       |
| ssl         | **true**: certyfikat Let's Encrypt podłączony, ustawione przekierowanie lub **false**: brak certyfikatu ssl |
| hosts       | tablica vhostów. Każdy vhost to jeden ingress                                                               |
| servicePort | Numer portu musi być zgodny z `servicePort` w kluczu service                                                |

### volumes

::: info HelmRelease
`values.volumes`
:::

Volumes obsługuje montowanie kilku rodzajów zasobów:

* NFS
* Secrets
* ConfigMaps

Przykłady

::: code-tabs#volumes

@tab NFS

```yaml
volumes:
  nfs:
    ownership: 991:991
    server: nas.lan
    path: /volume1/data
    mountPath:
      - media:/mnt/media
      - config:/app/config
  rootDir: myapp-data
```

@tab Secret

```yaml
volumes:
  secret:
    secretName: app-secret
    mountPath: /app/secret.json
    subPath: secret.json
```

@tab ConfigMap

```yaml
volumes:
  configmap:
    configMap: app-config
    mountPath: /conf/config.ini
    subPath: config.ini
```
:::

#### NFS

| Opcja | Opis |
| ------| -----|
| server | Adres serwera NFS |
| path | ścieżka do udostępnionego udziału NFS |
| mountPath | mapa katalogów: lokalny:ścieżka w kontenerze |
| rootDir | Parametr ten ma zastosowanie w przypadku, jeśli więcej niż jeden HelmRelease musi mieć dostęp do wspólnej struktury katalogów |
| ownership | UID:GID procesu, który ma wykonywać operacje na udziale NFS |

::: important
Jeśli aplikacja ma używać storage na NFS, zanim zostanie uruchomiona trzeba utworzyć dla niej strukturę katalogów. W przykładzie powyżej na serwerze nas.lan wystarczy wykonać polecenie:
```bash :no-line-numbers
mkdir -p /volume1/data/{media,config}
```
:::

#### Secret

| Opcja | Opis |
| ------| -----|
| secretName | Nazwa secretu |
| mountPath | ścieżka montowania w kontenerze |
| subPath | nazwa pliku, którego treść znajduje się w secrecie |

#### ConfigMap

| Opcja | Opis |
| ------| -----|
| configMap | Nazwa configmapy |
| mountPath | ścieżka montowania w kontenerze |
| subPath | nazwa pliku, którego treść znajduje się w configMapie |