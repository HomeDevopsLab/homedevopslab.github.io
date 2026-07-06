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

## Scenariusze
::: details Nowa maszyna wirtualna

#### Template'y cloud-init

Do twoerzenia template'ów służy repozytorium `proxmox-vm-templates`. Dzięki niemu można tworzyć template'y dla każdej dystrybucji linuksa, która udostępnia obrazy cloud-init. Cloud-init oferuje możliwość wgrania kluczy ssh, instalację oprogramowania oraz wstępna konfigurację usług.

[Dokumentacja](/proxmox/vmtemplates)

#### Tworzenie VM

Maszyny wirtualne tworzone są z kodu w repozytorium `angrybit-homelab`. Funchonalność umożliwia stworzenie maszyny wirtualnej o dowolych parametrach (CPU/RAM/Dysk) na jednym z trzech węzłów klastra proxmox.

[Dokumentacja](/proxmox/vmmachines)
:::

::: details Uruchomienie kontenera z postgres
aaaaa
:::

## Kontenery dockera

::: info Repozytoria
- angrybit-homelab
:::

Kontenery dockera uruchomione są na warstwie wirtualizacji. Pełnią one takie role jak

- bazy danych dla aplikacji
- dns
- monitoring
- obsługa pipeline

Zarządzanie kontenerami odbywa się z poziomu repozytorium `angrybit-homelab`.

::: important DNS
Mechanizm uruchamiania kontenerów dockera na wybranej maszynie wirtualnej oczekuje istniejącego wpisu w DNS. Przykładowo: uruchomienie bazy postgres wymaga stworzenia wpisu w DNS dla srv-db.
:::

## Aplikacje

::: info Repozytoria
- angrybit-homelab
:::


