---
title: Upgrades
order: 2
icon: arrows-rotate
category:
  - Guide
---

Upgrading Talos Linux means replacing the entire system image with a new version. This operation is best performed outside the CI/CD process, upgrading each node separately. This reduces the risk of the cluster getting out of sync.

## Upgrading Talos Linux <Badge text="CI/CD not supported" type="danger" />

Change the value of the **talos_version** variable:

```hcl title="inputs.hcl"
cluster_endpoint   = "192.0.2.100"
kubernetes_version = "v1.37.1"
talos_version      = "v1.14.2" // [!code --]
talos_version      = "v1.14.3" // [!code ++]
```

Run the deployment targeting individual cluster nodes with the `-target` option. Before moving on to the next node, wait for Kubernetes to stabilize — once all nodes are **Ready**, continue.

```bash :no-line-numbers
terragrunt apply -target 'talos_machine.this["talos-dev-cp-node-1"]'
terragrunt apply -target 'talos_machine.this["talos-dev-cp-node-2"]'
terragrunt apply -target 'talos_machine.this["talos-dev-cp-node-3"]'
terragrunt apply -target 'talos_machine.this["talos-dev-worker-node-1"]'
terragrunt apply -target 'talos_machine.this["talos-dev-worker-node-2"]'
terragrunt apply -target 'talos_machine.this["talos-dev-worker-node-3"]'
terragrunt plan
```

The last command verifies that all resources have been deployed correctly. Expected result: **No changes**. The final step is to merge the change into the repository through the standard CI/CD path. The **No changes** status guarantees that the deployment is complete and that running the pipeline will not disrupt the cluster.

## Upgrading Kubernetes <Badge text="CI/CD full" type="tip" />

Kubernetes can be upgraded through the standard CI/CD path. The deployment itself is quick — Talos takes over the rest of the work and performs it without blocking Terraform.

```hcl title="inputs.hcl"
cluster_endpoint   = "192.0.2.100"
kubernetes_version = "v1.36.5" // [!code --]
kubernetes_version = "v1.37.1" // [!code ++]
talos_version      = "v1.14.3"
```

During the Kubernetes upgrade, brief connectivity issues with the control plane are possible.
