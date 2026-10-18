---
title: Skalowanie
order: 2
icon: arrows-up-down
category:
  - Guide
---

Klaster można w prosty sposób skalować w górę i w dół poprzez dodanie kodu konfiguracyjnego w repozytorium. Workery możemy dodawać w miarę potrzeby w dowolnej ilości. W przypadku control-plane musimy zachować nieparzystą liczbę węzłów aby zachować quorum. Dobrze jest też zadbać aby rozłożyć węzły control-plane równomiernie na fizycznych serwerach klastra proxmox.

## Dołączenie węzła

Dodawanie węzła do klastra możemy wykonać w cyklu wrożenia zmiany z użyciem CI/CD. 

```hcl title="workers.hcl"
node-3 = {
  pve_node  = "hp2"
  template  = local.common.template
  resources = local.common.resources,
  network = merge(local.common.network, {
    ip = "192.168.3.38/24"
  })
  onboot = local.common.onboot
}
node-4 = { // [!code ++]
  pve_node  = "proxmox" // [!code ++]
  template  = local.common.template // [!code ++]
  resources = local.common.resources, // [!code ++]
  network = merge(local.common.network, { // [!code ++]
    ip = "192.168.3.39/24" // [!code ++]
  }) // [!code ++]
  onboot = local.common.onboot // [!code ++]
} // [!code ++]
```

Po wdrożeniu zmiany, węzeł node-4 dołącza do klastra w roli workera, co można potwierdzić poleceniami `talosctl` oraz `kubectl`

```bash :no-line-numbers title="talosctl -n 192.168.3.100 get members"
NODE            NAMESPACE   TYPE     ID                        VERSION   HOSTNAME                  MACHINE TYPE   OS                ADDRESSES
192.168.3.100   cluster     Member   talos-dev-cp-node-1       2         talos-dev-cp-node-1       controlplane   Talos (v1.14.3)   ["192.168.3.33","192.168.3.100"]
192.168.3.100   cluster     Member   talos-dev-cp-node-2       3         talos-dev-cp-node-2       controlplane   Talos (v1.14.3)   ["192.168.3.34"]
192.168.3.100   cluster     Member   talos-dev-cp-node-3       4         talos-dev-cp-node-3       controlplane   Talos (v1.14.3)   ["192.168.3.35"]
192.168.3.100   cluster     Member   talos-dev-worker-node-1   2         talos-dev-worker-node-1   worker         Talos (v1.14.3)   ["192.168.3.36"]
192.168.3.100   cluster     Member   talos-dev-worker-node-2   2         talos-dev-worker-node-2   worker         Talos (v1.14.3)   ["192.168.3.37"]
192.168.3.100   cluster     Member   talos-dev-worker-node-3   2         talos-dev-worker-node-3   worker         Talos (v1.14.3)   ["192.168.3.38"]
192.168.3.100   cluster     Member   talos-dev-worker-node-4   2         talos-dev-worker-node-4   worker         Talos (v1.14.3)   ["192.168.3.39"]
```
```bash :no-line-numbers title="kubectl get nodes -o wide"
NAME                      STATUS   ROLES           AGE    VERSION   INTERNAL-IP    EXTERNAL-IP   OS-IMAGE          KERNEL-VERSION          CONTAINER-RUNTIME
talos-dev-cp-node-1       Ready    control-plane   3d2h   v1.37.1   192.168.3.33   <none>        Talos (v1.14.3)   6.18.56-talos (amd64)   containerd://2.3.7
talos-dev-cp-node-2       Ready    control-plane   3d2h   v1.37.1   192.168.3.34   <none>        Talos (v1.14.3)   6.18.56-talos (amd64)   containerd://2.3.7
talos-dev-cp-node-3       Ready    control-plane   3d2h   v1.37.1   192.168.3.35   <none>        Talos (v1.14.3)   6.18.56-talos (amd64)   containerd://2.3.7
talos-dev-worker-node-1   Ready    <none>          3d2h   v1.37.1   192.168.3.36   <none>        Talos (v1.14.3)   6.18.56-talos (amd64)   containerd://2.3.7
talos-dev-worker-node-2   Ready    <none>          3d2h   v1.37.1   192.168.3.37   <none>        Talos (v1.14.3)   6.18.56-talos (amd64)   containerd://2.3.7
talos-dev-worker-node-3   Ready    <none>          3d2h   v1.37.1   192.168.3.38   <none>        Talos (v1.14.3)   6.18.56-talos (amd64)   containerd://2.3.7
talos-dev-worker-node-4   Ready    <none>          16m    v1.37.1   192.168.3.39   <none>        Talos (v1.14.3)   6.18.56-talos (amd64)   containerd://2.3.7
```

::: info Wersja Talosa
Jeśli Na klastrze proxmox mamy starszą wersję obrazu systemu niż zadaną w konfiguracji Talosa, provider wykona aktualizację dołączanego węzła zanim zostanie on faktycznie włączony do ruchu. W przypadku patch versions nie zauważyłem problemów z dołączaniem do klastra. Myślę, że dobrą praktyką będzie utrzymywanie takiej samej wersji Talosa w repozytorium z kodem klastra oraz repozytorium z którego tworzone są template'y maszyn wirtualnych.
:::

## Usuwanie węzła.

Aby usunąć węzeł klastra należy wykonać analogiczną konfigurację - usunąć kod węzła i przeprowadzić proces wdrożenia zmiany. CI/CD wykona zadanie usunięcia zasobów.

```hcl title="workers.hcl"
node-3 = {
  pve_node  = "hp2"
  template  = local.common.template
  resources = local.common.resources,
  network = merge(local.common.network, {
    ip = "192.168.3.38/24"
  })
  onboot = local.common.onboot
}
node-4 = { // [!code --]
  pve_node  = "proxmox" // [!code --]
  template  = local.common.template // [!code --]
  resources = local.common.resources, // [!code --]
  network = merge(local.common.network, { // [!code --]
    ip = "192.168.3.39/24" // [!code --]
  }) // [!code --]
  onboot = local.common.onboot // [!code --]
} // [!code --]
```

Po wykonaniu wdrożenia trzeba ręcznie usunąć węzeł klastra kubernetes.

```bash :no-line-numbers
kubectl delete node talos-dev-worker-node-4
```

::: info
Faktyczne usunięcie maszyny wirtualnej z listy węzłów klastra Talosa może zająć nawet ok. 30 min. Nie wpływa to na pracę działających aplikacji.
:::