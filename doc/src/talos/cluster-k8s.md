---
title: Przygotowanie Kubernetes
order: 4
icon: https://cdn.simpleicons.org/kubernetes/326CE5
category:
  - Guide
---

Klaster Kubernetes Talosa po zakończeniu procesu bootstrap nie jest jeszcze gotowy do uruchamiania na nim aplikaji. Brakuje w nim takich usług jak ingress, loadbalancer oraz monitoring. Trzeba je zainstalować w kolejnym kroku.

Komponenty:
- MetalLB
- Metrics-server

Umieszczone są w katalogu **clusters/talos-dev**. Traktowane są logicznie jako usługi systemowe, które nie są związane z regularnymi  aplikacjami. Po skonfigurowaniu usług bazowych można wdrażać kolejno: [repozytorium z appchart](/kubernetes/helmchart) oraz poszczególne aplikacje. 

## FluxCD

Proces warto zacząć od bootstrapu FluxCD. Dzięki temu będzie można utworzyć część zasobów automatycznie.

<!-- @include: ../kubernetes/flux.md{87-105} -->

### Kustomization
<!-- @include: ../kubernetes/flux.md{143-173} -->

Więcej szczegółów dotyczących FluxCD: [Kubernetes/FluxCD](/kubernetes/flux)

## SOPS

### Instalacja klucza age
<!-- @include: ../kubernetes/sops.md{45-52} -->

### Konfiguracja w repozytorium
<!-- @include: ../kubernetes/sops.md{56-99} -->

Więcej szczegółów dotyczących SOPS: [Kubernetes/SOPS](/kubernetes/sops)

## Load Balancer

### Instalacja

```bash :no-line-numbers
kubectl apply -f https://raw.githubusercontent.com/metallb/metallb/v0.16.1/config/manifests/metallb-native.yaml
```

### Konfiguracja

Trzeba skonfigurować rozgłaszanie adresów IP oraz pulę z której może korzystać MetalLB. Konfiguracja zostanie zapisana w **clusters/talos-dev/metallb**. FluxCD zajmie się wdrożeniem w klastrze.

```yaml title="clusters/talos-dev/metallb/advertisement.yaml"
apiVersion: metallb.io/v1beta1
kind: L2Advertisement
metadata:
  name: example
  namespace: metallb-system
```

```yaml title="clusters/talos-dev/metallb/addresspool.yaml"
apiVersion: metallb.io/v1beta1
kind: IPAddressPool
metadata:
  name: metallb-ip-pool
  namespace: metallb-system
spec:
  addresses:
  - 192.168.3.170-192.168.3.179
```

Adresacja dla **IPAddressPool** nie może być przez nic innego używana.

## Ingress

Jako ingress klaster będzie wykorzystywał Traefik. Instalacja traefik z użyciem helm.

W pierwszym kroku trzeba zainstalować wymagane CRD:
```bash no-line-numbers
kubectl apply -f https://github.com/kubernetes-sigs/gateway-api/releases/download/v1.3.0/standard-install.yaml
kubectl apply -f https://raw.githubusercontent.com/traefik/traefik/v3.5/docs/content/reference/dynamic-configuration/kubernetes-gateway-rbac.yml
```

```yaml title="values.yaml"
providers:
  kubernetesGateway:
    enabled: true
```

```bash :no-line-numbers
helm repo add traefik https://traefik.github.io/charts
helm repo update
helm upgrade --install traefik traefik/traefik \
  -n traefik --create-namespace \
  -f values.yaml
```

## Metryki Kubernetes

Manifest metrics-server znajduje się w katalogu: **clusters/talos-dev/metrics-server**.

