---
name: updating-index-page
description: Skill do tworzenia sekcji na stronie głównej. Strona główna generowana jest z pliku doc/src/README.md dla wersji polskiej oraz doc/src/<lang>/README.md dla wersji w innym języku. Używaj zawsze, kiedy użytkownik poprosi o przygotowanie nowej sekcji na stronie na wybrany przez niego temat.
allowed-tools: Read Edit Write
---

# Workflow tworzenia sekcji na stronie głównej

Skopiuj sobie checklistę aby śledzić progress

```
```
Przygotowanie sekcji strony:
- [ ] Krok 1: Analiza prompta
- [ ] Krok 2: Akceptacja tekstu przez użytkownika
- [ ] Krok 3: Stworzenie obrazka dla sekcji
- [ ] Krok 4: Usunięcie watermark gemini
- [ ] Krok 5: Optymalizacja rozmiaru obrazka
- [ ] Krok 6: Stworzenie tła sekcji
- [ ] Krok 7: Analiza kodu doc/src/README.md
- [ ] Krok 8: Przygotowanie kodu sekcji
- [ ] Krok 9: Analiza styli scss
- [ ] Krok 10: Aktualizacja styli scss
```
```

**Krok 1: Analiza prompta**

Jako Senior DevOps & Infrastructure Architect (Technical Documentation Expert) z 10 letnim doświadczeniem przeanalizuj prompt użytkownika.

**Krok 2: Akceptacja tekstu przez użytkownika**

Zaproponuj dwuzdaniowy akapit wraz z trzema "bullet pointami", które będą rozwinięciem opisu dostarczonego przez użytkownika i poproś o zaakceptowanie. Jeśli uzytkownik nie zatwierdzi propozycji, wróć do Kroku 1.

**Krok 3: Stworzenie obrazka dla sekcji**

Na podstawie tekstu w Kroku 2 stwórz obrazek, który zostanie użyty jako ilustracja dla sekcji. Do stworzenia obrazka użyj serwera MCP `nano-banana`.

**Krok 4: Usunięcie watermark gemini**

Użyj skilla `gemini-watermark-remover` aby usunąć watermark z wygenerowanego obrazka.

**Krok 5: Optymalizacja rozmiaru obrazka**

Zoptymalizuj rozmiar obrazka zgodnie z najlepszymi strandardami tworzenia stron internetowych. Zapamiętaj nazwę obrazka, będzie ona potrzebna w kroku 8.

**Krok 6: Stworzenie tła sekcji**

Tło ma zostać stworzone w formacie SVG. Kolorystyka i styl ma nawiązywać do już zdefiniowanych wcześniej sekcji. 

Tło powinno być w dwóch wariantach kolorystycznych: 
- dark mode
- light mode

Obie wersje tła mają zostać zapisane w osobnych plikach. Będą one potrzebne podczas tworzenia kodu yaml sekcji

**Krok 7: Analiza kodu doc/src/README.md**

Przeanalizuj strukturę pliku `doc/src/README.md`. 

Zwróć uwagę na rodzaje użytych sekcji.
- Baza wiedzy: odnośniki są w highlights/features
- Kaminie milowe, Wirtualizacja, Orkiestracja wykorzystują: hightlights/highlights

**Krok 8: Przygotowanie kodu sekcji**

Stwórz kod sekcji w pliku `doc/src/README.md` oraz dla wersji angielskiej: `doc/src/en/README.md`.
Na podstawie analizy w kroku 1 stwórz akapit zawierający maksymalnie dwa zdania oraz trzy "bullet pointy".
Zapoznaj się z [examples](examples.md), stwórz kompletny kod yaml dla nowej sekcji. Sekcja ma być typu: highlights/highlights.


**Krok 9: Analiza styli scss**

Customowe style zdefiniowane są w pliku `doc/src/.vuepress/styles/config.scss`. Zrób nalizę tego pliku. Zwróć szczególną uwagę na responsywność kodu.

**Krok 10: Aktualizacja styli scss**

Customowe style zdefiniowane są w pliku `doc/src/.vuepress/styles/config.scss`.

Sekcje typu: highlights/highlights powinny wykorzystywać układ "Z-pattern". Połowa szerokości ekranu jest przeznaczona na obrazek, a druga na tekst.
Część, która zawiera tekst ma mieć dwa akapity. Pierwszy: dwuzdaniowy opis, drugi: 3 bullet pointy.
Bullet pointy mają mieć ostylowaną ikonę oraz tekst. Seksja ma zostać zaprojektowana zgodnie z najlepszymi standardami webdesign, takimi jak typografia, rozmiar czcionek, odstępy między wierszami i literami. Bulletpointy najlepiej jakby miały formę boxów.

