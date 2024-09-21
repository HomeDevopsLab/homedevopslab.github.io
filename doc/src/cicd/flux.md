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

::: important Base64
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

### SOPS

## Obsługa HelmChart

### Gitrepo

## Image automation
