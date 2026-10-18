---
title: Aktualizacja
order: 2
icon: arrows-rotate
category:
  - Guide
---

Aktualizacje systemu Talos Linux wykonuje się poprzez wymianę całego obrazu systemu wskazując na jego nową wersję. Jest to operacja, którą najlepiej przeprowadzić poza procesem CI/CD targetując każdy węzeł oddzielnie. W ten sposób adresujemy ryzyko rozsynchronizowania się klastra.

## Aktualizacja Talos Linux  <Badge text="CI/CD not supported" type="danger" />

Zmieniamy wersję zmiennej **talos_version**

```hcl title="inputs.hcl"
cluster_endpoint   = "192.168.3.100"
kubernetes_version = "v1.37.1"
talos_version      = "v1.14.2" // [!code --]
talos_version      = "v1.14.3" // [!code ++]
```

Wykonujemy wdrożenie targetując pojedyncze węzły klastra. Ważne jest, żeby poczekać aż ustabilizuje się kubernetes przed przejścią do kolejnego węzła. Jak wszystkie węzły będą miały status **Ready** przechodzimy dalej.

```bash :no-line-numbers
terragrunt apply -target 'talos_machine.this["talos-dev-cp-node-1"]'
terragrunt apply -target 'talos_machine.this["talos-dev-cp-node-2"]'
terragrunt apply -target 'talos_machine.this["talos-dev-cp-node-3"]'
terragrunt apply -target 'talos_machine.this["talos-dev-worker-node-1"]'
terragrunt apply -target 'talos_machine.this["talos-dev-worker-node-2"]'
terragrunt apply -target 'talos_machine.this["talos-dev-worker-node-3"]'
terragrunt plan
```

Ostatnie polecenie weryfikuje, czy wszystkie zasoby się wdrożyły prawidłowo. Spodziewany rezultat: **No changes**. Ostatnim krokiem jest wprowadzenie zmiany do repozytorium standardową ścieżką CI/CD. Status **No changes** gwarantuje, że wdrożenie jest ukończone i uruchomienie pipeline nie spowoduje problemu działaniem klastra.

## Aktualizacja Kubernetes  <Badge text="CI/CD full" type="tip" />

Aktualizację kubernetes można wykonać w standardowej ścieżce CI/CD. Wdrożenie wykonuje się szybko, resztę pracy wykonuje Talos, który przejmuje zadanie i wykonuje je nie blokując terraforma.

```hcl title="inputs.hcl"
cluster_endpoint   = "192.168.3.100"
kubernetes_version = "v1.36.5" // [!code --]
kubernetes_version = "v1.37.1" // [!code ++]
talos_version      = "v1.14.3"
```

W trakcie atualizacji kubernetes możliwy jest chwilowy problem z komunikacją do control-plane.