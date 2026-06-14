---
title: Instalacja clustra
icon: download
order: 3
category:
  - Guide
tag:
  - kubernetes
---

Proces instalacji wykonamy na 4-ech maszynach wirtualnych (VM) o identycznych parametrach.

* control-plane: test-master1, test-master2, test-master3
* worker nodes: test-worker1

Instalacja zostanie wykonana przy użyciu narzędzia [k3sup](https://github.com/alexellis/k3sup) bezpośrednio z komputera.

## Wymagania wstępne

Działające serwery wirtualne z linuksem z dostępem przez ssh. Najlepiej utworzyć je przy użyciu repozytorium według [dokumentacji tworzenia vm](/proxmox/vmmachines.md).

::: tip known_hosts
Zanim zaczniemy proces instalacji wskazane jest zalogowanie się raz na każdą z VM aby uniknąć pytania p akceptację klucza hosta.
:::

### Narzędzia

* [k3sup](https://github.com/alexellis/k3sup)
* [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl-linux/)

## Instalacja

Przed przystąpieniem do instalacji trzeba założyć lokalnie katalog `.kube`

### Opcje k3sup

Wybrane opcje k3sup

| Opcja | Opis |
| ------| -----|
| --ip | Adres IP hosta na którym k3sup ma wykonywać operacje |
| --tls-san | Adres IP (oraz nazwa DNS), który w kube-vip będzie wspólnym adresem IP clustra |
| --cluster | Opcja używana na hoście na którym inicjowany jest cluster |
| --server-ip | Opcja do podania adresu IP noda na którym został zainicjowany cluster, używamy do dodawania kolejnych node'ów |
| --server | Opcja używana do dodania hosta do control-plane |

### Inicjalizacja clustra

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

Polecenie inicjuje cluster kubernetes na wskazanym opcją `--ip` hoście.

::: tip .kube/config
Jeśli w czasie inicjalizacji clustra pojawi się błąd

``` :no-line-numbers
Error: open /home/cloud-user/.kube/config: no such file or director
```
Oznacza on. że k3sup nie był w stanie skonfigurować dla nas dostępu do clustra. Logujemy się na dopiero co stworzony node i kopiujemy zawartość pliku: `/etc/rancher/k3s/k3s.yaml` do swojego lokalnego `~/.kube/config`. Należy tylko zmienić linijkę `server: https://127.0.0.1:6443` i wstawić adres IP hosta, który przed chwilą był konfigurowany.
:::

Po zakończeniu działania polecenia mamy już działający pierwszy node clustra.
Instalacja kończy się komunikatami

``` :no-line-numbers
Merging config into file: /home/cloud-user/.kube/config
Saving file to: /home/cloud-user/.kube/config

# Test your cluster with:
export KUBECONFIG=/home/cloud-user/.kube/config
kubectl config use-context default
kubectl get node -o wide
```

Weryfikacja działania kubernetes

```bash title="🖥️ kubectl get nodes"
NAME           STATUS   ROLES                AGE   VERSION
test-master1   Ready    control-plane,etcd   12m   v1.36.1+k3s1
```

### Instalacja kube-vip

::: important
Jest to krok wymagany zanim przejdziemy do instalacji k3s na kolejnych nodach clustra
:::

Wszystkie polecenia wykonujamy na `test-master1`

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

Po wykonaniu tych poleceń pownien się uruchomić pod z kube-vip

```bash :no-line-numbers
root@test-master1:~# kubectl get pods -n kube-system | grep kube-vip
kube-vip-ds-xr8f5                         1/1     Running     0             11m
```
### Dołączanie nodów control-plane

Dodajemy kolejne hosty zmieniając adres ip w opcji `--ip`

```bash :no-line-numbers
k3sup join \
--ip 192.168.3.xx \
--server-ip 192.168.3.17 \
--server \
--k3s-channel latest \
--user cloud-user
```

### Dołączanie workerów

Dołączając worker nody nie podajemy opcji `--server`.

```bash :no-line-numbers
k3sup join \
--ip 192.168.3.xx \
--server-ip 192.168.3.17 \
--k3s-channel latest \
--user cloud-user
```

## Podsumowanie

Po zakończeniu wszystkich operacji mamy gotowy 4-nodowy cluster kubernetes

```bash :no-line-numbers title="🖥️ kubectl get nodes"
NAME           STATUS   ROLES                AGE    VERSION
test-master1   Ready    control-plane,etcd   95m    v1.36.1+k3s1
test-master2   Ready    control-plane,etcd   64m    v1.36.1+k3s1
test-master3   Ready    control-plane,etcd   4m3s   v1.36.1+k3s1
test-worker1   Ready    <none>               34s    v1.36.1+k3s1
```

Daemonset kube-vip uruchomiony na wszyskich nodach control-plane (master)

```bash :no-line-numbers title="🖥️ kubectl get pods -n kube-system -o wide | grep kube-vip"
kube-vip-ds-4ww75                         1/1     Running     0              70m     192.168.3.18   test-master2   <none>           <none>
kube-vip-ds-b99sh                         1/1     Running     0              6m24s   192.168.3.20   test-worker1   <none>           <none>
kube-vip-ds-xglx4                         1/1     Running     0              9m52s   192.168.3.19   test-master3   <none>           <none>
kube-vip-ds-xr8f5                         1/1     Running     0              87m     192.168.3.17   test-master1   <none>           <none>
```