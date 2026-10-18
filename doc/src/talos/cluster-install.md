---
title: Instalacja clustra
order: 1
icon: download
category:
  - Guide
---

Wszystkie operacje związane z klastrem Talos wykonywane są na podstawie kodu repozytorium.

## Wymagania wstępne

Kod tworzący klaster jest zależny od istnienia template'u maszyny wirtualnej: `talos-nocloud-amd64`. Jest on tworzony z repozytorium: **proxmox-vm-templates**

![Mapa zależności providerów terraform](/assets/image/talos-code-deps.svg)

Dodatkowym narzędziem, które jest potrzebne to `talosctl` (https://docs.siderolabs.com/omni/getting-started/how-to-install-talosctl).

### Pula adresów IP

Potrzebne będą dwa zakresy adresów IP. Jeden dla maszyn wirtualnych talos. drugi dla loadbalancera Kubernetes.

Załóżmy, że chcemy uruchomić 6-cio węzłowy klaster talos.

* 6 adresów IP dla wszystkich węzłów + 1 dla VIP
* 10 adresów IP dla loadbalacera Kubernetes

Można uwzględnić dodatkowe adresy IP na potrzeby doskalowania klastra w przyszłości.

## Przygotowanie kodu

Sruktura repozytorium

![Struktura kodu klastra Talos](/assets/image/talos-cluster-repo-structure.svg)

Uruchomienie nowego klastra sprowadza się do utworzenia kopi katalogu `talos-dev` pod nową nazwą, np: `talos-prod` i dostosowania konfiguracji.

::: important Nazwa katalogu
Nazwa każdego katalogu z konfiguracją klastra powinna zaczynać się od prefixu `talos-`. Nazwa prefixu została użyta do lokalizacji modułu Terraform.
:::

### Konfiguracja VM

Parametry konfiguracyjne zostały podzielone na trzy pliki aby poprawić czytelność kodu.

#### Common
> Plik: common.hcl

Parametry wspólne dla maszyn wirtualnych w całym klastrze. Na ten moment Zakładam, że każda maszyna wirtualna będzie miała identyczne zasoby (CPU, RAM, Dysk).

* brama sieciowa i adres IP serwera dns
* template maszyny wirtualnej
* CPU / RAM / Dysk : parametry określają jak dużo zasobów mają mieć przydzielone maszyny wirtualne.
* nazwa przestrzeni dyskowej w klastrze proxmox, która będzie przechowywać obraz dysku.
* status maszyny wirtualnej po uruchomieniu sewera proxmox.

#### Controlplane i Workers
> Pliki: controlplane.hcl, workers.hcl

Oba pliki wyglądają podobnie. Zawierają listę węzłów, pełniących określoną rolę: worker i control-plane.


```hcl
nodes = {
  node-1 = {
    pve_node  = "proxmox"
    template  = local.common.template
    resources = local.common.resources,
    network = merge(local.common.network, {
      ip = "192.168.3.33/24"
    })
    onboot = local.common.onboot
  }
 ...
}
```

Na tym poziomie określamy nazwę węzła klastra proxmox, który będzie hostem dla tej maszyny wirtualnej oraz jej stały adres IP. Pozostałe parametry dziedziczone są z `common.hcl`.

#### Inputs
> Plik: inputs.hcl

Definicja parametrów wejściowych dla modułu terraform oraz konfiguracja najważniejszych parametrów klastra

```hcl
cluster_endpoint   = "192.168.3.100"
kubernetes_version = "v1.37.1"
talos_version      = "v1.14.3"
```

`cluster_endpoint` to VIP, który migruje pomiędzy węzłami control-plane. Zapewnia on komunikację z klastrem w przypadku awarii któregokolwiek węzła.

## Stworzenie klastra

Po przygotowaniu kodu klastra uruchamiamy wdrożenie:

```bash :no-line-numbers
cd talos-prod
terragrunt apply
```

Podczas wdrożenia w pierwszej kolejności tworzone są maszyny wirtualne na klastrze proxmox. Po ich utworzeniu provider Talosa generuje konfiguację klastra i wgrywa ją dna stworzone maszyny wirtualne. Po kilku minutach klaster jest już gotowy.

::: tip Kubernetes
Po zakończeniu apply należy poczekać jeszcze ok 1-2 min. W tym czasie Talos konfiguruje klaster kubernetes. Nie jest on dostępy od razu.
:::

## Przygotowanie środowiska

Aby być w stanie wykonywać operacje na klastrze oraz obserwować jego działanie, trzeba skonfigurować swoją stację developerską.

Pobranie konfiguracji Talosa dla `talosctl`
```bash :no-line-numbers
terragrunt output -raw talosonfig >~/.talos/config
```

Konfiguracja kubernetes
```bash :no-line-numbers
talosctl -n 192.168.3.33 kubeconfig
```

Operacja **kubeconfig** nie nadpisuje konfiguracji kubneretes dla innego klastra. Tworzony jest nowy kontekst konfiguracji. Dzięki temu możemy się przełączać pomiędzy klastrami kubernetes. Nadpisanie konfiguracji występuje wyłącznie w przypadku stworzenia klastra o nazwie takiej jaka już wcześniej była. W tym przypadku pojawia się pytaine o zatwierdzenie operacji.
