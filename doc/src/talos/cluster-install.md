---
title: Instalacja
order: 1
icon: download
category:
  - Guide
---

Wszystkie operacje związane z klastrem Talos wykonywane są na podstawie kodu w repozytorium.

## Wymagania wstępne

Kod tworzący klaster jest zależny od istnienia template'u maszyny wirtualnej: `talos-nocloud-amd64`. Jest on tworzony w repozytorium **proxmox-vm-templates**.

![Mapa zależności providerów Terraform](/assets/image/talos-code-deps.svg)

Potrzebne jest również narzędzie `talosctl` ([instrukcja instalacji](https://docs.siderolabs.com/omni/getting-started/how-to-install-talosctl)).

### Pula adresów IP

Potrzebne będą dwa zakresy adresów IP: jeden dla maszyn wirtualnych Talos, drugi dla load balancera Kubernetes.

Załóżmy, że chcemy uruchomić sześciowęzłowy klaster Talos:

* 6 adresów IP dla wszystkich węzłów + 1 dla VIP
* 10 adresów IP dla load balancera Kubernetes

Warto zarezerwować dodatkowe adresy IP na potrzeby przyszłej rozbudowy klastra.

## Przygotowanie kodu

Struktura repozytorium:

![Struktura kodu klastra Talos](/assets/image/talos-cluster-repo-structure.svg)

Uruchomienie nowego klastra sprowadza się do utworzenia kopii katalogu `talos-dev` pod nową nazwą, np. `talos-prod`, i dostosowania konfiguracji.

::: important Nazwa katalogu
Nazwa każdego katalogu z konfiguracją klastra powinna zaczynać się od prefiksu `talos-`. Prefiks ten jest wykorzystywany do lokalizowania modułu Terraform.
:::

### Konfiguracja VM

Parametry konfiguracyjne maszyn wirtualnych zostały podzielone na trzy pliki, aby poprawić czytelność kodu.

#### Common
> Plik: common.hcl

Parametry wspólne dla maszyn wirtualnych w całym klastrze. Obecnie zakładam, że każda maszyna wirtualna ma identyczne zasoby (CPU, RAM, dysk).

* brama sieciowa i adres IP serwera DNS,
* template maszyny wirtualnej,
* CPU / RAM / dysk — ilość zasobów przydzielonych maszynom wirtualnym,
* nazwa magazynu danych (storage) w klastrze Proxmox, który będzie przechowywać obraz dysku,
* zachowanie maszyny wirtualnej po uruchomieniu serwera Proxmox (automatyczny start).

#### Controlplane i Workers
> Pliki: controlplane.hcl, workers.hcl

Oba pliki mają podobną strukturę. Zawierają listę węzłów pełniących określoną rolę: control-plane lub worker.

```hcl
nodes = {
  node-1 = {
    pve_node  = "proxmox"
    template  = local.common.template
    resources = local.common.resources,
    network = merge(local.common.network, {
      ip = "192.0.2.33/24"
    })
    onboot = local.common.onboot
  }
 ...
}
```

Na tym poziomie określamy nazwę węzła klastra Proxmox, który będzie hostem dla danej maszyny wirtualnej, oraz jej stały adres IP. Pozostałe parametry dziedziczone są z `common.hcl`.

#### Inputs
> Plik: inputs.hcl

Definicja parametrów wejściowych modułu Terraform oraz konfiguracja najważniejszych parametrów klastra:

```hcl
cluster_endpoint   = "192.0.2.100"
kubernetes_version = "v1.37.1"
talos_version      = "v1.14.3"
```

`cluster_endpoint` to VIP, który migruje pomiędzy węzłami control-plane. Zapewnia on komunikację z klastrem w przypadku awarii któregokolwiek węzła.

## Stworzenie klastra

Po przygotowaniu kodu klastra uruchamiamy wdrożenie:

```bash :no-line-numbers
cd talos-prod
terragrunt apply
```

Podczas wdrożenia w pierwszej kolejności tworzone są maszyny wirtualne na klastrze Proxmox. Następnie provider Talosa generuje konfigurację klastra i wgrywa ją na utworzone maszyny wirtualne. Po kilku minutach klaster jest już gotowy.

::: tip Kubernetes
Po zakończeniu `apply` należy poczekać jeszcze ok. 1–2 minuty. W tym czasie Talos konfiguruje klaster Kubernetes, który nie jest dostępny od razu.
:::

## Przygotowanie środowiska

Aby wykonywać operacje na klastrze oraz obserwować jego działanie, trzeba skonfigurować swoją stację roboczą.

Pobranie konfiguracji Talosa dla `talosctl`:
```bash :no-line-numbers
terragrunt output -raw talosconfig > ~/.talos/config
```

Konfiguracja Kubernetes:
```bash :no-line-numbers
talosctl -n 192.0.2.33 kubeconfig
```

Operacja **kubeconfig** nie nadpisuje konfiguracji Kubernetes innych klastrów — tworzony jest nowy kontekst. Dzięki temu można przełączać się pomiędzy klastrami Kubernetes. Konfiguracja zostaje nadpisana wyłącznie wtedy, gdy wcześniej istniał już klaster o tej samej nazwie. W takim przypadku pojawia się prośba o zatwierdzenie operacji.
