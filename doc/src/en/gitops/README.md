---
title: Gitops
index: false
icon: infinity
category:
  - Guide
---

## Architecture

![Homelab repositories graph](/assets/image/homelab-ecosystem.svg)

The homelab consists of several more or less interdependent repositories. This approach lets me configure and monitor the whole environment as code. Apart from the Flux repository, everything lives on the local Gitlab instance.

## Repositories

### Provisioning & Maintenance
::: details proxmox-vm-templates

Used to build virtual machine templates for every Linux distribution that provides cloud-init images. Cloud-init makes it possible to upload SSH keys, install software, and pre-configure services.

[Documentation](/en/proxmox/vmtemplates.md)
:::

::: details homelab-tasks

The repository connects to Netbox to build a dynamic inventory.

- SSH key management on servers (pipeline)
- software updates (`apt dist-upgrade`) via a scheduled pipeline. Updates run once a week.

:::

::: details db-backups
Supported systems:

- postgresql
- mysql (mariadb)
- mongodb
- hashicorp vault

The mechanism is used in a Kubernetes cronjob definition.
:::

### Infrastructure as Code
::: details angrybits-homelab
Allows:

- creating VMs and docker containers
- configuring DNS, firewall, and other services that have a Terraform provider.

The IaC code in this repository relies on three technologies: Terragrunt, Terraform, and Ansible.
Deployments are run through a pipeline.

More details can be found in the [virtual machine creation documentation](/en/proxmox/vmmachines.md).
:::

### Monitoring

::: details proxmox-metrics
API code that collects statistics about completed backups from the Proxmox cluster and exposes them as metrics for Prometheus.
:::

::: details grafana-matrix-api
API that receives alerts from Grafana's alertmanager. It processes the information and sends it to a dedicated channel on the chat server (Matrix).
:::

### Documentation

::: details documentation
The repository containing the code that generates the documentation site.
:::
