---
title: Proxmox Cluster
index: false
icon: server
category:
  - Guide
---

## Architecture

The cluster consists of three physical servers. Thanks to Ceph, the running virtual machines operate in High Availability (HA) mode. This means that in the event of a node failure, VMs will be automatically migrated to the two remaining active cluster nodes. The cluster also features dedicated 2.5Gbit network interfaces used for data synchronization within the Ceph storage cluster.

![Proxmox Cluster Architecture](/assets/image/proxmox-cluster.png)

## Hardware

| Host    | CPU                    | Threads | RAM  | Storage                                                      |
| ------- | ---------------------- | ------- | ---- | ------------------------------------------------------------ |
| proxmox | AMD Ryzen 7 5800X      | 16      | 64GB | 1TB NVMe Samsung SSD 990 PRO<br>4TB NVMe Samsung SSD 990 PRO |
| hp1     | AMD Ryzen 3 PRO 3200GE | 4       | 64GB | 2TB NVMe Samsung SSD 990 PRO<br>4TB NVMe Samsung SSD 990 PRO |
| hp2     | AMD Ryzen 3 PRO 3200GE | 4       | 64GB | 2TB NVMe Samsung SSD 990 PRO<br>4TB NVMe Samsung SSD 990 PRO |

### Whitebox Server

This server was built around the ASUS PRIME X370-PRO motherboard and an AMD Ryzen 7 5800X processor. The motherboard features a single M.2 slot for NVMe drives and multiple PCIe slots. It supports up to 64GB of RAM, which is currently installed. It also includes a built-in 1Gbit Ethernet port. This is currently the most powerful server in the setup.

### HP EliteDesk 705 G5 Desktop Mini

The two remaining Proxmox cluster nodes run on this platform. Despite its compact form factor, it offers excellent expandability. The motherboard supports up to 64GB of RAM and features three M.2 slots. I installed NVMe drives in two of them (2TB and 4TB). The third, shorter slot is used for a dedicated PCIe adapter for a 2.5Gbit network card.

### Storage

#### ceph-storage

Each cluster node is equipped with an additional 4TB NVMe drive. Together, these drives form the shared storage pool for all virtual machines across the Ceph cluster.

#### local-lvm

This is the default disk space provisioned by the Proxmox installer. It currently stores only VM templates. The disks for running VMs are located on the `ceph-storage` pool.

<Catalog />
