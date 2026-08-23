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

Po wykonaniu zadania backupu wysyłany jest email z raportem i wyzwalany skrypt, który generuje statystyki dla prometeusza. Są one później wykoszystywane do wizualizacji w grafanie.

#### Metryki

- nazwa maszyny wirtualnej
- rozmiar snapshotu
- czas wykonywania backupu

## Backup baz danych

Bazy dane backupowane są w dwóch lokalizacjach:
- lokalny NAS
- AWS S3

Spełnia to kryteria strategi 321.

::: tip Backup 321
- **3 kopie**: Dane produkcyjne plus dwa różne backupy. Jeśli jeden z nich zostanie uszkodzony, wciąż jest możliwość odtworzenia danych
- **2 rodzaje nośników**: Jedna kopia przechowywana jest na serwerze NAS, druga w usłudze w chmurze.
- **1 kopia off-site**: Przechowuj co najmniej jedną kopię danych w innej fizycznej lokalizacji.
:::

### Harmonogram

Backup uruchamiany jest codziennie o 6 rano z schedulera w kubernetes

```yaml
spec:
  schedule: "0 6 * * *"
  jobTemplate:
    spec:
      template:
        spec:
          nodeSelector:
            kubernetes.io/arch: amd64
          imagePullSecrets:
            - name: image-registry
          containers:
            - name: backup-job
              image: local-image-registry/homelab/db-backup:4.3.0
              imagePullPolicy: IfNotPresent
              command: ["python3", "/opt/app/run.py"]
```

