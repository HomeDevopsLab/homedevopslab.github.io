---
title: Cluster Installation
icon: download
order: 3
category:
  - Guide
tag:
  - kubernetes
---

The installation process will be carried out on four virtual machines (VMs) with identical parameters.

* control-plane: test-master1, test-master2, test-master3
* worker nodes: test-worker1

The installation will be performed using the [k3sup](https://github.com/alexellis/k3sup) tool directly from your local machine.

## Prerequisites

Running Linux virtual servers with SSH access. It is best to create them using the repository according to the [VM creation documentation](/en/proxmox/vmmachines.md).

::: tip known_hosts
Before starting the installation process, it is advisable to log in to each VM at least once to avoid being prompted to accept the host key.
:::

### Tools

* [k3sup](https://github.com/alexellis/k3sup)
* [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl-linux/)

## Installation

Before starting the installation, create the `.kube` directory locally.

### k3sup options

Selected k3sup options

| Option | Description |
| -------| ------------|
| --ip | IP address of the host on which k3sup will perform operations |
| --tls-san | IP address (and DNS name) that will serve as the shared cluster IP in kube-vip |
| --cluster | Option used on the host where the cluster is being initialized |
| --server-ip | Option to specify the IP address of the node where the cluster was initialized, used when joining additional nodes |
| --server | Option used to add a host to the control-plane |

### Cluster initialization

```bash title="test-master1"
k3sup install \
--ip 192.168.3.17 \
--tls-san 192.168.3.22 \
--tls-san testk3s-ha-cluster.lan \
--k3s-extra-args "--disable servicelb" \
--cluster \
--k3s-channel latest \
--local-path $HOME/.kube/config \
--user cloud-user \
--merge
```

This command initializes the Kubernetes cluster on the host specified by the `--ip` option.

::: tip .kube/config
If the following error appears during cluster initialization:

``` :no-line-numbers
Error: open /home/cloud-user/.kube/config: no such file or director
```
It means that k3sup was unable to configure cluster access for you. Log in to the newly created node and copy the contents of `/etc/rancher/k3s/k3s.yaml` to your local `~/.kube/config`. You only need to change the line `server: https://127.0.0.1:6443` and replace it with the IP address of the host that was just configured.
:::

Once the command finishes, the first cluster node is up and running.
The installation ends with the following messages:

``` :no-line-numbers
Merging config into file: /home/cloud-user/.kube/config
Saving file to: /home/cloud-user/.kube/config

# Test your cluster with:
export KUBECONFIG=/home/cloud-user/.kube/config
kubectl config use-context default
kubectl get node -o wide
```

Verifying that Kubernetes is working:

```bash title="🖥️ kubectl get nodes"
NAME           STATUS   ROLES                AGE   VERSION
test-master1   Ready    control-plane,etcd   12m   v1.36.1+k3s1
```

### Installing kube-vip

::: important
This step is required before proceeding with k3s installation on the remaining cluster nodes.
:::

All commands are executed on `test-master1`.

```bash
sudo su -
mkdir -p /var/lib/rancher/k3s/server/manifests/
curl https://kube-vip.io/manifests/rbac.yaml > /var/lib/rancher/k3s/server/manifests/kube-vip-rbac.yaml
kubectl apply -f https://kube-vip.io/manifests/rbac.yaml
export VIP=192.168.3.22
export INTERFACE=eth0
KVVERSION=$(curl -sL https://api.github.com/repos/kube-vip/kube-vip/releases | jq -r ".[0].name")
alias kube-vip="ctr image pull ghcr.io/kube-vip/kube-vip:$KVVERSION; ctr run --rm --net-host ghcr.io/kube-vip/kube-vip:$KVVERSION vip /kube-vip"
kube-vip manifest daemonset --services --inCluster --arp --interface eth0 | kubectl apply -f -
```

After running these commands, the kube-vip pod should start:

```bash :no-line-numbers
root@test-master1:~# kubectl get pods -n kube-system | grep kube-vip
kube-vip-ds-xr8f5                         1/1     Running     0             11m
```

### Joining control-plane nodes

Add additional hosts by changing the IP address in the `--ip` option:

```bash :no-line-numbers
k3sup join \
--ip 192.168.3.xx \
--server-ip 192.168.3.17 \
--server \
--k3s-channel latest \
--user cloud-user
```

### Joining worker nodes

When joining worker nodes, omit the `--server` option:

```bash :no-line-numbers
k3sup join \
--ip 192.168.3.xx \
--server-ip 192.168.3.17 \
--k3s-channel latest \
--user cloud-user
```

## Summary

After completing all operations, we have a ready 4-node Kubernetes cluster:

```bash :no-line-numbers title="🖥️ kubectl get nodes"
NAME           STATUS   ROLES                AGE    VERSION
test-master1   Ready    control-plane,etcd   95m    v1.36.1+k3s1
test-master2   Ready    control-plane,etcd   64m    v1.36.1+k3s1
test-master3   Ready    control-plane,etcd   4m3s   v1.36.1+k3s1
test-worker1   Ready    <none>               34s    v1.36.1+k3s1
```

kube-vip DaemonSet running on all control-plane (master) nodes:

```bash :no-line-numbers title="🖥️ kubectl get pods -n kube-system -o wide | grep kube-vip"
kube-vip-ds-4ww75                         1/1     Running     0              70m     192.168.3.18   test-master2   <none>           <none>
kube-vip-ds-b99sh                         1/1     Running     0              6m24s   192.168.3.20   test-worker1   <none>           <none>
kube-vip-ds-xglx4                         1/1     Running     0              9m52s   192.168.3.19   test-master3   <none>           <none>
kube-vip-ds-xr8f5                         1/1     Running     0              87m     192.168.3.17   test-master1   <none>           <none>
```
