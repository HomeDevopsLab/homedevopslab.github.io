---
title: FluxCD
icon: ship
order: 3
category:
  - Guide
tag:
  - cicd
---

## Overview

[FluxCD](https://fluxcd.io/flux/) is a continuous delivery tool. In my homelab environment I use it to deploy all applications on the Kubernetes cluster. Thanks to the `ImageUpdateAutomation` component, deploying new application versions can be automated whenever a container image is built in the appropriate version.

### Installing Flux

::: tabs

@tab MacOS

```bash :no-line-numbers
brew install fluxcd/tap/flux
```

@tab Linux

```bash :no-line-numbers
curl -s https://fluxcd.io/install.sh | sudo bash
```

@tab Windows

```powershell :no-line-numbers
choco install flux
```

:::

## Bootstrapping Flux

### GitHub PAT Token

Navigate to: [https://github.com/settings/tokens](https://github.com/settings/tokens)

@slidestart

## Tokens Classic

![tokens classic](/assets/image/pat1.png)

:::
Click to enlarge
:::

---

## New token

![tokens classic](/assets/image/pat2.png)

:::
Click to enlarge
:::

---

## Token Configuration

![tokens classic](/assets/image/pat3.png)

@slideend

In the last step, configure:

- token name
- token expiry period
- permissions — select the entire repository branch

After clicking "Generate token", follow the instructions and copy the token value.

::: warning PAT
If the tab is closed or refreshed before copying the token, the entire process must be repeated. There is no way to retrieve the token value afterwards.
:::

### Deploying Flux

To start using Flux, a bootstrap operation must be performed. During this process Flux generates and deploys its manifests to the Kubernetes cluster and publishes them to the specified repository. The cluster configuration for my environment is stored on GitHub. All available options are listed in the [bootstrap process documentation](https://fluxcd.io/flux/installation/bootstrap/).

::: important Kubernetes
Before running the flux command, make sure you are logged in to the Kubernetes cluster where Flux should be installed.
:::

```bash :no-line-numbers
export GITHUB_TOKEN=gh-xxxxxxxxxxxxx
flux bootstrap github \
  --components-extra=image-reflector-controller,image-automation-controller \
  --token-auth \
  --owner=HomeDevopsLab \
  --repository=test-fluxrepo \
  --branch=main \
  --path=clusters/k3s-test \
  --personal
```

The above command publishes Flux manifests to the repository while simultaneously installing them in the Kubernetes cluster. As a result, the directory `clusters/k3s-test` is created in the repository, containing the Flux objects.

The additional components used in the cluster are:

- image-reflector-controller
- image-automation-controller

They are responsible for detecting and deploying new container image versions.

## Updating the PAT Token

The PAT token is installed in Kubernetes in the `flux-system` namespace as a secret named `flux-system`.

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: flux-system
  namespace: flux-system
type: Opaque
data:
  password: ghp_xxxxxxxxxxxx
  username: git
```

After updating the PAT token, delete the old secret and deploy the new one.

```bash
kubectl -n flux-system delete secret flux-system
kubectl -n flux-system apply -f flux-secret.yaml
```

::: tip Base64
The values of the `password` and `username` keys must be Base64-encoded.
:::

## Kustomization

To deploy applications (and other configurations) with FluxCD, start by preparing a `Kustomization` manifest that points to the apps directory.

::: tip apps
To avoid a `Kustomization` error, create the apps directory and publish it to the repository together with the `Kustomization` manifest.

```bash :no-line-numbers
cd test-fluxrepo
mkdir apps
touch apps/.gitkeep
```
:::

```yaml title="clusters/k3s-test/apps.yaml"
---
apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: apps
  namespace: flux-system
spec:
  interval: 1m0s
  sourceRef:
    kind: GitRepository
    name: flux-system
  path: ./apps
  prune: true
  wait: true
  timeout: 1m0s
```

From this point, every manifest that appears in the `apps` directory will be automatically deployed by Flux.

## HelmChart Support

HelmChart significantly speeds up running applications in Kubernetes, while providing the freedom to choose which Kubernetes objects make up the application environment. For this purpose [AppChart](https://github.com/HomeDevopsLab/appchart) was created — a universal template for running various types of applications.

To use it, a `GitRepository` object must be configured in the cluster.

### GitRepository

For the sake of organisation, all `GitRepository` manifests are published in the `apps/gitrepos` directory. Each version of AppChart has a unique `name` and a distinguishing tag or branch.

Manifest definition for version `3.2.0`:

```yaml title="apps/gitrepos/app-chart-320.yaml"
apiVersion: source.toolkit.fluxcd.io/v1
kind: GitRepository
metadata:
  name: appchart-320
  namespace: default
spec:
  interval: 1m
  url: https://github.com/HomeDevopsLab/appchart
  ref:
    tag: "3.2.0"
```

Using the manifest in an application:

```yaml {13}
apiVersion: helm.toolkit.fluxcd.io/v2
kind: HelmRelease
metadata:
  name: test-app
  namespace: default
spec:
  interval: 1m
  chart:
    spec:
      chart: ./chart
      sourceRef:
        kind: GitRepository
        name: appchart-320
        namespace: default
      interval: 1m
```

In the application's HelmRelease, the `name` field is used to link both objects.

### Updating AppChart

To test new AppChart features, deploy an additional GitRepository object pointing to a feature branch in the repository.

```yaml {4,10}
apiVersion: source.toolkit.fluxcd.io/v1
kind: GitRepository
metadata:
  name: appchart-feature
  namespace: default
spec:
  interval: 1m
  url: https://github.com/HomeDevopsLab/appchart
  ref:
    branch: new-feature
```

#### Deploying a New HelmChart Version

If all changes work correctly, perform the following steps.

1. Prepare the AppChart release.
2. Update the name of the referenced HelmChart in all HelmRelease manifests to the one associated with the new tag.
3. Delete the file from `apps/gitrepos` that is linked to the branch.
4. Delete the branch from the repository.

If an application turns out not to work correctly with the new version — revert to the previous AppChart version, but only in that one specific HelmRelease.

## Image Automation

[ImageAutomation](https://fluxcd.io/flux/components/image/) automates the deployment of new application versions. This feature is supported in the HelmChart in use. To enable it, set `imagePolicy: true`; otherwise set the value to `false`.

### Registry Secret (regcred)

ImageAutomation requires deploying a secret that allows pulling Docker images from the GitLab registry.

```bash :no-line-numbers
kubectl create secret -n flux-system docker-registry regcred \
  --docker-email=admin@domena.pl \
  --docker-username=gitlab_user \
  --docker-password=glpat-xxxxxxxxxxxxxx \
  --docker-server=registry.git.domena.pl
```

The same must be done in the `default` namespace.

### Configuration

```yaml {2,3,5}
image:
  registrySecret: regcred
  imagePolicy: true
  repository: registry.private.pl/project/documentation
  tag: 2.5.1 # {"$imagepolicy": "flux-system:doc:tag"}
```

If the registry requires authentication, deploy the appropriate secret and reference it in the `registrySecret` option. For image policy to work correctly, a special comment must be added to the `tag` line.

``` :no-line-numbers
# {"$imagepolicy": "flux-system:doc:tag"}
```

| namespace | release name | field |
| ----------| -------------| ------|
| flux-system | doc | tag |

In the `flux-system` namespace, an imagePolicy object is deployed. `doc` is the application name defined in the HelmRelease that contains this configuration. `tag` is the field that Flux updates automatically.

::: important ReleaseName
The application name in imagepolicy must match the ReleaseName.
:::

Thanks to this configuration, the tag in the HelmRelease does not need to be updated manually — Flux will take care of it.

::: warning git pull
To avoid conflicts in the repository, remember to run git pull.
:::
