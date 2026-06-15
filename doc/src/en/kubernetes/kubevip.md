---
title: Kube-VIP
icon: network-wired
order: 2
category:
  - Guide
tag:
  - kubernetes
---

By using kube-vip in the homelab I can implement a floating IP functionality. This has a real impact on the availability of services running in Kubernetes.

## Cloud provider

```bash :no-line-numbers
kubectl apply -f https://raw.githubusercontent.com/kube-vip/kube-vip-cloud-provider/main/manifest/kube-vip-cloud-controller.yaml
```

After running the command, the `kube-vip-cloud-provider` pod should appear in the list.

```bash :no-line-numbers title="🖥️ kubectl get pods -n kube-system | grep kube-vip"
kube-vip-cloud-provider-7b895b4b98-jshsk   1/1     Running     0             3m14s
kube-vip-ds-4ww75                          1/1     Running     0             10h
kube-vip-ds-b99sh                          1/1     Running     0             9h
kube-vip-ds-xglx4                          1/1     Running     0             9h
kube-vip-ds-xr8f5                          1/1     Running     0             10h
```

## IP range

We need to create a configuration that defines the range of IP addresses kube-vip can use when assigning them to services. These must be addresses that have not yet been used in the network segment. You also need to exclude them from the DHCP server configuration on the network devices (if applicable) and add reservations in your IPAM system.

```bash :no-line-numbers
kubectl create configmap --namespace kube-system kubevip --from-literal range-global=192.168.3.yy-192.168.3.zz
```

::: tip Configmap
When creating the configmap, an error may appear:
``` :no-line-numbers
error: failed to create configmap: configmaps "kubevip" already exists
```
In that case, update the configmap:

```bash :no-line-numbers
kubectl edit configmap kubevip -n kube-system
```
During editing, create the `data` key with `range-global`.
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

## Verification (optional)

To confirm everything is working, deploy nginx. If it all went correctly, you will see nginx's welcome page in the browser.

```bash :no-line-numbers
kubectl create deployment nginx --image nginx --namespace default
kubectl expose deployment nginx --port=80 --type=LoadBalancer --name=nginx
```

::: tip Deployment
Pod creation may take a moment. Kubernetes needs to pull the Docker image from the internet and start it.
You can confirm this with: `kubectl get pods`. The nginx pod should have a `Running` status.
:::

Check the IP address assigned by kube-vip:

```bash :no-line-numbers title="🖥️ kubectl get svc"
NAME         TYPE           CLUSTER-IP     EXTERNAL-IP    PORT(S)        AGE
kubernetes   ClusterIP      10.43.0.1      <none>         443/TCP        11h
nginx        LoadBalancer   10.43.50.221   192.168.3.yy   80:31852/TCP   7m47s
```

The assigned address is in the `EXTERNAL-IP` column.
