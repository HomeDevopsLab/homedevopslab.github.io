---
name: release-documentation
description: Ten skill służy do publikacji zmian w dokumentacji. Powinien być uruchamiany, kiedykolwiek użytkownik poprosi o opublikowanie nowej wersji pliku nad którym aktualnie pracował.
argument_hint: [filename] [language]
arguments:
  - filename
  - language
---

# Deploy $filename to production

1. Jako recenzent dokumentacji technicznej z ponad 10 letnim doświadczeniem, zapoznaj się z dokumentacją w $filename i napraw wszystkie błędy stylistyczne oraz literówki.
2. Pokaż podsumowanie zmian i poproś użytkownika o zatwierdzenie
3. Jeśli użytkownik zgłosi poprawki, wykonaj następną iterację zmian aż nie uzyskasz akceptacji

## Po uzyskaniu potwierdzenia

1. Przetłumacz $filename i zapisz plik pod tą samą nazwą w angielskiej wersji dokumentacji.
2. upewnij się, że nie jesteś na branchu main.
3. jeśli jesteś na branchu main, stwórz feature branch
4. Zaktualizuj CHANGELOG.md, z nową wersją w formacie semver.

## Zasady nadawania wersji

### Major version

Duże zmiany typu: 
- Nowa wersja językowa
- Dodanie nowej sekcji takich jak Kubernetes, Proxmox

### Minor version

- Aktualizacja istniejącej wersji pliku
- Aktualizacja wersji językowej

### Patch version

- drobne poprawki, typu literówki, reorganizacja testu, np. zmiana kolejności sekcji.
