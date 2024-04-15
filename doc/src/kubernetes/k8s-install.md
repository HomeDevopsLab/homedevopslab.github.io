---
title: K3S Install
icon: fa-brands fa-raspberry-pi
order: 3
category:
  - Guide
tag:
  - kubernetes
---

Głównym komponentem klastra są cztery mikrokomputery: [Raspberry Pi4](https://www.raspberrypi.com/products/raspberry-pi-4-model-b/), Każdy z nich wykosażony jest w 8GB pamięci RAM, gigabitowy interfejs sieciowy oraz CPU: Broadcom BCM2711, Quad core Cortex-A72 (ARM v8) 64-bit. Dodatkowo każdy z nich wyposażony jest w kartę micro-sd o pojemności 64GB. Miejsce jest przeznaczone na system operacyjny oraz do bieżącej pracy klastra kubernetes.

Pełną specyfikację można znaleźć pod adresem: [https://www.raspberrypi.com/products/raspberry-pi-4-model-b/specifications/](https://www.raspberrypi.com/products/raspberry-pi-4-model-b/specifications/)

## Instalacja systemu

Instalację systemu można przeprowadzić w trybie "headless" przy użyciu narzędzia: [Raspberry Pi Imager](https://www.raspberrypi.com/software/). W pierwszym kroku (model) wybieramy Raspberry Pi4. W opcji "System Operacyjny" wybieramy "Raspberry Pi (other)" a następnie Raspberry Pi OS Lite (32-bit). Wybieramy urządzeie flash do którego mamy włożoną kartę microSD i możemy rozpocząć procedurę instalacji

::: important Pre-install
Zanim rozpoczniemy proces instalacji warto zmienić ustawienia systemu operacyjnego. Minimum, które trzeba wykonać to ustawić login i hasło, inaczej nie będzie można się zalogować po instalacji.
:::

![Konfiguracja instalatora Raspberry Pi](/assets/image/rpi-install-config.png)

Proces ten należy przeprowadzić na wszystkich czterech kartach microSD.

## Pierwsze uruchomienie.

Po instalacji OS na wszystkich czterech kartach, wkładamy je do Raspberry i startujemy na czas ok. 2 min. W ten sposób utworzą się potrzebne do dalszej konfiguracji pliki:

* cmdline.txt
* config.txt

Znajdują się one na dysku oznaczonym: **boot**

## Konfiguracja systemu

Po podłączeniu kart sd do komputera edytujemy pliki **cmdline.txt** oraz **config.txt**.

### Plik cmdline.txt
```
cgroup_memory=1 cgroup_enable=memory ip=10.1.1.10::10.1.1.1:255.255.255.0:k3s-master:eth0:off
```

konfiguracja IP składa się z następujacych pól:
* **10.1.1.10:** adres IP urządzenia
* **10.1.1.1:** brama domyślna
* **255.255.255.0:** maska
* **k3s-master:** hostname
* **eth0:** interfejs sieciowy
* **off:** dhcp client

### Plik config.txt
```
arm_64bit=1
```

Odkomentowujemy, lub dodajemy tą opcję. Włącza ona 64-bitowy kernel systemu.

### SSH
Na dysku **boot** tworzymy pusty plik o nazwie ssh. Spowoduje to uruchomienie sshd wraz ze startem systemu.

::: tabs

@tab MacOS/Linux
```bash
touch ssh
```

@tab Windows
```powershell
New-Item ssh
```

:::

## Konfiguracja sieci

Po zalogowaniu się na raspberry dodajemy trasę domyślną poleceniem:

```bash
route add default gw 10.1.1.1
```

::: tip Sieć
Jeśli raspberry ma działać w innym vlanie niż normalnie pracujemy i nie mamy w nim hosta przesiadkowego, możemy skonfigurować sieć na laptopie aby dopasować się do sieci raspberry i wykonać na nim ustawienie gatewaya.
:::

Ustawienie gatewaya umożliwi instalację potrzebnych pakietów (np. vim).

### dhcpcd.conf
Plik: **/etc/dhcpcd.conf**
```
interface eth0
static ip_address=10.1.1.10/24
static routers=10.1.1.1
static domain_name_servers=10.1.1.1 8.8.8.8
```
### Hostname
Hostname ustawiamy w plikach:

* /etc/hostname
* /etc/hosts

/etc/hosts:
```
127.0.1.1               k3s-master
```
## Klaster K3S
Klaster skonfigurowany jest w uproszczonym modelu z pojedynczym master-nodem. Konfiguracja klastra składa się z dwóch etapów:
* instalacja master-node'a
* instalacja worker-nodów.

### Instalacja master-node