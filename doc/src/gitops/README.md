---
title: Gitops
index: false
icon: infinity
category:
  - Guide
---

## Architektura

![Homelab repositories graph](/assets/image/homelab-ecosystem.svg)

Homelab składa się z kilku mniej lub bardziej zależnych od siebie repozytoriów. Dzięki temu podejściu jestem w stanie z użyciem kodu konfigurować i monitorować całe środowisko. Poza repozytorium dla Fluxa wszystko znajduje się na lokalnym gitlabie.

## Repozytoria

### Provisioning & Utrzymanie
::: details proxmox-vm-templates

Służy do tworzenia template'ów maszyn wirtualnych dla każdej dystrybucji linuksa, która udostępnia obrazy cloud-init. Cloud-init oferuje możliwość wgrania kluczy ssh, instalację oprogramowania oraz wstępną konfigurację usług.

[Dokumentacja](/proxmox/vmtemplates)
:::

::: details homelab-tasks

Repozytorium łączy się z netboxem aby zbudować dynamic inventory.

- zarządzanie kluczami ssh na serwerach (pipeline)
- aktualizacja oprogramowania `apt dist-upgrade` z użyciem scheduled pipeline. Aktualizacje wykonywane są raz w tygodniu.

:::

::: details db-backups
Obsługiwane systemy:

- postgresql
- mysql (mariadb)
- mongodb
- hashicorp vault

Mechanizm jest używany w definicji cronjoba w Kubernetes
:::

### Infrastructure as Code
::: details angrybits-homelab
Umożliwia:

- Tworzenie maszyn vm i kontenerów dockera 
- konfigurację DNS, firewalla i pozostałych usług, które posiadają provider do terraforma.

Kod IaC w tym repozytorium wykorzystuje trzy technologie: Terragrunt, Terraform i Ansible.
Wdrożenia wykonywane są z użyciem pipeline.

Więcej szczegółów można znaleźć w [dokumentacji tworzenia maszyn wirtualnych](/proxmox/vmmachines)
:::

### Monitoring

::: details proxmox-metrics
Kod API, które odbiera statystyki na temat wykonanych backupów z klastra Proxmox i wystawia je w formie metryk dla Prometheusa.
:::

::: details grafana-matrix-api
API, które odbiera alerty z alertmanagera w grafanie. Przetwarza informacje i wysyła na dedykowany kanał na serwerze chatu (Matrix)
:::

### Dokumentacja

::: details documentation
Repozytorium z kodem, który generuje stronę z dokumentacją.
:::
