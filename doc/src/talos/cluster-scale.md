---
title: Skalowanie
order: 3
icon: arrows-up-down
category:
  - Guide
---

Klaster można w prosty sposób skalować w górę i w dół, zmieniając kod konfiguracyjny w repozytorium. Workery można dodawać w miarę potrzeb w dowolnej liczbie. W przypadku control-plane trzeba utrzymać nieparzystą liczbę węzłów, aby zachować quorum etcd. Warto też rozłożyć węzły control-plane równomiernie na fizycznych serwerach klastra Proxmox.

## Dołączenie węzła <Badge text="CI/CD full" type="tip" />

Węzeł można dodać do klastra w standardowym cyklu wdrażania zmian z użyciem CI/CD.

```hcl title="workers.hcl"
node-3 = {
  pve_node  = "hp2"
  template  = local.common.template
  resources = local.common.resources,
  network = merge(local.common.network, {
    ip = "192.0.2.38/24"
  })
  onboot = local.common.onboot
}
node-4 = { // [!code ++]
  pve_node  = "proxmox" // [!code ++]
  template  = local.common.template // [!code ++]
  resources = local.common.resources, // [!code ++]
  network = merge(local.common.network, { // [!code ++]
    ip = "192.0.2.39/24" // [!code ++]
  }) // [!code ++]
  onboot = local.common.onboot // [!code ++]
} // [!code ++]
```

Po wdrożeniu zmiany, węzeł node-4 dołącza do klastra w roli workera, co można potwierdzić poleceniami `talosctl` oraz `kubectl`:

```bash :no-line-numbers title="talosctl -n 192.0.2.100 get members"
NODE            NAMESPACE   TYPE     ID                        VERSION   HOSTNAME                  MACHINE TYPE   OS                ADDRESSES
192.0.2.100     cluster     Member   talos-dev-cp-node-1       2         talos-dev-cp-node-1       controlplane   Talos (v1.14.3)   ["192.0.2.33","192.0.2.100"]
192.0.2.100     cluster     Member   talos-dev-cp-node-2       3         talos-dev-cp-node-2       controlplane   Talos (v1.14.3)   ["192.0.2.34"]
192.0.2.100     cluster     Member   talos-dev-cp-node-3       4         talos-dev-cp-node-3       controlplane   Talos (v1.14.3)   ["192.0.2.35"]
192.0.2.100     cluster     Member   talos-dev-worker-node-1   2         talos-dev-worker-node-1   worker         Talos (v1.14.3)   ["192.0.2.36"]
192.0.2.100     cluster     Member   talos-dev-worker-node-2   2         talos-dev-worker-node-2   worker         Talos (v1.14.3)   ["192.0.2.37"]
192.0.2.100     cluster     Member   talos-dev-worker-node-3   2         talos-dev-worker-node-3   worker         Talos (v1.14.3)   ["192.0.2.38"]
192.0.2.100     cluster     Member   talos-dev-worker-node-4   2         talos-dev-worker-node-4   worker         Talos (v1.14.3)   ["192.0.2.39"]
```
```bash :no-line-numbers title="kubectl get nodes -o wide"
NAME                      STATUS   ROLES           AGE    VERSION   INTERNAL-IP    EXTERNAL-IP   OS-IMAGE          KERNEL-VERSION          CONTAINER-RUNTIME
talos-dev-cp-node-1       Ready    control-plane   3d2h   v1.37.1   192.0.2.33     <none>        Talos (v1.14.3)   6.18.56-talos (amd64)   containerd://2.3.7
talos-dev-cp-node-2       Ready    control-plane   3d2h   v1.37.1   192.0.2.34     <none>        Talos (v1.14.3)   6.18.56-talos (amd64)   containerd://2.3.7
talos-dev-cp-node-3       Ready    control-plane   3d2h   v1.37.1   192.0.2.35     <none>        Talos (v1.14.3)   6.18.56-talos (amd64)   containerd://2.3.7
talos-dev-worker-node-1   Ready    <none>          3d2h   v1.37.1   192.0.2.36     <none>        Talos (v1.14.3)   6.18.56-talos (amd64)   containerd://2.3.7
talos-dev-worker-node-2   Ready    <none>          3d2h   v1.37.1   192.0.2.37     <none>        Talos (v1.14.3)   6.18.56-talos (amd64)   containerd://2.3.7
talos-dev-worker-node-3   Ready    <none>          3d2h   v1.37.1   192.0.2.38     <none>        Talos (v1.14.3)   6.18.56-talos (amd64)   containerd://2.3.7
talos-dev-worker-node-4   Ready    <none>          16m    v1.37.1   192.0.2.39     <none>        Talos (v1.14.3)   6.18.56-talos (amd64)   containerd://2.3.7
```

::: info Wersja Talosa
Jeśli na klastrze Proxmox znajduje się starsza wersja obrazu systemu niż wskazana w konfiguracji Talosa, provider zaktualizuje dołączany węzeł, zanim zostanie on faktycznie włączony do ruchu. W przypadku wersji patch nie zauważyłem problemów z dołączaniem do klastra. Dobrą praktyką jest jednak utrzymywanie tej samej wersji Talosa w repozytorium z kodem klastra oraz w repozytorium, z którego tworzone są template'y maszyn wirtualnych.
:::

## Usuwanie węzła <Badge text="CI/CD partial" type="warning" />

Aby usunąć węzeł z klastra, należy postąpić analogicznie — usunąć kod węzła i przeprowadzić wdrożenie zmiany. CI/CD usunie odpowiednie zasoby.

```hcl title="workers.hcl"
node-3 = {
  pve_node  = "hp2"
  template  = local.common.template
  resources = local.common.resources,
  network = merge(local.common.network, {
    ip = "192.0.2.38/24"
  })
  onboot = local.common.onboot
}
node-4 = { // [!code --]
  pve_node  = "proxmox" // [!code --]
  template  = local.common.template // [!code --]
  resources = local.common.resources, // [!code --]
  network = merge(local.common.network, { // [!code --]
    ip = "192.0.2.39/24" // [!code --]
  }) // [!code --]
  onboot = local.common.onboot // [!code --]
} // [!code --]
```

Po wykonaniu wdrożenia trzeba ręcznie usunąć węzeł z klastra Kubernetes:

```bash :no-line-numbers
kubectl delete node talos-dev-worker-node-4
```

::: info
Faktyczne usunięcie maszyny wirtualnej z listy węzłów klastra Talosa może potrwać nawet ok. 30 minut. Nie wpływa to na pracę działających aplikacji.

Źródło: [siderolabs/talos#6264](https://github.com/siderolabs/talos/discussions/6264)
:::
