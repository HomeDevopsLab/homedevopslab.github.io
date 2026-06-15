---
title: Kube-VIP
icon: network-wired
order: 2
category:
  - Guide
tag:
  - kubernetes
---

Dzięki zastosowaniu projektu kube-vip w homelabie jestem w stanie zaimplementować funkcjonalność "pływającego ip" (floating IP). Ma to realny wpływ na dostępność usług uruchomionych w kubernetes. 

## Cloud provider

```bash :no-line-numbers
kubectl apply -f https://raw.githubusercontent.com/kube-vip/kube-vip-cloud-provider/main/manifest/kube-vip-cloud-controller.yaml
```

Po wykonaniu polecenia na liście powinien się pojawić pod `kube-vip-cloud-provider`

```bash :no-line-numbers title="🖥️ kubectl get pods -n kube-system | grep kube-vip"
kube-vip-cloud-provider-7b895b4b98-jshsk   1/1     Running     0             3m14s
kube-vip-ds-4ww75                          1/1     Running     0             10h
kube-vip-ds-b99sh                          1/1     Running     0             9h
kube-vip-ds-xglx4                          1/1     Running     0             9h
kube-vip-ds-xr8f5                          1/1     Running     0             10h
```

## Zakres IP

Musimy stworzyć konfigurację, która określa zakres adresów IP jakie kube-vip może wykorzystać do przyznawania ich usługom. Muszą to być adresy IP, które nie zostały jeszcze użyte w swoim segmencie sieci. Trzeba też zapewnić na urządzeniach sieciowych wykluczenie ich z konfiguracji serwera DHCP (jeśli jest taka potrzeba) a także wykonanie rezerwacji w systemie IPAM.

```bash :no-line-numbers
kubectl create configmap --namespace kube-system kubevip --from-literal range-global=192.168.3.yy-192.168.3.zz
```

::: tip Configmap
W trakcie tworzenia configmapy może pojawić się błąd
``` :no-line-numbers
error: failed to create configmap: configmaps "kubevip" already exists
```
Wtedy trzeba wykonać aktualizację configmapy

```bash :no-line-numbers
kubectl edit configmap kubevip -n kube-system
```
W czasie edycji trzeba utworzyć klucz `data` z `range-global`
:::

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  creationTimestamp: "2026-06-15T04:47:25Z"
  name: kubevip
  namespace: kube-system
  resourceVersion: "167275"
  uid: 11df55a1-68bd-4a0c-80c8-e87a82c0bb7a
data:
  range-global: 192.168.3.yy-192.168.3.zz
```

## Weryfikacja (opcjonalne)

Aby potwierdzić działanie wystarczy wykonać deployment nginx. Jeśli wszystko zadziałało prawidłowo, zobaczymy w przeglądarce "welcome page" nginx'a.

```bash :no-line-numbers
kubectl create deployment nginx --image nginx --namespace default
kubectl expose deployment nginx --port=80 --type=LoadBalancer --name=nginx
```

::: tip Deployment
Tworzenie poda może chwilkę zająć. Kubernetes musi pobrać z internetu obraz dockera i go uruchomić.
Możemy to potwierdzić poleceniem: `kubectl get pods`. Pod nginx powinien mieć status `Running`
:::

Sprawdzamy adres IP przydzielony przez kube-vip

```bash :no-line-numbers title="🖥️ kubectl get svc"
NAME         TYPE           CLUSTER-IP     EXTERNAL-IP    PORT(S)        AGE
kubernetes   ClusterIP      10.43.0.1      <none>         443/TCP        11h
nginx        LoadBalancer   10.43.50.221   192.168.3.yy   80:31852/TCP   7m47s
```

Jest to adres IP z kolumny `EXTERNAL-IP`.