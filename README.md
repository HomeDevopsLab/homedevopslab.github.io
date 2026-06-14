# docs.lab.angrybits.pl

Strona z dokumentacją homelaba wygenerowana za pomocą [VuePress Theme Hope](https://theme-hope.vuejs.press/). Dostępna w dwóch językach: polskim (domyślny) i angielskim (`/en/`).

## Wymagania

- Node.js 22+

## Instalacja

```bash
cd doc
npm install
```

## Praca lokalna

```bash
cd doc
npm run docs:dev          # Dev server z hot-reload
npm run docs:clean-dev    # Dev server z wyczyszczonym cache
```

## Budowanie

```bash
cd doc
npm run docs:build
```

Statyczne pliki (html, css, js) trafią do `doc/src/.vuepress/dist/`.

## Konfiguracja nawigacji

- `doc/src/.vuepress/navbar/pl.ts` i `navbar/en.ts` — menu górne
- `doc/src/.vuepress/sidebar/pl.ts` i `sidebar/en.ts` — menu boczne

Ogólne opcje motywu i pluginów: `doc/src/.vuepress/theme.ts`

Dodanie nowego pliku `.md` do katalogu `proxmox/` lub `kubernetes/` automatycznie pojawia się w menu bocznym — nie wymaga edycji konfiguracji sidebara.

## Deployment

CI/CD uruchamia się automatycznie przy pushu **taga** na GitLab. Pipeline:

1. Pobiera dane dostępowe do rejestru Docker z Vault (JWT auth)
2. Buduje wieloarchitekturowy obraz Docker (`linux/amd64`, `linux/arm64/v8`)
3. Pushuje obraz z tagiem odpowiadającym tagowi git

Obraz oparty jest na dwuetapowym Dockerfile: Node 22 Alpine do budowania, nginx do serwowania.
