---
title: VM Machines
icon: computer
order: 2
category:
  - Guide
tag:
  - proxmox
---

Bieżąca konfiguracja uruchomionych maszyn wirtualnych znajduje się w repozytorium git: **proxmox-vms**.

## Playbook

Repozytorium posiada jednego playbooka: `deploy-vms.yaml`. Ma on za zadanie stworzyć maszyny virtualne na podstawie pliku `group_vars/proxmox_hosts`.

## Zmienne środowiskowe

Do prawidłowego wykonania zadań w playbooku muszą zostać ustawione zmienne środowiskowe

| Zmienna          | Opis                                 |
| ---------------- | ------------------------------------ |
| PROXMOX_API_USER | Konto administratora serwera proxmox |
| PROXMOX_API_PASS | Hasło do konta administratora        |
| PROXMOX_API_HOST | Adres serwera proxmox                |

Zmienne należy dostarczyć do użytego pipeline'u lub wyeksportować je do terminala lokalnego, jeśli będziemy uruchamiać playbooka ręcznie.

## Tworzenie maszyn VM

::: important Git
Dodawanie maszyn VM robimy na nowym branchu w repozytorium, aby zachować funkcjonalność code review.
:::

### Struktura konfiguracji

Maszyny wirtualne zdefiniowane są w pliku `group_vars/proxmox_hosts`. Plik zawiera ustruktyzowaną listę parametrów maszyn wirtualnych. Na pierwszym poziomie jest klucz **vms**, który jest punktem odniesienia dla pętli, która jest zaimplementowana w playbooku.

## Konfiguracja VM

Na modelu danych powyżej **vm_type** jest wykorzystywany do tworzenia labelki vm-ki, która z kolei jest potrzebna do tworzenia inventory. Parametr ten powinno się traktować jak nazwę grupy.

### Name

Nazwa maszyny wirtualnej, która będzie widoczna w panelu proxmoxa.

### Template

Nazwa template'u, z którego ma zostać utworzona VM-ka. [Tworzenie template'ów](/proxmox/vmtemplates.md)  
Lista dostępnych template'ów: [Dostępne template'y](/proxmox/template_list.md)

### Disk

Disk posiada dwa parametry:

- disksize
- storage

Disksize określa wielkość dysku w GB, natomiast w storage ustawiamy nazwę storage proxmoxa na którym ma zostać utworzona vmka. Labowy proxmox ma do wyboru dwa typy storage:

- local-lvm
- big-storage

::: tip Storage
Jeśli potrzebujemy szybkiego dysku (np. do baz danych) wybieramy local-lvm, jeśli potrzebujemy przechowywać dużo danych: big-storage
:::

Local-lvm znajduje się na dysku NVME, natomiast big-storage na macierzy RAID złożonej z dysków talerzowych 2x4TB.

### CPU

W CPU określamy ile wątków ma widzieć vm-ka. Określamy to za pomocą **vcpus** oraz **cores**. Serwer posiada jeden procesor, więc **sockets** ma zawsze wartość: 1.

### Memory

Ta opcja określa ile ramu ma mieć maszyna wirtualna. Wartość podajemy w MB

### Network

W HomeLAB'ie nie używam serwera DHCP. W związku z tym rozbudowałem sekcję network aby dało się skonfigurować sieć statycznie na vm-kach.

- **ipconfig**: zawiera string w formacie zgodnym z modułem ansiblowym do proxmoxa
- **dns**: adres IP serwera DNS.

### SMBios

Konfigurację SMBios wykunuję ze względu na sposób w jaki przygotowane zostały template'y maszyn wirtualnych. Wprowadzona konfiguracja ma za zadanie zmienić hostname na utworzonych z playbooka vmkach.

- **uuid**: UUID maszyny wirtualnej. Możemy go wygenerować korzystając ze strony [Online UUID Generator](https://www.uuidgenerator.net/version4)
- **serial**: zawiera string, który ustawia hostname na vm-ce

## Wdrożenie zmian

Wdrożenie zmian polega na przygotowaniu brancha, który będzie zawierał zaktualizowany plik `group_vars/proxmox_hosts`. Na podstawie brancha powinien powstać pull request, który musi spełnić wymagania:

- weryfikację przez pipeline czy nie zawiera błędów
- code review

Po zatwierdzeniu zmian i zmergowaniu ich do main trzeba ustawić nowy tag z wersją aby zainicjować wdrożenie na proxmoxie.
