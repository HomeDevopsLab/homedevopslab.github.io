# docs.lab.angrybits.pl

Strona wygenerowana jest za pomocą [VuePress Theme Hope](https://theme-hope.vuejs.press/)

## Inicjalizacja projektu
Do inicjalizcji projektu potrzebny jest zainstalowany NodeJS.

```bash
npm init vuepress-theme-hope@latest doc
```

## Praca z frameworkiem
Podczas tworzenia dokumentacji możemy uruchomić sobie na komputerze dev server.

```bash
cd doc
npm run docs:dev
```
## Dev Hints

Nawigację na stronie konfiguruje się w plikach: 
* doc/src/.vuepress/sidebar.ts (menu boczne)
* doc/src/.vuepress/navbar.ts (menu górne)

Różne opcje związane z pluginami, których możemy używać z tym frameworkiem, ich włączaniem bądź wyłączaniem robi się w pliku: `doc/src/.vuepress/theme.ts`.