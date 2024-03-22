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
Do prawidłowego wykonania zadań w playbooku muszą zostać ustawione zmienne środowiwskowe

| Zmienna | Opis |
| --------| -----|
| PROXMOX_API_USER | Konto administratora serwera proxmox |
| PROXMOX_API_PASS | Hasło do konta administratora |
| PROXMOX_API_HOST | Adres serwera proxmox |

Zmienne należy dostarczyć do użytego pipeline'u lub wyeksportować je do terminala lokalnego, jeśli będziemy uruchamiać playbooka ręcznie.

