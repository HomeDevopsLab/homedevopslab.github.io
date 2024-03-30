---
title: Bazy danych
icon: database
order: 1
category:
  - Guide
tag:
  - docker
---
Bazy danych zostały uruchomione jako kontenery dockera na vm-ce `srv-db3`. Korzystają z nich różne aplikacje uruchomione w klastrze kubernetes. Wszystkie bazy danych przechowują dane w katalogu: `/home/cloud-user/containers`.

| CPU | RAM | Disk | OS |
| ----| ----| -----| ---|
| 4 | 8GB | 50GB | ![ubuntu](/assets/image/ubuntu.png =20x) Ubuntu |

## Lista aplikacji

| Typ Bazy | Kontener | Port | Aplikacje |
|:---------|:--------:| -----| ----------|
| ![](/assets/image/logo-redis.svg) | redis | 6379 | immich-microservices<br>immich-ml<br>immich-server |
| ![](/assets/image/postgres-logo.svg =80x) | pgvecto | 5433 | immich-microservices<br>immich-ml<br>immich-server |
| ![](/assets/image/postgres-logo.svg =80x) | postgres | 5432 | mattermost |
| ![](/assets/image/mysql-logo.svg =80x) | mysql | 3306 | gitea<br>passbolt<br>semaphore<br>wikijs |

## Konfiguracja
Do uruchamiania baz danych służy repozytorium: **homelab-services**. Definicja kontenerów baz danych znajduje się w pliku: `group_vars/group_database`. Plik zorganizowany jest w taki sposób, aby umożliwić ansiblowi iterację po wszystkich zdefiniowanych w pliku kontenerach.

```yaml
containers:
  pgvecto:
    image: tensorchord/pgvecto-rs:pg14-v0.2.0
    volumes: 
      - "/home/{{ ansible_user }}/containers/pgvecto:/var/lib/postgresql/data"
    owner: "999"
    group: "100"
    ports:
      - "5433:5432/tcp"
    env:
      PGDATA: "/var/lib/postgresql/data"
      POSTGRES_PASSWORD: "{{ lookup('ansible.builtin.env', 'POSTGRES_PASSWORD') }}"
```
### Opcje kontenerów
Playbook iteruje po elementach `containers`. Wsystkie potrzebne kontenery dopisujemy do tego obiektu. Obsługiwane na ten moment parametry kontenerów:
* **image**: identyfikator kontenera wraz z jego wersją
* **volumes**: lista mapowań katalogów vm-ki do kontenera. Używamy tej opcji do permanentnego przechowywania danych
* **owner / group**: identyfikator uzytkownika i grupy, która w kontenerze ma mieć uprawnienia do zapisywania danych na dysku
* **ports**: lista mapowań portów vm-ki na port w kontenerze
* **env**: lista zmiennych środowiskowych wymaganych przez kontener

::: tip Mapowanie
Mapowanie volumes oraz ports zawsze odbywa się w ten sposób, że po lewej stronie dwukropka mamy katalog i port vm-ki a po prawej stronie katalog i port w kontenerze dockera.
:::

### Nowe opcje kontenerów
Jeśli obecny zestaw opcji nie będzie wystarczający aby uruchomić kontener, istnieje możliwość dodania ich w konfiguracji. W tym celu należy zdefiniować nowy kontener z dodatkowymi opcjami w pliku. `group_vars/group_database` i wprowadzić nowe opcje do pliku `roles/database/tasks/containers.yaml`.

::: tabs
@tab group_database
```yaml
containers:
  example:
    image: example/example:latest
    ....
    foo: bar
```
@tab containers.yaml
```yaml
- name: Create {{ item.key }} container
  community.docker.docker_container:
    name: "{{ item.key }}"
    image: "{{ item.value.image }}"
    ...
    foo: "{{ item.value.foo }}"
```
:::

## Wdrażanie konfiguracji

Wdrażanie odbywa się poprzez złożenie pull requesta. Po pozytywnym przejściu przez code review, mergu do main oraz otagowaniu wersji odbywa się wdrożenie usługi na maszynie wirtualnej.  

::: important Kontenery
Bazy danych są usługami w których do tej pory nie miam potrzeby ingerować w ich wewnętrzne ustawienia. Wdrożone kontenery mają ustawiony w playbooku `state: started`. Oznacza to, że podczas kolejnych iteracji związanych z wdrażaniem nowych usług, działające kontenery nie będą restartowane.
:::