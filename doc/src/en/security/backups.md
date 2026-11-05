---
title: Backups
icon: arrows-rotate
order: 1
category:
  - Guide
tag:
  - backup
---

## Architecture

Backups in the homelab run in two variants:

- snapshot backups of virtual machines,
- fine-grained backups of databases.

![Homelab backups diagram](/assets/image/homelab-backups.svg)

## Virtual machine backups

The backup runs from the Proxmox cluster as a cronjob. Copies are stored on an external NAS device, mounted in the Proxmox cluster over NFS.

::: warning
Virtual machine backups currently do not protect against data loss on the NAS server. This needs to be evaluated from both a cost and a technology perspective.
:::

### Schedule

| Schedule    | Virtual machines    |
| ----------- | ------------------- |
| `0 1 * * *` | srv-storage, srv-db |

### Notifications

Once the backup job completes, a report e-mail is sent and a script is triggered to generate statistics for Prometheus. They are later used for visualisation in Grafana.

#### Metrics

- virtual machine name,
- snapshot size,
- backup duration.

## Database backups

Databases are backed up to two locations:

- local NAS,
- AWS S3.

This satisfies the criteria of the 3-2-1 strategy.

::: tip 3-2-1 backup

- **3 copies**: production data plus two independent backups. If one of them gets corrupted, the data can still be restored.
- **2 media types**: one copy is kept on the NAS server, the other in a cloud service.
- **1 off-site copy**: at least one copy of the data resides in a different physical location.
:::

### Schedule

The backup runs daily at 6 a.m. from the Kubernetes scheduler.

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

## File-level backups

Fine-grained file backups are performed with [Borg](https://www.borgbackup.org/). The Borg repository lives on the TrueNAS server, and backup runs are driven by a Kubernetes CronJob. Backups are encrypted, compressed and deduplicated, which further reduces the disk space they consume.

![Borg backup diagram](/assets/image/borg-schema.svg)

::: info Cloud backup
The cloud service that will hold an off-site copy of the backup has not been chosen yet. The decision will depend mainly on the monthly backup size.
:::

### Installing Borg

Installation methods are described in the [official documentation](https://borgbackup.readthedocs.io/en/stable/installation.html). I chose a manual installation of the standalone binary from the [project's GitHub releases](https://github.com/borgbackup/borg/releases). A major advantage of Borg is that it only needs to be installed in one place, e.g. on the virtual machine that runs the backup — there is no separate server or client to install. Borg can also run in a container.

::: important Compatibility
This documentation covers Borg 1.x. Version 2.x uses a slightly different syntax, so the commands described here will not work with it.
:::

### Initialising the repository

Before running the first backup, choose where it will be stored and initialise the repository.

```bash :no-line-numbers
export BORG_REPO=/mnt/truenas/borgbackup
export BORG_PASSPHRASE='superSecret'
borg init --encryption=repokey
```

### Running a backup (CLI)

Before running a backup, it is worth settling a few things:

1. A naming convention for successive archives — an archive cannot be created with a name that has already been used.
2. (Optional) an archive name prefix, e.g. `backup-`.
3. A retention policy (daily / weekly / monthly).

```bash :no-line-numbers
export BORG_REPO=/mnt/truenas/borgbackup
export BORG_PASSPHRASE='superSecret'
borg create \
  --stats \
  --show-rc \
  --progress \
  ::20261105 /mnt/srv-storage/dir1 /mnt/srv-storage/dir2 /mnt/srv-storage/dir3

borg prune \
  --stats \
  --show-rc \
  --progress \
  --keep-daily=7 \
  --keep-weekly=4 \
  --keep-monthly=6

borg compact --cleanup-commits --show-rc --progress
```

The example above backs up three directories into an archive named `20261105`. The next day's backup will be named `20261106` — a convention based on the current date prevents archive name collisions.

`borg prune` applies the configured retention policy, and `borg compact` tidies up the repository, freeing the space left behind by deleted archives.

### Running a backup (Docker)

The same result can be achieved by running Borg in a Docker container:

```bash
docker run --rm \
  -e BORG_REPO=/mnt/truenas/borgbackup \
  -e BORG_PASSPHRASE='superSecret' \
  -e ARCHIVE="{now:%Y%m%d}" \
  -e SHOW_PROGRESS=1 \
  -e PRUNE=1 \
  -e BACKUP_DIRS="/mnt/srv-storage/dir1 /mnt/srv-storage/dir2 /mnt/srv-storage/dir3" \
  -e BORG_CACHE_DIR=/mnt/srv-storage/borg/cache \
  -v /mnt/srv-storage:/mnt/srv-storage \
  -v /mnt/truenas:/mnt/truenas \
  --name borg-backup \
  pschiffe/borg
```

::: tip ARCHIVE
The `{now:%Y%m%d}` expression used in the example tells Borg to take the current system date, format it and use it as the archive name.
:::

::: tip Cache
With Docker, it is worth setting the `BORG_CACHE_DIR` variable so that the cache is stored outside the container. This significantly shortens the duration of subsequent backups.
:::

### Useful commands

#### Listing backups

```bash :no-line-numbers title="borg list"
20261101                             Sun, 2026-11-01 08:09:03 [8ff280cad1cdd5c1ee212d1971b72b2179d2111a989c4d69c2a2d870ec4628bf]
20261102                             Mon, 2026-11-02 06:16:17 [79b25e0a919d45e9fb5ac177d180177f1699f0c1b282db426358335f56e50e4e]
20261103                             Tue, 2026-11-03 18:03:02 [988028c0b20db6ddda25a10cbac89e7dedb66a9ecabf3746a7555fb10a5417d8]
20261104                             Wed, 2026-11-04 07:00:04 [19522644f2dd78d0e071df9114662e36f0f653360cc47d5fa0ffcfac46d40a20]
20261105                             Thu, 2026-11-05 07:00:24 [f2a74a4b48a87e50f789e242fe9132ffe413269bfff3bc0c6a999eaeb40de912]
```

#### Repository summary

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

#### Details of a specific backup

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

#### Differences between two backups

```bash :no-line-numbers title="borg diff --content-only ::20261103 20261104"
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

