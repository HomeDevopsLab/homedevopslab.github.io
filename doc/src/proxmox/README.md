---
title: Proxmox Cluster
index: false
icon: server
category:
  - Guide
---

## Architektura

Cluster składa się z trzech fizycznych urządzeń. Dzięki zastosowaniu ceph, uruchomione maszyny wirtualne pracują w trybie HA. Oznacza to, że w przypadku awarii jednego z serwerów, zostaną przemigrowane na dwa pozostałe - działające węzły clustra. Cluster posiada dodatkowe dedykowane interfejsy sieciowe 2.5Gbit, które służą do sychronizacji danych w ramach clustra ceph.

![Architektura clustra proxmox](/assets/image/proxmox-cluster.png)

## Sprzęt

| Host    | CPU                    | Wątki | RAM  | Storage                                                      |
| ------- | ---------------------- | ----- | ---- | ------------------------------------------------------------ |
| proxmox | AMD Ryzen7 5800X       | 16    | 64GB | 1TB NVME Samsung SSD 990 PRO<br>4TB NVME Samsung SSD 990 PRO |
| hp1     | AMD Ryzen 3 PRO 3200GE | 4     | 64GB | 2TB NVME Samsung SSD 990 PRO<br>4TB NVME Samsung SSD 990 PRO |
| hp2     | AMD Ryzen 3 PRO 3200GE | 4     | 64GB | 2TB NVME Samsung SSD 990 PRO<br>4TB NVME Samsung SSD 990 PRO |

### Whitebox Server

Serwer został zbudowany w oparciu o płytę ASUS PRIME X370-PRO i procesor AMD Ryzen7 5800X. Płyta główna posiada jedno złącze na dyski M2 oraz kilka złącz PCIe. Płyta główna pozwala na zainstalowanie 64GB pamięci RAM i tyle też obecnie się na niej znajduje. Płyta główna posiada interfejs sieciowy 1Gbit. Jest to obecnie najmocniejszy serwer w zestawie.

### HP EliteDesk 705 G5 Desktop Mini

Na tej platformie uruchomione są dwa pozostałe węzły clustra proxomox. Pomimo niewielkich rozmiarów platforma oferuje bardzo dobre możliwości w zakresie rozbudowy. Płyta główna obsługuje do 64GB RAM i posiada aż trzy złącza M2. W dwóch z nich zainstalowałem dyski NVME (2TB i 4TB). Trzecie - krótkie złącze wykorzystałem do podłączenia specjalnego adaptera do karty sieciowej 2.5Gbit.

### Storage

#### ceph-storage

Każdy z nodów clustra ma zainstalowany dodakowy dysk NVME o pojemności 4TB. Dyski te tworzą wspólny storage dla wszystkich maszyn wirtualnych w ramach clustra ceph.

#### local-lvm

Jest to standardowa przestrzeń dyskowa, którą tworzy instalator proxmoxa. Obecnie przechowuje wyłącznie template'y maszyn wirtualnych. Dyski działających vm są zlokalizowane na przestrzeni ceph-storage
<Catalog />
