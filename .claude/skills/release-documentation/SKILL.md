---
name: release-documentation
description: Ten skill służy do publikacji zmian w dokumentacji. Powinien być uruchamiany kiedy użytkownik poprosi o opublikowanie nowej wersji pliku nad którym aktualnie pracował.
argument-hint: [filename] [language]
arguments:
  - filename
  - language
allowed-tools:
  - git
  - gh
---

# Wprowadź poprawki w dokumentacji

1. Jako Lead Technical Writer z ponad 10 letnim doświadczeniem, zapoznaj się z dokumentacją w $filename i napraw wszystkie błędy stylistyczne oraz literówki.
2. Pokaż podsumowanie zmian i poproś użytkownika o zatwierdzenie
3. Jeśli użytkownik zgłosi poprawki, wykonaj następną iterację zmian aż nie uzyskasz akceptacji

## Tłumaczenie oraz przygotowanie zmiany

Kroki należy wykonać po uzyskaniu akceptacji w poprzedniej sekcji

1. Przetłumacz $filename i zapisz plik pod tą samą nazwą w $language wersji dokumentacji.
2. upewnij się, że nie jesteś na branchu main.
3. jeśli jesteś na branchu main, stwórz feature branch
4. Zaktualizuj CHANGELOG.md, z nową wersją w formacie semver.

## Merge request

1. Opublikuj feature branch w repozytorium i przygotuj Merge Request
  - merge request powinien mieć od razu ustawioną flagę, która usunie branch po wykonaniu merge
2. Podeślij link do Merge Request i poproś o review.

## Opublikowanie zmian 

Po uzyskaniu akceptacji merge requesta

1. Zrób merge
2. Stwórz taga zgodnego z najnowszym wpisem (semver) w CHANGELOG i opublikuj go w repozytorium

# Zasady nadawania wersji (SemVer)

## Major version (X.0.0)

- Krytyczne zmiany strukturalne repozytorium (np. zmiana frameworka dokumentacji, reorganizacja całej architektury katalogów).

## Minor version (0.X.0)

- Dodanie nowej sekcji tematycznej (np. instrukcje do Kubernetes, Proxmox).
- Dodanie całkowicie nowej wersji językowej dla istniejącego dokumentu.

## Patch version (0.0.X)

- Aktualizacja treści w istniejącym pliku, poprawki literówek, formatowania Markdown, drobne poprawki tłumaczeń.