```yaml :collapsed-lines=15 title="clusters/talos-dev/metrics-server/components.yaml"
apiVersion: v1
kind: ServiceAccount
metadata:
  labels:
    k8s-app: metrics-server
  name: metrics-server
  namespace: kube-system
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  labels:
    k8s-app: metrics-server
    rbac.authorization.k8s.io/aggregate-to-admin: "true"
    rbac.authorization.k8s.io/aggregate-to-edit: "true"
    rbac.authorization.k8s.io/aggregate-to-view: "true"
  name: system:aggregated-metrics-reader
rules:
- apiGroups:
  - metrics.k8s.io
  resources:
  - pods
  - nodes
  verbs:
  - get
  - list
  - watch
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  labels:
    k8s-app: metrics-server
  name: system:metrics-server
rules:
- apiGroups:
  - ""
  resources:
  - nodes/metrics
  verbs:
  - get
- apiGroups:
  - ""
  resources:
  - pods
  - nodes
  verbs:
  - get
  - list
  - watch
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  labels:
    k8s-app: metrics-server
  name: metrics-server-auth-reader
  namespace: kube-system
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role
  name: extension-apiserver-authentication-reader
subjects:
- kind: ServiceAccount
  name: metrics-server
  namespace: kube-system
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  labels:
    k8s-app: metrics-server
  name: metrics-server:system:auth-delegator
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: system:auth-delegator
subjects:
- kind: ServiceAccount
  name: metrics-server
  namespace: kube-system
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  labels:
    k8s-app: metrics-server
  name: system:metrics-server
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: system:metrics-server
subjects:
- kind: ServiceAccount
  name: metrics-server
  namespace: kube-system
---
apiVersion: v1
kind: Service
metadata:
  labels:
    k8s-app: metrics-server
  name: metrics-server
  namespace: kube-system
spec:
  ports:
  - appProtocol: https
    name: https
    port: 443
    protocol: TCP
    targetPort: https
  selector:
    k8s-app: metrics-server
---
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    k8s-app: metrics-server
  name: metrics-server
  namespace: kube-system
spec:
  selector:
    matchLabels:
      k8s-app: metrics-server
  strategy:
    rollingUpdate:
      maxUnavailable: 0
  template:
    metadata:
      labels:
        k8s-app: metrics-server
    spec:
      containers:
      - args:
        - --cert-dir=/tmp
        - --secure-port=10250
        - --kubelet-preferred-address-types=InternalIP,ExternalIP,Hostname
        - --kubelet-use-node-status-port
        - --metric-resolution=15s
        - --kubelet-insecure-tls
        image: registry.k8s.io/metrics-server/metrics-server:v0.9.0
        imagePullPolicy: IfNotPresent
        livenessProbe:
          failureThreshold: 3
          httpGet:
            path: /livez
            port: https
            scheme: HTTPS
          periodSeconds: 10
        name: metrics-server
        ports:
        - containerPort: 10250
          name: https
          protocol: TCP
        readinessProbe:
          failureThreshold: 3
          httpGet:
            path: /readyz
            port: https
            scheme: HTTPS
          initialDelaySeconds: 20
          periodSeconds: 10
        resources:
          requests:
            cpu: 100m
            memory: 200Mi
        securityContext:
          allowPrivilegeEscalation: false
          capabilities:
            drop:
            - ALL
          readOnlyRootFilesystem: true
          runAsNonRoot: true
          runAsUser: 1000
          seccompProfile:
            type: RuntimeDefault
        volumeMounts:
        - mountPath: /tmp
          name: tmp-dir
      nodeSelector:
        kubernetes.io/os: linux
      priorityClassName: system-cluster-critical
      serviceAccountName: metrics-server
      volumes:
      - emptyDir: {}
        name: tmp-dir
---
apiVersion: apiregistration.k8s.io/v1
kind: APIService
metadata:
  labels:
    k8s-app: metrics-server
  name: v1beta1.metrics.k8s.io
spec:
  group: metrics.k8s.io
  groupPriorityMinimum: 100
  insecureSkipTLSVerify: true
  service:
    name: metrics-server
    namespace: kube-system
  version: v1beta1
  versionPriority: 100
```
