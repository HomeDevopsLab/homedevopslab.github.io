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
