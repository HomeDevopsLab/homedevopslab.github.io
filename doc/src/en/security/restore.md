---
title: Restore
icon: rotate-left
order: 2
category:
  - Guide
tag:
  - backup
---

## Restoring a virtual machine

To restore a virtual machine, log in to one of the Proxmox servers, select the **vm-backups** datastore (`1`), and then the backup file you want to restore (`2`). Confirm by clicking **Restore** (`3`).

![Backup list](/assets/image/backup-restore-1.png)

After you click **Restore**, a dialog opens where you can configure the virtual machine before it is restored. This lets you restore a machine from backup alongside the running production instance.

### Restore parameters

::: important
The `Start after restore` option must remain unchecked.
:::

![Restore options](/assets/image/backup-restore-2.png)

::: tip Backup restore test
| Parameter | Requirement | Recommendations |
| --------- | ----------- | --------------- |
| Storage   | <Badge text="Optional" type="tip" /> | Defaults to the storage assigned to the source virtual machine. |
| VM        | <Badge text="Required" type="danger" /> | To restore the machine alongside the running one (e.g. when testing a backup), choose an unused VMID. |
| Unique    | <Badge text="Required" type="danger" /> | Check it to generate a unique MAC address. |
| Name      | <Badge text="Recommended" type="warning" /> | Give the machine a new name to avoid mixing it up with the original. |
:::

### Backup verification

Before starting the restored virtual machine, change its IP address in the **Cloud-Init** settings. This step is required to avoid an IP address conflict with the running instance while testing the backup. Alternatively, select DHCP so the new machine obtains an IP address automatically.

![Cloud-Init change IP Address](/assets/image/backup-restore-3.png)

Once started, the restored virtual machine is ready for further work.
