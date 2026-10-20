---
title: Talos Cluster
index: false
icon: https://cdn.simpleicons.org/talos/326CE5
category:
  - Guide
---

## Architektura

Talos Linux stosuje zupełnie inną filozofię obsługi systemu niż tradycyjne dystrybucje Linuksa. Jednym z założeń dystrybucji jest jej niezmienność (immutable). Nie ma możliwości zalogowania się do systemu przez SSH. Jedynym sposobem interakcji z systemem jest API, z którego korzystają dedykowane narzędzia lub IaC. Ta jedna różnica ma ogromny wpływ na utrzymanie systemu: nie da się zainstalować ani zaktualizować pojedynczych pakietów, ponieważ system dostarczany jest jako obraz.

![Architektura systemu Talos Linux](/assets/image/talos-diagram.svg)

## Diagnostyka systemu

Podstawowym narzędziem do interakcji z klastrem Talos jest `talosctl`. Umożliwia ono dostęp na żywo do logów oraz informacji o bieżącym wykorzystaniu zasobów, takich jak procesor, pamięć, dyski i sieć. Ten artykuł przedstawia kilka przykładów użycia tego narzędzia. Bardziej szczegółowe informacje można znaleźć w dokumentacji oraz eksperymentując z `talosctl -h`.

- [Reference manual](https://docs.siderolabs.com/talos/v1.14/reference/cli)
- [Dokumentacja Talos](https://docs.siderolabs.com/talos/v1.14/overview/what-is-talos)

Aby przejrzeć listę obiektów systemu, które można odpytać poleceniem `talosctl get`, warto użyć polecenia:

```bash :no-line-numbers
talosctl get rd
```

### Dashboard

`talosctl` udostępnia interaktywną aplikację terminalową (TUI) — dashboard:

```bash :no-line-numbers
talosctl dashboard
```

![Talos Dashboard](/assets/image/talos-dashboard.png)

### Węzły klastra

Za pomocą opcji `-n` można wskazać węzeł klastra, na którym ma zostać wykonane polecenie `talosctl`. Aby wyświetlić węzły klastra, wykonujemy polecenie:

```bash :no-line-numbers
talosctl -n 192.0.2.100 get members

NODE            NAMESPACE   TYPE     ID                        VERSION   HOSTNAME                  MACHINE TYPE   OS                ADDRESSES
192.0.2.100     cluster     Member   talos-dev-cp-node-1       2         talos-dev-cp-node-1       controlplane   Talos (v1.14.3)   ["192.0.2.33","192.0.2.100"]
192.0.2.100     cluster     Member   talos-dev-cp-node-2       3         talos-dev-cp-node-2       controlplane   Talos (v1.14.3)   ["192.0.2.34"]
192.0.2.100     cluster     Member   talos-dev-cp-node-3       4         talos-dev-cp-node-3       controlplane   Talos (v1.14.3)   ["192.0.2.35"]
192.0.2.100     cluster     Member   talos-dev-worker-node-1   2         talos-dev-worker-node-1   worker         Talos (v1.14.3)   ["192.0.2.36"]
192.0.2.100     cluster     Member   talos-dev-worker-node-2   2         talos-dev-worker-node-2   worker         Talos (v1.14.3)   ["192.0.2.37"]
192.0.2.100     cluster     Member   talos-dev-worker-node-3   2         talos-dev-worker-node-3   worker         Talos (v1.14.3)   ["192.0.2.38"]
```

::: tip VIP
W przykładzie podano adres Virtual IP (VIP) skonfigurowany w klastrze. Zamiast niego można podać adres dowolnego węzła klastra.
:::

### Logi

Polecenia, za pomocą których można przeprowadzić podstawową diagnostykę systemu:

| Polecenie | Opis polecenia |
| ----------| ---------------|
| talosctl -n 192.0.2.33 dmesg | Komunikaty kernela |
| talosctl -n 192.0.2.33 logs machined | Komunikaty usługi `machined`. W ten sposób można odczytać logi każdej z uruchomionych usług (sposób wyświetlenia ich listy opisano poniżej). |

::: tip services
Aby dowiedzieć się, jakie usługi są uruchomione na wybranym węźle klastra, należy wykonać polecenie:

```bash :no-line-numbers
talosctl -n 192.0.2.33 services

NODE           SERVICE                STATE     HEALTH   LAST CHANGE    LAST EVENT
192.0.2.33     apid                   Running   OK       6h29m36s ago   Health check successful
192.0.2.33     auditd                 Running   OK       6h29m46s ago   Health check successful
192.0.2.33     containerd             Running   OK       6h29m46s ago   Health check successful
192.0.2.33     cri                    Running   OK       6h29m35s ago   Health check successful
192.0.2.33     dashboard              Running   ?        6h29m37s ago   Process Process(["/sbin/dashboard"]) started with PID 267
192.0.2.33     etcd                   Running   OK       6h29m11s ago   Health check successful
192.0.2.33     ext-qemu-guest-agent   Running   ?        6h29m46s ago   Started task ext-qemu-guest-agent (PID 232) for container ext-qemu-guest-agent
192.0.2.33     kubelet                Running   OK       6h29m33s ago   Health check successful
192.0.2.33     machined               Running   OK       6h29m46s ago   Health check successful
192.0.2.33     sandboxd               Running   OK       6h29m46s ago   Health check successful
192.0.2.33     syslogd                Running   OK       6h29m45s ago   Health check successful
192.0.2.33     trustd                 Running   OK       6h29m35s ago   Health check successful
192.0.2.33     udevd                  Running   OK       6h29m37s ago   Health check successful
```
:::

### Pody Kubernetes

Ponieważ Talos jest ściśle zintegrowany z Kubernetes, za pomocą `talosctl` można wyświetlić pody uruchomione na wybranym węźle:

```bash :no-line-numbers
talosctl -n 192.0.2.36 containers --namespace=cri

NODE           NAMESPACE   ID                                                                                IMAGE                                               PID    STATUS
192.0.2.36     k8s.io      default/shy-garlic-5586cc58c7-skv5l                                               registry.k8s.io/pause:3.10.2                        1039   SANDBOX_READY
192.0.2.36     k8s.io      └─ default/shy-garlic-5586cc58c7-skv5l:shy-garlic:9bf7e054571b                    ghcr.io/zatto-dev/shy-garlic:0.13.1                 1520   CONTAINER_RUNNING
192.0.2.36     k8s.io      flux-system/helm-controller-57f4ccf566-w2428                                      registry.k8s.io/pause:3.10.2                        1129   SANDBOX_READY
192.0.2.36     k8s.io      └─ flux-system/helm-controller-57f4ccf566-w2428:manager:b9def4e84060              ghcr.io/fluxcd/helm-controller:v1.5.4               1341   CONTAINER_RUNNING
...
```

Można też odczytać logi konkretnej aplikacji uruchomionej w Kubernetes:

```bash :no-line-numbers
talosctl -n 192.0.2.36 logs --namespace=cri default/shy-garlic-5586cc58c7-skv5l:shy-garlic:9bf7e054571b

192.0.2.36: 2026-10-17T14:24:22.019684154Z stderr F time=2026-10-17T16:24:22.019+02:00 level=INFO msg="backgrounds directory ready" dir=/data/bg
192.0.2.36: 2026-10-17T14:24:22.132334642Z stderr F time=2026-10-17T16:24:22.131+02:00 level=INFO msg="config loaded" services=16 groups=4
192.0.2.36: 2026-10-17T14:24:22.132365393Z stderr F time=2026-10-17T16:24:22.131+02:00 level=INFO msg="shyg starting" addr=:8080 config=/etc/shygarlic/shygarlic.yaml db=/data/shygarlic.db backgrounds=/data/bg version=0.14.0
...
```

## Dyski

Dostęp do informacji o dyskach w systemie:

```bash :no-line-numbers
talosctl -n 192.0.2.38 get disk

NODE           NAMESPACE   TYPE   ID      VERSION   SIZE     READ ONLY   TRANSPORT   ROTATIONAL   WWID   MODEL           SERIAL
192.0.2.38     runtime     Disk   loop0   2         4.1 kB   true
192.0.2.38     runtime     Disk   loop1   2         819 kB   true
192.0.2.38     runtime     Disk   loop2   2         94 MB    true
192.0.2.38     runtime     Disk   sda     2         22 GB    false       virtio      true                QEMU HARDDISK
192.0.2.38     runtime     Disk   sr0     2         4.2 MB   true        ata         true                QEMU DVD-ROM    QEMU_DVD-ROM_QM00002
```

Informacje o wybranym dysku:

```bash :no-line-numbers
talosctl -n 192.0.2.38 get disk sda

NODE           NAMESPACE   TYPE   ID    VERSION   SIZE    READ ONLY   TRANSPORT   ROTATIONAL   WWID   MODEL           SERIAL
192.0.2.38     runtime     Disk   sda   2         22 GB   false       virtio      true                QEMU HARDDISK
```

::: tip Szczegóły
Aby wyświetlić więcej informacji o wskazanym dysku, należy użyć opcji `-o yaml`.
:::

### Layout dysku

Można też pobrać listę wolumenów i punktów montowania w systemie:

```bash :no-line-numbers
talosctl -n 192.0.2.38 get volumeconfigs

NODE           NAMESPACE   TYPE           ID                                  VERSION
192.0.2.38     runtime     VolumeConfig   /opt                                2
192.0.2.38     runtime     VolumeConfig   /var/lib                            2
192.0.2.38     runtime     VolumeConfig   /var/lib/cni                        2
192.0.2.38     runtime     VolumeConfig   /var/lib/kubelet/seccomp            2
192.0.2.38     runtime     VolumeConfig   /var/lib/kubelet/seccomp/profiles   2
192.0.2.38     runtime     VolumeConfig   /var/log/audit                      2
192.0.2.38     runtime     VolumeConfig   /var/log/audit/kube                 2
192.0.2.38     runtime     VolumeConfig   /var/log/containers                 2
192.0.2.38     runtime     VolumeConfig   /var/log/pods                       2
192.0.2.38     runtime     VolumeConfig   /var/mnt                            2
192.0.2.38     runtime     VolumeConfig   /var/run                            2
192.0.2.38     runtime     VolumeConfig   /var/run/lock                       2
192.0.2.38     runtime     VolumeConfig   CRI                                 2
192.0.2.38     runtime     VolumeConfig   EPHEMERAL                           2
192.0.2.38     runtime     VolumeConfig   ETCD                                2
192.0.2.38     runtime     VolumeConfig   KUBELET                             2
192.0.2.38     runtime     VolumeConfig   LOG                                 2
192.0.2.38     runtime     VolumeConfig   META                                2
192.0.2.38     runtime     VolumeConfig   STATE                               4
```

## Pamięć

Aby sprawdzić statystyki pamięci na wybranym węźle, należy wykonać polecenie:

```bash :no-line-numbers
talosctl -n 192.0.2.38 memory

NODE           TOTAL   USED   FREE   SHARED   BUFFERS   CACHE   AVAILABLE
192.0.2.38     3897    605    2688   104      3         599     3052
```

## Pozostałe operacje

### Netstat

Wyświetla wszystkie połączenia sieciowe wraz z ich stanem na wybranym węźle:

```bash :no-line-numbers
talosctl -n 192.0.2.38 netstat

NODE           Proto   Recv-Q   Send-Q   Local Address        Foreign Address      State
192.0.2.38     tcp     0        0        127.0.0.1:35238      127.0.0.1:10248      TIME_WAIT
192.0.2.38     tcp     0        0        127.0.0.1:35244      127.0.0.1:10248      TIME_WAIT
192.0.2.38     tcp     0        0        127.0.0.1:7445       127.0.0.1:34146      ESTABLISHED
...
```

Z opcją `-k` dodatkowo podaje pełną nazwę poda, jeśli połączenie jest z nim związane:

```bash :no-line-numbers
talosctl -n 192.0.2.38 netstat -k

NODE           Proto   Recv-Q   Send-Q   Local Address        Foreign Address      State
...
192.0.2.38     tcp6    0        0        192.0.2.38:10250     192.0.2.37:14352     ESTABLISHED   -
192.0.2.38     tcp6    0        0        192.0.2.38:50000     192.0.2.34:56754     ESTABLISHED   -
192.0.2.38     tcp     0        0        10.244.4.14:42096    192.0.2.250:80       ESTABLISHED   default/shy-garlic-54fb9db499-gdzjl
192.0.2.38     tcp     0        0        10.244.4.14:44226    188.114.96.3:443     ESTABLISHED   default/shy-garlic-54fb9db499-gdzjl
...
```

Z opcją `-l` wyświetla wyłącznie gniazda w stanie LISTEN (tu wraz z informacją o podach):

```bash :no-line-numbers
talosctl -n 192.0.2.38 netstat -kl

NODE           Proto   Recv-Q   Send-Q   Local Address        Foreign Address      State
...
192.0.2.38     udp     0        0        192.0.2.38:7946      0.0.0.0:*                  -
192.0.2.38     udp     0        0        169.254.116.108:53   0.0.0.0:*                  -
192.0.2.38     udp     0        0        127.0.0.53:53        0.0.0.0:*                  -
192.0.2.38     udp     0        0        0.0.0.0:4789         0.0.0.0:*                  -
192.0.2.38     tcp6    0        0        :::8080              :::*              LISTEN   default/shy-garlic-54fb9db499-gdzjl
...
```

### Operacje systemowe

Wybrane polecenia:

| Polecenie | Opcje | Opis |
| --------| ------| -----|
| talosctl -n 192.0.2.33 list | -l / | Wyświetla zawartość katalogu na węźle klastra (odpowiednik `ls -l`). W ten sposób można przeglądać system plików. |
| talosctl -n 192.0.2.33 usage  /var | -H | Sprawdza, ile miejsca zajmuje katalog na dysku. Opcja `-H` Pokazuje wartosć "human readable" |
| talosctl -n 192.0.2.33 reboot | -/- | Restartuje węzeł |
