---
title: FluxCD
icon: ship
order: 3
category:
  - Guide
tag:
  - cicd
---

## Opis

[FluxCD](https://fluxcd.io/flux/) jest narzędziem realizującym obszar continuous delivery. W moim środowisku homelab używam go do wdrażania wszystkich aplikacji na klastrze Kubernetes. Dzięki komponentowi `ImageUpdateAutomation` mogę zautomatyzować wdrażanie nowych wersji aplikacji - jeśli zostanie zbudowany kontener w odpowiedniej wersji.

### Instalacja fluxa

::: tabs

@tab MacOS

```bash :no-line-numbers
brew install fluxcd/tap/flux
```

@tab Linux

```bash :no-line-numbers
curl -s https://fluxcd.io/install.sh | sudo bash
```

@tab Windows

```powershell :no-line-numbers
choco install flux
```

:::

## Bootstrap fluxa

### Token PAT (GitHub)

Przejdź pod adres: [https://github.com/settings/tokens](https://github.com/settings/tokens)

@slidestart

## Tokens Classic

![tokens classic](/assets/image/pat1.png)

:::
Kliknij aby powiększyć
:::

---

## New token

![tokens classic](/assets/image/pat2.png)

:::
Kliknij aby powiększyć
:::

---

## Konfiguracja tokena

![tokens classic](/assets/image/pat3.png)

@slideend

W ostatnim kroku skonfiguruj:

- nazwę tokena
- czas ważności tokena
- uprawnienia — zaznacz całą gałąź repozytorium

Po kliknięciu "Generate token", postępuj zgodnie z instrukcjami i skopiuj wartość tokena.

::: warning PAT
Jeśli zakładka zostanie zamknięta lub odświeżona przed skopiowaniem tokena, trzeba będzie powtórzyć operację. Nie ma możliwości odczytania wartości tokena w późniejszym momencie.
:::

### Wdrożenie Fluxa

Aby rozpocząć korzystanie z Fluxa należy wykonać operację bootstrap. W tym procesie Flux generuje i wdraża swoje manifesty na klastrze Kubernetes i publikuje je we wskazanym repozytorium. Miejscem przechowywania konfiguracji klastra mojego środowiska jest GitHub. Lista dostępnych opcji znajduje się w [dokumentacji procesu bootstrap](https://fluxcd.io/flux/installation/bootstrap/).

::: important Kubernetes
Przed wykonaniem polecenia flux należy być zalogowanym do klastra Kubernetes, w którym chcemy mieć zainstalowanego Fluxa.
:::

```bash :no-line-numbers
export GITHUB_TOKEN=gh-xxxxxxxxxxxxx
flux bootstrap github \
  --components-extra=image-reflector-controller,image-automation-controller \
  --token-auth \
  --owner=HomeDevopsLab \
  --repository=test-fluxrepo \
  --branch=main \
  --path=clusters/k3s-test \
  --personal
```

Powyższe polecenie publikuje w repozytorium manifesty Fluxa, jednocześnie instalując je w klastrze Kubernetes. W efekcie działania w repozytorium tworzony jest katalog clusters/k3s-test, zawierający obiekty Fluxa.

Dodatkowymi komponentami, które są wykorzystywane w klastrze są:

- image-reflector-controller
- image-automation-controller

Służą one do wykrywania i wdrażania nowych wersji kontenerów.

## Aktualizacja tokenu PAT

Token PAT zainstalowany jest w Kubernetes w namespace: `flux-system` jako secret o nazwie: `flux-system`

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: flux-system
  namespace: flux-system
type: Opaque
data:
  password: ghp_xxxxxxxxxxxx
  username: git
```

Po aktualizacji tokenu PAT, usuń stary secret i wdróż nowy.

```bash
kubectl -n flux-system delete secret flux-system
kubectl -n flux-system apply -f flux-secret.yaml
```

::: tip Base64
Wartości kluczy `password` oraz `username` muszą być zakodowane w Base64.
:::

## Kustomization

Wdrażanie aplikacji (oraz innych konfiguracji) z użyciem FluxCD zacznij od przygotowania manifestu `Kustomization`, którym wskażesz katalog apps.

::: tip apps
Aby uniknąć błędu `Kustomization` należy stworzyć katalog apps i opublikować go w repozytorium wraz z manifestem `Kustomization`.

```bash :no-line-numbers
cd test-fluxrepo
mkdir apps
touch apps/.gitkeep
```
:::

```yaml title="clusters/k3s-test/apps.yaml"
---
apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: apps
  namespace: flux-system
spec:
  interval: 1m0s
  sourceRef:
    kind: GitRepository
    name: flux-system
  path: ./apps
  prune: true
  wait: true
  timeout: 1m0s
```

W tym momencie każdy manifest, który pojawi się w katalogu `apps`, zostanie automatycznie wdrożony przez Fluxa.

## Obsługa HelmChart

HelmChart znacznie przyspiesza uruchomienie aplikacji w Kubernetes, jednocześnie dając swobodę wyboru obiektów, z jakich składa się środowisko aplikacji, którą chcemy uruchomić. W tym celu stworzony został [AppChart](https://github.com/HomeDevopsLab/appchart) - uniwersalny szablon do uruchamiania różnego typu aplikacji.

Aby z niego skorzystać, trzeba w klastrze skonfigurować obiekt `GitRepository`.

### GitRepository

Dla zachowania porządku wszystkie manifesty `GitRepository` publikujemy w katalogu `apps/gitrepos`. Każda wersja AppChart posiada unikalny `name` oraz wyróżniający ją tag lub branch.

Definicja manifestu dla wersji `3.2.0`

```yaml title="apps/gitrepos/app-chart-320.yaml"
apiVersion: source.toolkit.fluxcd.io/v1
kind: GitRepository
metadata:
  name: appchart-320
  namespace: default
spec:
  interval: 1m
  url: https://github.com/HomeDevopsLab/appchart
  ref:
    tag: "3.2.0"
```

Użycie manifestu w aplikacji

```yaml {13}
apiVersion: helm.toolkit.fluxcd.io/v2
kind: HelmRelease
metadata:
  name: test-app
  namespace: default
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

W HelmRelease aplikacji używamy `name`, aby powiązać oba obiekty.

### Aktualizacja AppChart

Testowanie nowych funkcjonalności AppCharta wykonaj, wdrażając dodatkowy obiekt GitRepository, który wskazuje na feature branch w repozytorium.

```yaml {4,10}
apiVersion: source.toolkit.fluxcd.io/v1
kind: GitRepository
metadata:
  name: appchart-feature
  namespace: default
spec:
  interval: 1m
  url: https://github.com/HomeDevopsLab/appchart
  ref:
    branch: new-feature
```


#### Wdrożenie nowej wersji HelmChart

Jeśli wszystkie zmiany działają poprawnie, wykonaj następujące czynności.

1. Przygotuj release AppCharta.
2. Zmień we wszystkich manifestach HelmRelease nazwę dowiązanego HelmCharta na tę, która jest powiązana z nowym tagiem.
3. Usuń plik z `apps/gitrepos`, który jest powiązany z branchem.
4. Usuń branch z repozytorium.

Jeśli okaże się, że jakaś aplikacja nie działa prawidłowo z nową wersją — wróć do poprzedniej wersji AppCharta, ale tylko w tym jednym konkretnym HelmRelease.

## Image automation

[ImageAutomation](https://fluxcd.io/flux/components/image/) automatyzuje wdrażanie nowych wersji aplikacji. Funkcjonalność ta jest wspierana w wykorzystywanym HelmCharcie. Jeśli chcemy z niej skorzystać, należy skonfigurować `imagePolicy: true` w przeciwnym razie trzeba ustawić wartość `false`. 

### Registry secret (regcred)

ImageAutomation wymaga wdrożenia secretu, który umożliwi pobieranie obrazów Dockera z registry w GitLabie.

```bash :no-line-numbers
kubectl create secret -n flux-system docker-registry regcred \
  --docker-email=admin@domena.pl \
  --docker-username=gitlab_user \
  --docker-password=glpat-xxxxxxxxxxxxxx \
  --docker-server=registry.git.domena.pl
```

To samo należy zrobić w namespace `default`.

### Konfiguracja

```yaml {2,3,5}
image:
  registrySecret: regcred
  imagePolicy: true
  repository: registry.private.pl/project/documentation
  tag: 2.5.1 # {"$imagepolicy": "flux-system:doc:tag"}
```

Jeśli registry wymaga zalogowania się do niego, należy wdrożyć odpowiedni secret i użyć go w opcji `registrySecret`. Aby image policy działało prawidłowo w linijce `tag` należy dodać specjalny komentarz.

``` :no-line-numbers
# {"$imagepolicy": "flux-system:doc:tag"}
```
| namespace | release name | field |
| ----------| -------------| ------|
| flux-system | doc | tag |

W namespace `flux-system` wdrożony jest obiekt imagePolicy, doc jest nazwą aplikacji zdefiniowaną w HelmRelease, w którym się znajduje ta konfiguracja. Tag jest polem, które jest aktualizowane przez Fluxa.

::: important ReleaseName
Nazwa aplikacji w imagepolicy musi być taka sama jak ReleaseName.
:::

Dzięki tej konfiguracji nie trzeba ręcznie aktualizować taga w HelmReleasie, zrobi to za nas Flux.

::: warning git pull
Aby uniknąć konfliktów w repozytorium należy pamiętać o zrobieniu git pull.
:::
