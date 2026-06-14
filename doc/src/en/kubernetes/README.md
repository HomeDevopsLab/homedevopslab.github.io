---
title: Kubernetes
index: false
icon: dharmachakra
category:
  - Guide
---

Kubernetes is at the heart of my homelab, serving as the primary hosting environment for all my applications. Internet traffic on ports 80 and 443 is routed to the load balancer's IP address. The cluster nodes are distributed across various physical devices. Thanks to the use of virtual machines (VMs) running in High Availability (HA) mode, a failure of any single physical device results only in momentary downtime for active services.

::: info Raspberry Pi
Due to limited hardware performance, I do not plan to add any more of these devices to the cluster in the future. In the event of a failure, the currently active nodes will be replaced by virtual machines (VMs). Ultimately, all Raspberry Pi units will be replaced by additional Proxmox servers to significantly increase the cluster's overall capacity.
:::

## Architecture

![Kubernetes Architecture in HomeLAB](/assets/image/kubernetes-arch.png)

### Node Distribution

| Node | Role | Host |
| -----| -----| -----|
| k3s-master1 | control-plane | hp1 |
| k3s-master2 | control-plane | hp2 |
| k3s-master3 | control-plane | proxmox |
| k3s-aarch64-worker1 | worker | raspberry pi |
| k3s-aarch64-worker2 | worker | raspberry pi |
| k3s-amd64-worker3 | worker | proxmox |
| k3s-amd64-worker4 | worker | proxmox |


<Catalog />