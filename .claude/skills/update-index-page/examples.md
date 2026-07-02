## Homepage example

Strona dokumentacji wygenerowana jest z użyciem https://theme-hope.vuejs.press/guide/

```markdown
---
home: true
highlights:
  - header: Easy to install
    image: /assets/image/box.svg
    bgImage: https://theme-hope-assets.vuejs.press/bg/3-light.svg
    bgImageDark: https://theme-hope-assets.vuejs.press/bg/3-dark.svg
    highlights:
      - title: Run <code>pnpm create vuepress-theme-hope hope-project</code> to create a new project with this theme.
      - title: Run <code>pnpm create vuepress-theme-hope add .</code> in your project root to create a new project with this theme.

  - header: Add things you want in Markdown
    description: We extended the standard commonMark specification and added tons of new features for you.
    image: /assets/image/markdown.svg
    bgImage: https://theme-hope-assets.vuejs.press/bg/2-light.svg
    bgImageDark: https://theme-hope-assets.vuejs.press/bg/2-dark.svg
    bgImageStyle:
      background-repeat: repeat
      background-size: initial
    features:
      - title: Links Check
        icon: clipboard-check
        details: Check Markdown links
        link: ./guide/markdown/others.html#link-check

      - title: Hint box
        icon: box-archive
        details: Decorate Markdown content with styles
        link: ./guide/markdown/stylize/hint.html
---
```
```
```

## higlights subsection production example

```markdown
- header: Orkiestracja & GitOps (Kubernetes)
  description: Główne, wysoce dostępne środowisko aplikacyjne klastra k3s. Całość infrastruktury oraz cykl życia usług są zarządzane w pełni deklaratywnie, eliminując potrzebę ręcznej konfiguracji i wdrażania zmian przez SSH.
  image: /assets/image/k3s.jpg
  bgImage: /assets/image/cloudy-light.svg
  bgImageDark: /assets/image/cloudy.svg
  bgImageStyle:
    background-attachment: fixed
    background-position: center -15%
    background-size: contain
    filter: brightness(0.80) contrast(0.7)
  highlights:
    - title: <strong>100% GitOps Driven</strong>
      icon: code-branch
      details: Zero manualnych zmian – stan klastra zsynchronizowany z Git
    - title: <strong>FluxCD Reconcile</strong>
      icon: infinity
      details: Ciągłe sprawdzanie spójności i automatyczne wdrażanie poprawek
    - title: <strong>Helm & Kustomize</strong>
      icon: cubes
      details: Pełna standaryzacja, reużywalność kodu i separacja środowisk
```
```
```
