---
title: Kubernetes
index: false
icon: dharmachakra
category:
  - Guide
---

Kubernetes stanowi centralny punt w moim homelabie. Jest to miejsce w którym hostuję wszystkie aplikacje. Ruch internetowy skierowany na porty 80 i 443 na adres IP load balancera. Nody clustra rozmieszczone są na różnych fizycznych urządzeniach. Dzięki zastosowaniu maszyn VM uruchomionych w trybie HA, awaria jednego z fizycznych urządzeń spowoduje jedynie chwilową niedostępność działających aplikacji.

::: info Raspberry Pi
Ze względu na niską wydajność sprzętową nie planuję w przyszłości dołączania do clustra tych urządzeń. Obecnie działające nody w przypadku awarii bedą wymieniane na maszyny VM. Docelowo wszystkie Raspberry pi zostaną wymienione na kolejne sewery proxmox, które zwiększą w większym stopniu pojemność klastra.
:::

## Architektura

![Architektura Kubernetes w HomeLAB](/assets/image/kubernetes-arch.png)

### Rozmieszczenie nodów

| Node | Rola | Host |
| -----| -----| -----|
| k3s-master1 | control-plane | hp1 |
| k3s-master2 | control-plane | hp2 |
| k3s-master3 | control-plane | proxmox |
| k3s-aarch64-worker1 | worker | raspberry pi |
| k3s-aarch64-worker2 | worker | raspberry pi |
| k3s-amd64-worker3 | worker | proxmox |
| k3s-amd64-worker4 | worker | proxmox |


<Catalog />
