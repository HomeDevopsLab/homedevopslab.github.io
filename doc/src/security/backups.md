---
title: Backupy
icon: arrows-rotate
order: 1
category:
  - Guide
tag:
  - backup
---

## Architektura

Backupy w homelabie wykonywane są w dwóch wariantach:
- Snapshot backup maszyn VM
- Detaliczny backup baz danych

![Homelab backups diagram](/assets/image/homelab-backups.svg)

## Backup Maszyn Wirtualnych

Backup uruchomiony jest z poziomu klastra Proxmox jako cronjob. Backupy zapisywane są na zewnętrznym urządzeniu NAS, które jest podmontowane protokołem NFS do klastra proxmox.

::: warning
Backup maszyn wirutalnych na tą chwilę nie zabezpiecza na wypadek utraty danych na serwerze NAS. Temat trzeba przeanalizować od strony kosztowej i technologicznej.
:::

### Harmonogram

| Harmonogram | Maszyny Wirtualne   |
| ------------| --------------------|
| 0 1 * * *   | srv-storage, srv-db |

### Powiadomienia

Po wykonania zadania backupu wysyłany jest email z raportem i wyzwalany jest skrypt, który generuje statysyki dla prometeusza. Są one później wykoszystywane do wizualizacji w grafanie.

#### Metryki

- nazwa maszyny wirtualnej
- rozmiar snapshotu
- czas wykonywania backupu
