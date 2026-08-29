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
