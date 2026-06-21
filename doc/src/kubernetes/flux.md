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

[FluxCD](https://fluxcd.io/flux/) jest narzędziem realizującym obszar continous delivery. W moim środowisku homelab używam go do wdrażania wszystkich aplikacji na klastrze kubernetes. Dzięki komponentowi `ImageUpdateAutomation` mogę zautomatyzować wdrażanie nowych wersji aplikacji - jeśli zostanie zbudowany kontener w odpowiedniej wersji.

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

### Github PAT token

Wchodzimy na link: [https://github.com/settings/tokens](https://github.com/settings/tokens)

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

W ostatnim kroku ustawiamy:

- nazwę tokena
- Ile czasu ma być ważny token
- Uprawnienia. Wybieramy całą gałąź repo

Po kliknięciu "Generate token" postępując zgodnie z instrukcjami skopiować wartość tokena

::: warning PAT
Jeśli zakładka zostanie zamknięta lub odświeżona przed skopiowaniem tokena, trzeba będzie powtórzyć operację. Nie ma możliwości odczytania wartości tokena w późniejszym momencie.
:::

### Deployment fluxa

Aby rozpocząć korzystanie z Fluxa należy wykonać operację bootstrap. W tym procesie flux generuje i wdraża swoje manifesty na klastrze kubernetes i publikuje je we wskazanym repozytorium. Miejscem przechowywania konfiguracji klastra mojego środowiska jest Github. Lista dostępnych opcji znajduje się w [dokumentacji procesu bootstrap](https://fluxcd.io/flux/installation/bootstrap/)

::: important Kubernetes
Zanim wykonamy polecenie flux należy być zalogowanym do klastra kubernetes w którym chcemy mieć zainstalowanego fluxa.
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

Powwyższe polecenie publikuje w repozytorium manifesty fluxa jednocześnie instalując je w klastrze kubernetes. W efekcie działania w repozytorium stworzony jest katalog clusters/k3s-test, który zawiera obiekty fluxa.

Dodatkowymi komponentami, które są wykorzystywane w klastrze są:

- image-reflector-controller
- image-automation-controller

Służą one do wykrywania i wdrażania nowych wersji kontenerów.

## Aktualizacja tokenu PAT

Token PAT zainstalowany jest w kubernetes w namespace: `flux-system` jako secret o nazwie: `flux-system`

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

Po aktualizacji tokenu PAT, usuwamy stary secret i wdrażamy nowy

```bash
kubectl -n flux-system delete secret flux-system
kubectl -n flux-system apply -f flux-secret.yaml
```

::: tip Base64
Wartości kluczy password oraz username muszą być zakodowane base64
:::

## Kustomization

Wdrażanie aplikacji (oraz innych konfiguracji) z użyciem FluxCD zaczniemy od przygotowania manifestu `Kustomization`, którym wskażemy katalog apps.

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

W tym momencie każdy manifest, który pojawi się w katalogu `apps` zostanie automatycznie wdrożony przez fluxa.

## Obsługa HelmChart

HelmChart znacznie przyspiesza uruchomienie aplikacji w kubernetes, jednocześnie dajac swobodę wyboru obiektów, z jakich składa się środowisko aplikacji, którą chcemy uruchomić. W tym celu stworzony został [AppChart](https://github.com/HomeDevopsLab/appchart) - uniwersalny szablon do uruchamiania różnego typu aplikacji.

Aby z niego skorzystać trzeba w klustrze skonfigurować obiekt `GitRepository`

### GitRepository

Dla zachowania porządku wszystkie manifesty `GitRepository` publikujemy w katalogu `apps/gitrepos`. Każda wersja appchart posiada unikalny `name` oraz wyróżniający ją tag lub branch

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

W Helmrelease aplikacji używamy `name` aby powiązać oba obiekty.

### Aktualizacja AppChart

Testowanie nowych funkcjonalności helmcharta wykonujemy wdrażając dodatkowy obiekt gitrepository, który wskazuje na feature branch w repozytorium.

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

Jeśli wszystkie zmiany działają poprawnie wykonujemy następujące czynności.

1. Przygotowujemy release helmcharta.
2. Zmieniamy we wszystkich manifestach HelmRelease nazwę dowiązanego HelmCharta na tą, która jest powiązana z nowym tagiem
3. Usuwamy plik z `apps-repository/gitrepos`, który jest powiązany z branchem
4. Usuwamy branch z repozytorium.

Jeśli okaże się, że jakaś aplikacja nie działa prawidłowo z nową wersją - wracamy do poprzedniej wersji appchart, ale tylko w tym jednym konkretnym HelmRelease.

## Image automation

[ImageAutomation](https://fluxcd.io/flux/components/image/) jest funkcjonalnością, która pozwala na automatyzację wdrażania nowych wersji aplikacji. Funckjonalność ta jest wspierana w wykorzysytwanym HelmCharcie. Jeśli chcemy z niej skorzystać należy skonfigurować `imagePolicy: true` w przeciwnym razie trzeba ustawić wartość `false`.

```yaml {2,3,5}
image:
  registrySecret: regcred
  imagePolicy: true
  repository: registry.private.pl/project/documentation
  tag: 2.5.1 # {"$imagepolicy": "flux-system:doc:tag"}
```

Jeśli registry wymaga zalogowania się do niego, należy zdeployować odpowiedni secret i użyć go w opcji `registrySecret`. Aby image policy działało prawidłowo w linijce `tag` należy dodać specjalny komentarz.

```
# {"$imagepolicy": "flux-system:doc:tag"}
```
| namespace | release name | field |
| ----------| -------------| ------|
| flux-system | doc | tag |

W namespace `flux-system` zdeployowany jest obiekt imagePolicy, doc jest nazwą aplikacji zdefiniowaną w HelmRelase w którym się znajduje ta konfiguracja. Tag jest polem, które jeset aktualizowane przez fluxa

::: important ReleaseName
Nazwa aplikacji w imagepolicy musi być taka sama jak ReleaseName.
:::

Dzięki tej konfiguracji nie trzeba ręcznie aktualizować taga w HelmReleasie, zrobi to za nas Flux.

::: warning git pull
Należy pamiętać o zrobieniu git pull na repozytorium w którym operuje flux, w przeciwnym razie nie uda się poprawnie wykonywać dalszych zmian.
:::