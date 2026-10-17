---
title: Talos Cluster
index: false
icon: fa-brands fa-linux
category:
  - Guide
---

## Architektura

Talos Linux stosuje zupełnie inną filozofię obsługi systemu niż tradycyjne dystrybucje linuksa. Jednym z założeń dystrybucji jest jej niezmienialność (immutable). W związku z tym, nie ma możliwości zalogowania się na nią przez ssh. Jenynym sposobem interakcji z systemem jest API z którego korzystają dedykowane narzędzia lub IaC. Ta jedna różnica w działaniu zmienia bardzo dużo w kontekście utrzymaniowym. Nie da się zainstalować ani zaktualizować pojedynczych pakietów. System dostarczany jest jako obraz.


![Architektura systemu Talos Linux](/assets/image/talos-diagram.svg)

## Diagnostyka systemu

Podstawowym narzędziem do interakcji z klastrem Talos jest **talosctl**. Umożliwia ono dostęp live do logów oraz informacji o bieżącej utylizacji zasobów takich jak procesor, pamięć, dyski i sieć.

### Węzły klastra

Wykonując polecenie `talosctl` możemy wskazać za pomocą opcji `-n` węzeł klastra na którym ma zostać ono wykonane. Aby wyświetlić węzły klastra wykonujemy polecenie:

```bash :no-line-numbers
talosctl -n 192.168.3.100 get members

NODE            NAMESPACE   TYPE     ID                        VERSION   HOSTNAME                  MACHINE TYPE   OS                ADDRESSES
192.168.3.100   cluster     Member   talos-dev-cp-node-1       2         talos-dev-cp-node-1       controlplane   Talos (v1.14.3)   ["192.168.3.33","192.168.3.100"]
192.168.3.100   cluster     Member   talos-dev-cp-node-2       3         talos-dev-cp-node-2       controlplane   Talos (v1.14.3)   ["192.168.3.34"]
192.168.3.100   cluster     Member   talos-dev-cp-node-3       4         talos-dev-cp-node-3       controlplane   Talos (v1.14.3)   ["192.168.3.35"]
192.168.3.100   cluster     Member   talos-dev-worker-node-1   2         talos-dev-worker-node-1   worker         Talos (v1.14.3)   ["192.168.3.36"]
192.168.3.100   cluster     Member   talos-dev-worker-node-2   2         talos-dev-worker-node-2   worker         Talos (v1.14.3)   ["192.168.3.37"]
192.168.3.100   cluster     Member   talos-dev-worker-node-3   2         talos-dev-worker-node-3   worker         Talos (v1.14.3)   ["192.168.3.38"]
```

::: tip VIP
W przykładzie został podany Virtual IP, który jest skonfigurowany w klastrze. Zamiast niego zadziała też podanie dowolnego węzła klastra.
:::

### Logi

Polecenia, którym można wykonać podstawową diagnostykę systemu

| Polecenie | Opis polecenia |
| ----------| ---------------|
| talosctl -n 192.168.3.33 dmesg | Komunikaty kernela |
| talosctl -n 192.168.3.33 logs machined | Komunikaty usługi `machined`. Lista uruchomionych usług niżej w artykule. W ten sposób można odczytać logi każdej z uruchomionych usług. |

::: tip services
Aby dowiedzieć się jakie usługi są uruchomione na wybranym węźle klastra należy wykonać polecenie

```bash :no-line-numbers
talosctl -n 192.168.3.33 services

NODE           SERVICE                STATE     HEALTH   LAST CHANGE    LAST EVENT
192.168.3.33   apid                   Running   OK       6h29m36s ago   Health check successful
192.168.3.33   auditd                 Running   OK       6h29m46s ago   Health check successful
192.168.3.33   containerd             Running   OK       6h29m46s ago   Health check successful
192.168.3.33   cri                    Running   OK       6h29m35s ago   Health check successful
192.168.3.33   dashboard              Running   ?        6h29m37s ago   Process Process(["/sbin/dashboard"]) started with PID 267
192.168.3.33   etcd                   Running   OK       6h29m11s ago   Health check successful
192.168.3.33   ext-qemu-guest-agent   Running   ?        6h29m46s ago   Started task ext-qemu-guest-agent (PID 232) for container ext-qemu-guest-agent
192.168.3.33   kubelet                Running   OK       6h29m33s ago   Health check successful
192.168.3.33   machined               Running   OK       6h29m46s ago   Health check successful
192.168.3.33   sandboxd               Running   OK       6h29m46s ago   Health check successful
192.168.3.33   syslogd                Running   OK       6h29m45s ago   Health check successful
192.168.3.33   trustd                 Running   OK       6h29m35s ago   Health check successful
192.168.3.33   udevd                  Running   OK       6h29m37s ago   Health check successful
```
:::

### Pody Kubernetes

Ponieważ Talos jest ściśle zintegrowany z kubernetes możemy używając `talosctl` wyświetlić uruchomione pody na wybranym węźle.

```bash :no-line-numbers
talosctl -n 192.168.3.36 containers --namespace=cri

NODE           NAMESPACE   ID                                                                                IMAGE                                               PID    STATUS
192.168.3.36   k8s.io      default/shy-garlic-5586cc58c7-skv5l                                               registry.k8s.io/pause:3.10.2                        1039   SANDBOX_READY
192.168.3.36   k8s.io      └─ default/shy-garlic-5586cc58c7-skv5l:shy-garlic:9bf7e054571b                    ghcr.io/zatto-dev/shy-garlic:0.13.1                 1520   CONTAINER_RUNNING
192.168.3.36   k8s.io      flux-system/helm-controller-57f4ccf566-w2428                                      registry.k8s.io/pause:3.10.2                        1129   SANDBOX_READY
192.168.3.36   k8s.io      └─ flux-system/helm-controller-57f4ccf566-w2428:manager:b9def4e84060              ghcr.io/fluxcd/helm-controller:v1.5.4               1341   CONTAINER_RUNNING
...
```

Można też dostać się do logów konkretnej aplikacji uruchomionej w Kubernetes

```bash :no-line-numbers
talosctl -n 192.168.3.36 logs --namespace=cri default/shy-garlic-5586cc58c7-skv5l:shy-garlic:9bf7e054571b

192.168.3.36: 2026-10-17T14:24:22.019684154Z stderr F time=2026-10-17T16:24:22.019+02:00 level=INFO msg="backgrounds directory ready" dir=/data/bg
192.168.3.36: 2026-10-17T14:24:22.132334642Z stderr F time=2026-10-17T16:24:22.131+02:00 level=INFO msg="config loaded" services=16 groups=4
192.168.3.36: 2026-10-17T14:24:22.132365393Z stderr F time=2026-10-17T16:24:22.131+02:00 level=INFO msg="shyg starting" addr=:8080 config=/etc/shygarlic/shygarlic.yaml db=/data/shygarlic.db backgrounds=/data/bg version=0.14.0
...
```