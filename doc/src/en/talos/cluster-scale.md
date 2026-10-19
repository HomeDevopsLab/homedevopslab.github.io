---
title: Scaling
order: 3
icon: arrows-up-down
category:
  - Guide
---

The cluster can easily be scaled up and down by changing the configuration code in the repository. Workers can be added as needed, in any number. For the control plane, an odd number of nodes must be kept to maintain etcd quorum. It is also a good idea to spread control-plane nodes evenly across the physical servers of the Proxmox cluster.

## Adding a node <Badge text="CI/CD full" type="tip" />

A node can be added to the cluster through the standard CI/CD change deployment cycle.

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

After the change is deployed, node-4 joins the cluster as a worker, which can be confirmed with `talosctl` and `kubectl`:

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

::: info Talos version
If the system image on the Proxmox cluster is older than the version set in the Talos configuration, the provider upgrades the joining node before it actually starts serving traffic. I have not noticed any issues with joining the cluster across patch versions. Still, it is good practice to keep the same Talos version in the cluster code repository and in the repository used to build the virtual machine templates.
:::

## Removing a node <Badge text="CI/CD partial" type="warning" />

To remove a node from the cluster, proceed the same way — delete the node's code and deploy the change. CI/CD will remove the corresponding resources.

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

After the deployment, the node must be removed from the Kubernetes cluster manually:

```bash :no-line-numbers
kubectl delete node talos-dev-worker-node-4
```

::: info
Actually removing the virtual machine from the Talos cluster member list can take up to about 30 minutes. This does not affect running applications.

Source: [siderolabs/talos#6264](https://github.com/siderolabs/talos/discussions/6264)
:::
