---
title: Flux CD
icon: ship
order: 2
category:
  - Guide
tag:
  - cicd
---

## Opis

[FluxCD](https://fluxcd.io/flux/) jest narzędziem realizującym obszar continous delivery. W moim środowisku homelab używam go do wdrażania wszystkich aplikacji na klastrze kubernetes. Dzięki komponentowi `ImageUpdateAutomation` mogę zautomatyzować wdrażanie nowych wersji aplikacji - jeśli zostanie zbudowany kontener w odpowiedniej wersji.
Flux jest narzędziem typu cli.

### Instalacja fluxa

::: tabs

@tab MacOS

```bash
brew install fluxcd/tap/flux
```

@tab Linux

```bash
curl -s https://fluxcd.io/install.sh | sudo bash
```

@tab Windows

```powershell
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

::: warning token
Jeśli zakładka zostanie zamknięta lub odświeżona jej zawartość przed skopiowaniem tokena, trzeba będzie powtórzyć operację. Nie ma możliwości odczytania wartości tokena w późniejszym momencie.
:::

### Deployment fluxa

Aby rozpocząć korzystanie z Fluxa należy wykonać bootstrap. W tym procesie flux generuje i wdraża swoje manifesty na klastrze kubernetes i publikuje je we wskazanym repozytorium. Miejscem przechowywania konfiguracji klastra mojego środowiska jest Github. Lista dostępnych opcji znajduje się w [dokumentacji procesu bootstrap](https://fluxcd.io/flux/installation/bootstrap/)

::: important Kubernetes
Zanim wykonamy polecenie flux należy być zalogowanym do klastra kubernetes w którym chcemy mieć zainstalowanego fluxa.
:::

```bash
export GITHUB_TOKEN=gh-xxxxxxxxxxxxx
flux bootstrap github \
  --components-extra=image-reflector-controller,image-automation-controller \
  --token-auth \
  --owner=HomeDevopsLab \
  --repository=homelab \
  --branch=main \
  --path=clusters/raspberry \
  --personal
```

Polecenie powyżej instaluje manifesty fluxa w repozytorium o nazwie **homelab**, które znajduje się w projekcie: **HomeDevopsLab**. Manifesty fluxa znajdują się w katalogu: **clusters/raspberry** w tym repozytorium. Flux będzie wdrażał wszyskie zmiany, które pojawią się na branchu **main**.

Dodatkowymi komponentami, które są wykorzystywane w klastrze są:

- image-reflector-controller
- image-automation-controller

Służą one do wykrywania i wdrażania nowych wersji kontenerów.

### Aktualizacja tokenu PAT

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

## Wdrażanie aplikacji

Wdrażanie aplikacji odbywa się na podstawie pliku: `clusters/raspberry/apps.yaml`. Zdefiniowane są tam 3 ważne rzeczy:

- **sourceRef**: obiekt typu GitRepository, który przechowuje namiary na repozytorium na którym operuje flux
- **decryption**: namiary na secret SOPS służący do deszyfracji secretów
- **path**: ścieżka do katalogu w repozytorium, który będzie skanował flux w poszukiwaniu zmian do wdrożenia.

::: info Kustomization
Aktualnym katalogiem używanym przez fluxa jest katalog: `apps-raspberry`.
::::

### Struktura repozytorium

```markmap
---
markmap:
  colorFreezeLevel: 2
---

# homelab
## clusters
### raspberry
## apps-raspberry
### gitrepos
### letsencrypt
### monitoring
### secrets
### tools
### webapps
## base
## attic
```

| Katalog        | Opis                                                                                                                                                                                                      |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| clusters       | Konfiguracja fluxa pozostała dotycząca konfiguracji corowej clustra                                                                                                                                       |
| apps-raspberry | każdy manifest wgrany do tego katalogu zostanie wdrożony przez fluxa. Ten bszar został podzielony na podkatalogi, w których znajdują się manifesty aplikacji, które odpowiadają za różne logiczne obszary |
| base           | W tym katalgu znajduje się konfiguracja Kustomize'a dla aplikacji.                                                                                                                                        |
| attic          | Manifesty, które nie są obecnie używane. Archiwum.                                                                                                                                                        |

### Kustomization

Kustomize umożliwia zredukowanie wielkości manifestu HelmRelease umieszczając w **base** konfigurację, która jest wspólna dla wszystkich aplikacji uruchomionych jednego HelmRelase'a.

W tym momencie jedyną aplikacją wykorzystującej kustomize jest dashboard homer.

#### ⚙️ Konfiguracja Base

Obecnie jedynym szablonem kustomize jest `webapps`. Znajduje się on w katalogu `base`. Składa się on z dwóch plików:

- release.yaml
- kustonization.yaml

Plik release.yaml zawiera definicję zasobu HelmRelease z domyślnymi wartościami.

```yaml
apiVersion: helm.toolkit.fluxcd.io/v2beta1
kind: HelmRelease
metadata:
  namespace: default
  name: www
  ...
```

W powyższym przykładzie `metadata/name` jest używany do budowania nazwy release'a.

::: tabs

@tab kustomization.yaml

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
  - release.yaml
```

:::

W kustomization.yaml podajemy jako resources plik relase.yaml utworzony w tym samym katalogu.

#### ⚙️ Konfiguracja aplikacji

Konfiuracja nie różni się znacznie od `base`. Tworzymy plik app.yaml z definicją HelmRelease, który ma taką samą konfigurację metadata

```yaml
apiVersion: helm.toolkit.fluxcd.io/v2beta1
kind: HelmRelease
metadata:
  name: www
  namespace: default
```

oraz plik kustomization.yaml

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
  - ../../../base/webapps
patchesStrategicMerge:
  - app.yaml
namePrefix: homer-
```

Konfiguracja kustomization.yaml różni się nieco od tej w `base`. W resources podajemy ścieżkę do template'u `base`. Dodatkowo używając `patchesStrategicMerge` podłączamy HelmRelease dla aplikacji. Opcja `namePrefix` ustawia przedrostek dla stworzonych na podstawie HelmRelease'a obiektów kubernetes.

Powyższa konfiguracja łączy to co jest w pliku app.yaml z zawartością base/webapps.

::: warning Kustomize
Pliki definiujące Kustomize muszą mieć nazwę: kustomization.yaml
:::

## Obsługa HelmChart

w katalogu `apps-raspberry/gitrepos` przechowywane są manifesty typu: **GitRepository**, które służą do synchronizowania repozytorium HelmChart. Obiekty GitRepository są okresowo skanowane przez fluxa w poszukiwaniu nowych zmian.

### GitRepository

Definicja manifestu

```yaml {4}
apiVersion: source.toolkit.fluxcd.io/v1beta2
kind: GitRepository
metadata:
  name: app-chart
  namespace: default
spec:
  interval: 1m
  url: https://github.com/myawesomeproject/appchart
  ref:
    branch: main
```

Użycie manifestu w aplikacji

```yaml {13}
apiVersion: helm.toolkit.fluxcd.io/v2beta1
kind: HelmRelease
metadata:
  name: myapp
  namespace: default
spec:
  interval: 1m
  chart:
    spec:
      chart: ./chart
      sourceRef:
        kind: GitRepository
        name: app-chart
        namespace: default
      interval: 1m
  values:
```

W Helmrelease aplikacji używamy `name` aby powiązać oba obiekty.

### Wdrożenie nowych funkcjonalności

Wykonywanie zmian na helmcharcie może prowadzić do nieoczekiwanego zachowania się działających aplikacji. Z tego względu nową konfigurację tworzę na dedykowanym branchu w repozytorium helmcharta.

#### Konfiguracja brancha w repozytorium clustra

W celu podłączenia nowego bracncha tworzymy nowy plik w katalogu `apps-repository/gitrepos` z definicją **GitRepository**.

```yaml {4,10}
apiVersion: source.toolkit.fluxcd.io/v1beta2
kind: GitRepository
metadata:
  name: app-chart-feature
  namespace: default
spec:
  interval: 1m
  url: https://github.com/myawesomeproject/appchart
  ref:
    branch: new-feature
```

Na clustrze zostanie utworzony nowy obiekt **GitRepository**, który będzie śledził zmiany na wskazanym branchu. Mając wykonaną konfigurację podłączamy w HelmRelease w wybranej aplikacji zdefiniowny w ten sposób helmchart. Dzięki temu jesteśmy w stanie kontrolować czy wykonane zmiany są kompatybilne z resztą aplikacji uruchomionych w clustrze.

#### Wdrożenie nowej wersji HelmChart

---

Jeśli wszystkie zmiany działają poprawnie wykonujemy następujące czynności.

1. Przygotowujemy release helmcharta. Zmieniamy wersję i mergujemy z masterem
2. Zmieniamy we wszystkich manifestach HelmRelease nazwę dowiązanego HelmCharta na tą, która jest powiązana z branchem main
3. Usuwamy plik z `apps-repository/gitrepos`, który jest powiązany z branchem
4. Usuwamy branch z repozytorium.

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