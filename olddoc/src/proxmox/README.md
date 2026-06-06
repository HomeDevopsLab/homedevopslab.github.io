---
title: Proxmox
index: false
icon: server
category:
  - Guide
---
Serwer proxmox w moim środowisku HomeLab zapewnia moc obliczeniową oraz storage do uruchamianie różnych projektów i narzędzi.
## Konfiguracja serwera
| CPU | RAM | Storage |
| ----| ----| --------|
| AMD Ryzen7 5800X | 64GB | 1x 1TB NVME Samsung SSD 990 PRO<br>2x 4TB WD Red Plus WD40EFPX |
### Dyski
#### big-storage
Serwer posiada dwa dyski WD Red Plus WD40EFPX 4TB SATA III 256MB 5400rpm, które tworzą wspólną przestrzeń RAID o nazwie big-storage. Jest ona przeznaczona do maszyn VM nie wymagających szybkich dysków, ale za to wymagają większej pojemności.

#### local-lvm
Przestrzeń dyskowa local-lvm zlokalizowana jest na dysku NVME Samsung SSD 990 PRO 1TB. Jest to dysk na którym zainstalowany jest też sam proxmox. Local-lvm przeznaczony jest jako storage dla VM wymagających szybkich dysków, takie jak np. bazy danych.
<Catalog />