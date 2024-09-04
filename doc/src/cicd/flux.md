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

[FluxCD](https://fluxcd.io/flux/) jest narzędziem realizującym obszar continous delivery. W moim środowisku homelab używam go do wdrażania wszystkich aplikacji na klastrze kubernetes. Dzięki komponentowi `ImageUpdateAutomation` mogę zautomatuzować wdrażanie nowych wersji aplikacji - jeśli zostanie zbudowany kontener w odpowiedniej wersji.
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

## Github PAT token

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

## Bootstrap clustra w githubie

Aby rozpocząć korzystanie z Fluxa należy wykonać bootstrap. W tym procesie flux generuje i wdraża swoje manifesty na kustsze kubernetes oraz jednocześnie kommituje je do wskazanego repozytorium. Miejscem przechowywania konfiguracji klastra mojego środowiska jest Github. Lista dostępnych opcji znajduje się w [dokumentacji procesu bootstrap](https://fluxcd.io/flux/installation/bootstrap/)

::: important Kubernetes
Zanim wykonamy polecenie flux należy być zalogowanym do klastra kubernetes w którym chcemy mieć zainstalowanego fluxa.
:::

```
export GITHUB_TOKEN=<gh-token>
```

flux bootstrap github \
 --token-auth \
 --owner=HomeDevopsLab \
 --repository=homelab \
 --branch=main \
 --path=clusters/k3s-cl2 \
 --personal
