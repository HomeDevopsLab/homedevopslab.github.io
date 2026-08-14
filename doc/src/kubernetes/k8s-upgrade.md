---
title: Upgrade klastra
icon: wrench
order: 2
category:
  - Guide
tag:
  - kubernetes
---

::: tip Wersje Kubernetes
Zaleca się wykonywanie procedury upgrade'u maksymalnie o jedną wersję minor w górę. Przykładowo: z v1.35.1 do v1.36.2.
:::

Aktualizację zaczynamy od węzłów control-plane. Po nich aktualizujemy workery. Upgrade wykonujemy sekwencyjnie – węzeł po węźle – jednocześnie monitorując, czy wszystko działa prawidłowo. Nie wykonujemy upgrade'u na kilku węzłach jednocześnie.

## Procedura upgrade'u

Lista wszystkich węzłów klastra wraz z ich rolami:

<!-- @include: ./README.md{21-30} -->

### Control-plane

Opcjonalnie wykonujemy snapshot bazy ETCD. Polecenie uruchamiamy na pierwszym węźle (k3s-master1).

```bash :no-line-numbers
sudo k3s etcd-snapshot save --name pre-upgrade-1-35
```

Kolejne polecenia wykonujemy na wszystkich węzłach control-plane.

#### Opróżnianie węzła

Wykonanie polecenia spowoduje terminację wszystkich aplikacji z wyjątkiem daemonsetów. Control-plane uruchomi je na jednym z pozostałych węzłów klastra.

```bash :no-line-numbers
kubectl drain k3s-master1 --ignore-daemonsets --delete-emptydir-data
```

Postęp można obserwować, wykonując `kubectl get pods` z odpowiednimi parametrami.

```bash :no-line-numbers
kubectl get pods -A --field-selector spec.nodeName=k3s-master1
```

#### Aktualizacja Kubernetes

Logujemy się na wybrany węzeł przez SSH i wykonujemy aktualizację.

```bash :no-line-numbers
sudo su -
curl -sfL https://get.k3s.io | INSTALL_K3S_VERSION=v1.36.2+k3s1 sh -
```

Skrypt od razu restartuje usługę k3s. Po jej uruchomieniu Kubernetes raportuje już nową wersję. Ostatnim etapem jest odblokowanie węzła, co umożliwi uruchamianie na nim podów z aplikacjami.

```bash :no-line-numbers
kubectl uncordon k3s-master1
```

::: tip
Aplikacje, które zostały wyłączone na początku, nie wrócą automatycznie na swoje miejsce. Stanie się to dopiero podczas aktualizacji kolejnych węzłów.
:::

Po przejściu przez wszystkie węzły control-plane można zaktualizować węzły typu worker.

### Węzły worker

Procedura wygląda podobnie jak w przypadku control-plane, ale zanim przystąpimy do aktualizacji, należy ustalić dwie rzeczy:

- adres IP pierwszego węzła master (control-plane),
- token klastra.

::: tip Token
Token serwera można znaleźć na węźle master w pliku: `/var/lib/rancher/k3s/server/node-token`
:::

#### Opróżnianie węzła

Wykonanie polecenia spowoduje terminację wszystkich aplikacji z wyjątkiem daemonsetów. Control-plane uruchomi je na jednym z pozostałych węzłów klastra.

```bash :no-line-numbers
kubectl drain k3s-aarch64-worker1 --ignore-daemonsets --delete-emptydir-data
```

Postęp można obserwować, wykonując `kubectl get pods` z odpowiednimi parametrami.

```bash :no-line-numbers
kubectl get pods -A --field-selector spec.nodeName=k3s-aarch64-worker1
```

#### Aktualizacja Kubernetes

Logujemy się na wybrany węzeł przez SSH i wykonujemy aktualizację.

```bash :no-line-numbers
sudo su -
curl -sfL https://get.k3s.io | K3S_URL=https://x.x.x.x:6443 K3S_TOKEN=K10fa******** INSTALL_K3S_VERSION=v1.36.2+k3s1 sh -
```

Skrypt od razu restartuje usługę k3s. Po jej uruchomieniu Kubernetes raportuje już nową wersję. Ostatnim etapem jest odblokowanie węzła, co umożliwi uruchamianie na nim podów z aplikacjami.

```bash :no-line-numbers
kubectl uncordon k3s-aarch64-worker1
```

Operację wykonujemy sekwencyjnie na każdym węźle worker.
