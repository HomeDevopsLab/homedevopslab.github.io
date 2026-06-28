---
name: release-documentation
description: Skill do publikowania zmian w dokumentacji. Naprawia błędy stylistyczne, tłumaczy artykuł na wskazany język, zarządza branchem i CHANGELOG, tworzy Merge Request i taguje release. Używaj zawsze gdy użytkownik chce opublikować, wypuścić, wrzucić lub udostępnić zmiany w dokumentacji — niezależnie od phrasingu: "opublikuj", "release", "push", "wrzuć zmiany", "stwórz tag", "wypchnij" itp.
arguments: filename language
allowed-tools: Read Edit Write Bash(git *) Bash(glab *)
---

# Wprowadź poprawki w dokumentacji

1. Jako Lead Technical Writer z ponad 10 letnim doświadczeniem, zapoznaj się z dokumentacją w $filename i napraw wszystkie błędy stylistyczne oraz literówki.
2. Pokaż podsumowanie zmian i poproś użytkownika o zatwierdzenie.
3. Jeśli użytkownik zgłosi poprawki, wykonaj następną iterację zmian aż nie uzyskasz akceptacji.

## Tłumaczenie oraz przygotowanie zmiany

Kroki należy wykonać po uzyskaniu akceptacji w poprzedniej sekcji.

1. Przetłumacz $filename i zapisz plik pod tą samą nazwą w $language wersji dokumentacji.
2. Upewnij się, że nie jesteś na branchu `main`.
3. Jeśli jesteś na branchu `main`, stwórz feature branch o nazwie `docs/<basename-pliku>` (np. dla `kubernetes/sops.md` → `docs/sops`).
4. Zaktualizuj `CHANGELOG.md` z nową wersją w formacie semver. Wpisuj zmiany po angielsku, w 1–2 zdaniach opisujących efekt biznesowy.

## Merge Request

1. Wypchnij feature branch do repozytorium i utwórz Merge Request za pomocą:
   ```
   glab mr create --remove-source-branch --fill
   ```
2. Podeślij link do Merge Request i poproś o review.

## Opublikowanie zmian

Po uzyskaniu akceptacji Merge Requesta:

1. Zrób merge.
2. Stwórz taga zgodnego z najnowszym wpisem (semver) w CHANGELOG i opublikuj go:
   ```
   git tag <wersja> && git push origin <wersja>
   ```

# Zasady nadawania wersji (SemVer)

## Major version (X.0.0)

- Krytyczne zmiany strukturalne repozytorium (np. zmiana frameworka dokumentacji, reorganizacja całej architektury katalogów, upgrade silnika VuePress).

## Minor version (0.X.0)

- Dodanie nowego artykułu w istniejącej sekcji tematycznej (np. nowa strona w `kubernetes/` lub `proxmox/`).
- Dodanie nowej podsekcji (np. `kubernetes/networking/`).
- Dodanie tłumaczenia istniejącego artykułu na nowy język.

## Patch version (0.0.X)

- Aktualizacja treści w istniejącym pliku, poprawki literówek, formatowania Markdown, drobne poprawki tłumaczeń.
