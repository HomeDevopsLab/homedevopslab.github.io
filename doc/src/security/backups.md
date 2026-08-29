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

- snapshotowy backup maszyn wirtualnych,
- szczegółowy backup baz danych.

![Homelab backups diagram](/assets/image/homelab-backups.svg)

## Backup maszyn wirtualnych

Backup uruchamiany jest z poziomu klastra Proxmox jako cronjob. Kopie zapisywane są na zewnętrznym urządzeniu NAS, zamontowanym w klastrze Proxmox przez protokół NFS.

::: warning
Backup maszyn wirtualnych na tę chwilę nie zabezpiecza przed utratą danych na serwerze NAS. Temat trzeba przeanalizować od strony kosztowej i technologicznej.
:::

### Harmonogram

| Harmonogram | Maszyny wirtualne   |
| ----------- | ------------------- |
| `0 1 * * *` | srv-storage, srv-db |

### Powiadomienia

Po wykonaniu zadania backupu wysyłany jest e-mail z raportem oraz uruchamiany skrypt, który generuje statystyki dla Prometheusa. Są one później wykorzystywane do wizualizacji w Grafanie.

#### Metryki

- nazwa maszyny wirtualnej,
- rozmiar snapshotu,
- czas wykonywania backupu.

## Backup baz danych

Bazy danych backupowane są w dwóch lokalizacjach:

- lokalny NAS,
- AWS S3.

Spełnia to kryteria strategii 3-2-1.

::: tip Backup 3-2-1

- **3 kopie**: dane produkcyjne oraz dwa niezależne backupy. Jeśli jeden z nich zostanie uszkodzony, wciąż jest możliwość odtworzenia danych.
- **2 rodzaje nośników**: jedna kopia przechowywana jest na serwerze NAS, druga w usłudze chmurowej.
- **1 kopia off-site**: co najmniej jedna kopia danych znajduje się w innej lokalizacji fizycznej.
:::

### Harmonogram

Backup uruchamiany jest codziennie o 6 rano ze schedulera w Kubernetes.

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
