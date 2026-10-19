---
title: Aktualizacja
order: 2
icon: arrows-rotate
category:
  - Guide
---

Aktualizacja systemu Talos Linux polega na wymianie całego obrazu systemu na nową wersję. Tę operację najlepiej przeprowadzić poza procesem CI/CD, aktualizując każdy węzeł oddzielnie. W ten sposób ograniczamy ryzyko rozsynchronizowania się klastra.

## Aktualizacja Talos Linux <Badge text="CI/CD not supported" type="danger" />

Zmieniamy wartość zmiennej **talos_version**:

```hcl title="inputs.hcl"
cluster_endpoint   = "192.0.2.100"
kubernetes_version = "v1.37.1"
talos_version      = "v1.14.2" // [!code --]
talos_version      = "v1.14.3" // [!code ++]
```

Wdrożenie wykonujemy, wskazując opcją `-target` pojedyncze węzły klastra. Przed przejściem do kolejnego węzła należy poczekać, aż Kubernetes się ustabilizuje — gdy wszystkie węzły mają status **Ready**, przechodzimy dalej.

```bash :no-line-numbers
terragrunt apply -target 'talos_machine.this["talos-dev-cp-node-1"]'
terragrunt apply -target 'talos_machine.this["talos-dev-cp-node-2"]'
terragrunt apply -target 'talos_machine.this["talos-dev-cp-node-3"]'
terragrunt apply -target 'talos_machine.this["talos-dev-worker-node-1"]'
terragrunt apply -target 'talos_machine.this["talos-dev-worker-node-2"]'
terragrunt apply -target 'talos_machine.this["talos-dev-worker-node-3"]'
terragrunt plan
```

Ostatnie polecenie weryfikuje, czy wszystkie zasoby zostały wdrożone prawidłowo. Spodziewany rezultat: **No changes**. Ostatnim krokiem jest wprowadzenie zmiany do repozytorium standardową ścieżką CI/CD. Status **No changes** gwarantuje, że wdrożenie jest ukończone, a uruchomienie pipeline'u nie spowoduje problemów z działaniem klastra.

## Aktualizacja Kubernetes <Badge text="CI/CD full" type="tip" />

Aktualizację Kubernetes można wykonać standardową ścieżką CI/CD. Samo wdrożenie trwa krótko — resztę pracy przejmuje Talos, który wykonuje ją, nie blokując Terraforma.

```hcl title="inputs.hcl"
cluster_endpoint   = "192.0.2.100"
kubernetes_version = "v1.36.5" // [!code --]
kubernetes_version = "v1.37.1" // [!code ++]
talos_version      = "v1.14.3"
```

W trakcie aktualizacji Kubernetes możliwe są chwilowe problemy z komunikacją z control-plane.
