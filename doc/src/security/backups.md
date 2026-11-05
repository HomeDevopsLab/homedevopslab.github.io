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

## Backup plikowy

Detaliczny backup plików wykonywany jest narzędziem [Borg](https://www.borgbackup.org/). Repozytorium Borga znajduje się na serwerze TrueNAS. Wykonywaniem backupu steruje harmonogram CronJoba w Kubernetes. Bakcupy są szyfrowane. Podlegają kompresji oraz deduplikacji, co dodatkowo zmniejsza ilość wykorzystanej przestrzeni na dysku.

![Borg Schemat](/assets/image/borg-schema.svg)

::: info Cloud backup
Decyzja o miejscu w chmurze, gdzie będzie trzymana kopia backupu jeszcze nie została podjęta. Na pewno będzie to zależało od wielkości miesięcznego backupu.
:::

### Instalacja Borga

Metody instalacji można znaleźć w [oficjalnej dokumentacji](https://borgbackup.readthedocs.io/en/stable/installation.html). Ja wybrałem opcję ręcznej instalacji binarki (Standalone Binary) pochodzącej z [projektu na Githubie](https://github.com/borgbackup/borg/releases). Dużą zaletą Borga jest to, że wystarczy go zainstalować w jednym miejscu, np. maszynie wirtualnej z której będzie wykonywany backup. Nie ma konieczności instalowania serwera i klientów. Borg może też działać w kontenerze.

::: important Kompatybilność
Dokumentacja jest zgodna z wersją 1.x Borga. Wersja 2.x posiada nieco inną składnię i opisane polecenia nie będą działać.
:::

### Inicjalizacja repozytorium

Zanim będzie można wykonać pierwszy backup trzeba wybrać miejsce, gdzie może być on przechowywany i zainicjować repozytorium.

```bash :no-line-numbers
export BORG_REPO=/mnt/truenas/borgbackup
export BORG_PASSPHRASE='superSecret'
borg init --encryption=repokey
```

### Uruchomienie backupu (cli)

Przed uruchomieniem backupu warto ustalić kilka kwestii.

1. Jak mają się nazywać kolejne backupy. Nie da się utworzyć backupu z nazwą archiwum, która już została wcześniej użyta.
2. (Opcjonalnie) - czy zastosować prefix dla nazw archiwów (np. `backup-`)
3. Retencja (daily / weekly / monthly)


```bash :no-line-numbers
export BORG_REPO=/mnt/truenas/borgbackup
export BORG_PASSPHRASE='superSecret'
borg create \
  --stats \
  --show-rc \
  --progress \ 
  ::20261105 /mnt/storage/katalog1 /mnt/storage/katalog2 /mnt/storage/katalog3

borg prune \
  --stats \
  --show-rc \
  --progress \
  --keep-daily=7 \
  --keep-weekly=4 \
  --keep-monthly=6

borg compact --cleanup-commits --show-rc --progress
```

W powyższym przykładzie zostanie uruchomiony backup dla trzech katalogów, nazwa archiwum to: `20261105`. Backup na kolejny dzień zostanie utworzony pod nazwą: `20261106`. Konwencja z datą bieżącego dnia pozwoli uniknąć kolizji w nazwach archiwum.

Kolejne polecenie: `borg prune` wykonuje ustaloną politykę retencji backupu. Ostatnie polecenie: `borg compact` porządkuje bazę borga.

### Uruchomienie backupu (docker)

To samo można uzyskać uruchamiając Burga w kontenerze dockera

```bash
docker run --rm \
  -e BORG_REPO=/mnt/truenas/borgbackup \
  -e BORG_PASSPHRASE='superSecret' \
  -e ARCHIVE="{now:%Y%m%d}" \
  -e SHOW_PROGRESS=1 \
  -e PRUNE=1 \
  -e BACKUP_DIRS="/mnt/storage/katalog1 /mnt/storage/katalog2 /mnt/storage/katalog3" \
  -e BORG_CACHE_DIR=/mnt/srv-storage/borg/cache \
  -v /mnt/srv-storage:/mnt/srv-storage \
  -v /mnt/truenas:/mnt/truenas \
  --name borg-backup \
  pschiffe/borg
```

::: tip ARCHIVE
Użyte w przykładzie wyrażenie: `{now:%Y%m%d}` instruuje borga, że ma pobrać aktualną datę z systemu, sformatować ją i użyć jako nazwę dla archiwum.
:::

::: tip Cache
W przypadku dockera warto ustawić zmienną `BORG_CACHE_DIR`, która umożliwi zapisanie cache poza kontenerem dockera. Pozwala to na znaczne skrócenie czasu wykonywania się backupów w kolejnych dniach.
:::

### Przydatne polecenia

#### Lista backupów
```bash :no-line-numbers title="borg list"
20261101                             Sun, 2026-11-01 08:09:03 [8ff280cad1cdd5c1ee212d1971b72b2179d2111a989c4d69c2a2d870ec4628bf]
20261102                             Mon, 2026-11-02 06:16:17 [79b25e0a919d45e9fb5ac177d180177f1699f0c1b282db426358335f56e50e4e]
20261103                             Tue, 2026-11-03 18:03:02 [988028c0b20db6ddda25a10cbac89e7dedb66a9ecabf3746a7555fb10a5417d8]
20261104                             Wed, 2026-11-04 07:00:04 [19522644f2dd78d0e071df9114662e36f0f653360cc47d5fa0ffcfac46d40a20]
20261105                             Thu, 2026-11-05 07:00:24 [f2a74a4b48a87e50f789e242fe9132ffe413269bfff3bc0c6a999eaeb40de912]
```

#### Zbiorcza informacja o bakckupach

```bash :no-line-numbers title="borg info"
Repository ID: 6366992d491b2254f42edf86a343c86736e75be558d74309a05122cc1cb9316c
Location: /mnt/truenas/borgbackup
Encrypted: Yes (repokey)
Cache: /root/.cache/borg/6366992d491b2254f42edf86a343c86736e75be558d74309a05122cc1cb9316c
Security dir: /root/.config/borg/security/6366992d491b2254f42edf86a343c86736e75be558d74309a05122cc1cb9316c
------------------------------------------------------------------------------
                       Original size      Compressed size    Deduplicated size
All archives:                1.07 TB              1.05 TB            186.82 GB

                       Unique chunks         Total chunks
Chunk index:                  124256               684945
```

#### Informacja o wybranym backupie

```bash :no-line-numbers title="borg info ::20261105"
Archive name: 20261105
Archive fingerprint: f2a74a4b48a87e50f789e242fe9132ffe413269bfff3bc0c6a999eaeb40de912
Comment:
Hostname: borg-backup-29897640-5br29
Username: root
Time (start): Thu, 2026-11-05 07:00:24
Time (end): Thu, 2026-11-05 07:10:44
Duration: 10 minutes 20.05 seconds
Number of files: 60114
Working Directory: /
Command line: /usr/sbin/borg create --stats --show-rc --info '::{now:%Y%m%d}' /mnt/srv-storage/paperless-webserver /mnt/srv-storage/element-synapse /mnt/srv-storage/immich-server
Utilization of maximum supported archive size: 0%
------------------------------------------------------------------------------
                       Original size      Compressed size    Deduplicated size
This archive:              213.56 GB            210.97 GB             13.06 MB
All archives:                1.07 TB              1.05 TB            186.82 GB

                       Unique chunks         Total chunks
Chunk index:                  124256               684945
```

#### Różnice pomędzy dwoma backupami.

```bash :no-line-numbers title="org diff --content-only ::20261103 20261104"
  +1.9 MB   -1.9 MB mnt/srv-storage/paperless-webserver/data/celerybeat-schedule.db-wal
 +32.8 kB  -32.8 kB mnt/srv-storage/paperless-webserver/data/celerybeat-schedule.db-shm
 +80.3 kB  -76.6 kB mnt/srv-storage/paperless-webserver/data/log/paperless.log
+476.4 kB -259.1 kB mnt/srv-storage/paperless-webserver/data/log/celery.log
added directory     mnt/srv-storage/element-synapse/data/media_store/local_content/fk/GN
added     354.04 kB mnt/srv-storage/element-synapse/data/media_store/local_content/fk/GN/ayaFtfhqkYTaeVFkbvhI
added directory     mnt/srv-storage/element-synapse/data/media_store/local_content/bc
added directory     mnt/srv-storage/element-synapse/data/media_store/local_content/bc/FF
added       2.15 MB mnt/srv-storage/element-synapse/data/media_store/local_content/bc/FF/ZWUCnSTrXqnaYZhqzSiW
added directory     mnt/srv-storage/element-synapse/data/media_store/local_content/tx
added directory     mnt/srv-storage/element-synapse/data/media_store/local_content/tx/Ws
added     676.76 kB mnt/srv-storage/element-synapse/data/media_store/local_content/tx/Ws/bkycCLyWGsXtoGbzmRcr
added directory     mnt/srv-storage/element-synapse/data/media_store/local_content/Ma
added directory     mnt/srv-storage/element-synapse/data/media_store/local_content/Ma/vp
added     157.16 kB mnt/srv-storage/element-synapse/data/media_store/local_content/Ma/vp/RiDxQDbZblslBBUXBuMn
```

