---
title: Preparing Kubernetes
order: 4
icon: https://cdn.simpleicons.org/kubernetes/326CE5
category:
  - Guide
---

Once the bootstrap process completes, the Talos Kubernetes cluster is not yet ready to run applications. It lacks services such as ingress, a load balancer and monitoring, which need to be installed next.

Components:
- MetalLB
- Metrics-server

They are located in the **clusters/talos-dev** directory. Logically, they are treated as system services, separate from regular applications. Once the base services are configured, you can deploy, in order: the [appchart repository](/en/kubernetes/helmchart) and the individual applications.

## FluxCD

Start the process by bootstrapping FluxCD. This allows some of the resources to be created automatically.

<!-- @include: ../kubernetes/flux.md{87-105} -->

### Kustomization
<!-- @include: ../kubernetes/flux.md{143-173} -->

More details about FluxCD: [Kubernetes/FluxCD](/en/kubernetes/flux)

## SOPS

### Installing the age key
<!-- @include: ../kubernetes/sops.md{45-52} -->

### Repository configuration
<!-- @include: ../kubernetes/sops.md{56-98} -->

More details about SOPS: [Kubernetes/SOPS](/en/kubernetes/sops)

## Load Balancer

### Installation

```bash :no-line-numbers
kubectl apply -f https://raw.githubusercontent.com/metallb/metallb/v0.16.1/config/manifests/metallb-native.yaml
```

### Configuration

You need to configure IP address advertisement and the address pool MetalLB can use. The configuration is stored in **clusters/talos-dev/metallb**, and FluxCD deploys it to the cluster.

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
  - 192.0.2.170-192.0.2.179
```

Addresses in the **IPAddressPool** must not be used by any other device or service.

## Ingress

The cluster uses Traefik as its ingress, installed with Helm.

First, install the required CRDs:

```bash :no-line-numbers
kubectl apply -f https://github.com/kubernetes-sigs/gateway-api/releases/download/v1.3.0/standard-install.yaml
kubectl apply -f https://raw.githubusercontent.com/traefik/traefik/v3.5/docs/content/reference/dynamic-configuration/kubernetes-gateway-rbac.yml
```

Next, prepare a `values.yaml` file that enables Gateway API support:

```yaml title="values.yaml"
providers:
  kubernetesGateway:
    enabled: true
```

and install the chart:

```bash :no-line-numbers
helm repo add traefik https://traefik.github.io/charts
helm repo update
helm upgrade --install traefik traefik/traefik \
  -n traefik --create-namespace \
  -f values.yaml
```

## Kubernetes metrics

The metrics-server manifest is located in the **clusters/talos-dev/metrics-server** directory.

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
