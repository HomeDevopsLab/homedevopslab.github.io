---
title: Cluster Upgrade
icon: wrench
order: 2
category:
  - Guide
tag:
  - kubernetes
---

::: tip Kubernetes versions
It is recommended to upgrade by no more than one minor version at a time. For example: from v1.35.1 to v1.36.2.
:::

We start the upgrade with the control-plane nodes, followed by the workers. The upgrade is performed sequentially – node by node – while monitoring that everything works correctly. Never upgrade several nodes at the same time.

## Upgrade procedure

A list of all cluster nodes along with their roles:

<!-- @include: ./README.md{21-30} -->

### Control-plane

Optionally, take a snapshot of the ETCD database. Run the command on the first node (k3s-master1).

```bash :no-line-numbers
sudo k3s etcd-snapshot save --name pre-upgrade-1-35
```

The remaining commands are run on every control-plane node.

#### Draining the node

Running this command terminates all applications except daemonsets. The control-plane will start them on one of the remaining cluster nodes.

```bash :no-line-numbers
kubectl drain k3s-master1 --ignore-daemonsets --delete-emptydir-data
```

You can track the progress by running `kubectl get pods` with the appropriate parameters.

```bash :no-line-numbers
kubectl get pods -A --field-selector spec.nodeName=k3s-master1
```

#### Updating Kubernetes

Log in to the selected node over SSH and perform the update.

```bash :no-line-numbers
sudo su -
curl -sfL https://get.k3s.io | INSTALL_K3S_VERSION=v1.36.2+k3s1 sh -
```

The script restarts the k3s service right away. Once it is up, Kubernetes already reports the new version. The final step is to uncordon the node, which allows application pods to be scheduled on it again.

```bash :no-line-numbers
kubectl uncordon k3s-master1
```

::: tip
The applications that were evicted at the beginning will not return to their place automatically. This happens only while upgrading the subsequent nodes.
:::

Once all control-plane nodes are done, you can move on to the worker nodes.

### Worker nodes

The procedure is similar to the control-plane one, but before starting the update you need to determine two things:

- the IP address of the first master (control-plane) node,
- the cluster token.

::: tip Token
The server token can be found on the master node in the file: `/var/lib/rancher/k3s/server/node-token`
:::

#### Draining the node

Running this command terminates all applications except daemonsets. The control-plane will start them on one of the remaining cluster nodes.

```bash :no-line-numbers
kubectl drain k3s-aarch64-worker1 --ignore-daemonsets --delete-emptydir-data
```

You can track the progress by running `kubectl get pods` with the appropriate parameters.

```bash :no-line-numbers
kubectl get pods -A --field-selector spec.nodeName=k3s-aarch64-worker1
```

#### Updating Kubernetes

Log in to the selected node over SSH and perform the update.

```bash :no-line-numbers
sudo su -
curl -sfL https://get.k3s.io | K3S_URL=https://x.x.x.x:6443 K3S_TOKEN=K10fa******** INSTALL_K3S_VERSION=v1.36.2+k3s1 sh -
```

The script restarts the k3s service right away. Once it is up, Kubernetes already reports the new version. The final step is to uncordon the node, which allows application pods to be scheduled on it again.

```bash :no-line-numbers
kubectl uncordon k3s-aarch64-worker1
```

Repeat the operation sequentially on every worker node.
