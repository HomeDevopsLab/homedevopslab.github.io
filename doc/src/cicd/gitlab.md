---
title: Gitlab
icon: fa-brands fa-gitlab
order: 2
category:
  - Guide
tag:
  - cicd
---
Gitlab jest miejscem przechowywania i wdrażania kodu IaC usług, które uruchomione są na platformie wirtualizacyjnej proxmox i infrastrukturze w AWS.

## Architektura

![Architektura wdrożenia Gitlaba](/assets/image/gitlab-infra.svg)

W HomeLAB'ie używam Gitlaba w wersji CE (Community Edition). Posiada on wystarczające funkcjonalności na potrzeby zbudowania pełnego środowiska CI/CD.

## Dostęp do repozytoriów
Gitlab daje możliwość pracy z repozytoriami użyciem protokołów **https** oraz **ssh**. Dostęp ssh jest wygodniejszą formą dostępu, ale wymaga kilku czynności na początek.

* Dodatnie publicznego klucza ssh do profilu w Gitlabie.
* Skonfigurowanie połączenia ssh

### Konfiguracja ssh

Do pliku `~/.ssh/config` należy wprowadzić wpis analogiczny do poniższego

```
Host gitlab.example.com
  HostName gitlab.example.com
  Port 2223
  IdentityFile ~/.ssh/id_rsa_homelab
```

W związku z tym, że gitlab uruchomiony jest w kontenerze, zostało wykonane mapowanie portu z wysokiego na docelowy: `22` na którym oczekuje połączęń demon sshd pracujący w środku.

## Kontener gitlab-ce

Kontener z [gitlab-ce](https://hub.docker.com/r/gitlab/gitlab-ce) jest dostarczany wraz z wszystkimi komponentami potrzebnymi do działania. W skład kontenera wchodzi:

* nginx
* postgresql
* redis
* sshd
* serwer gitlab
* serwer registry

### Konfiguracja kontenera
Kontener z Gitlabem nie wymaga wielu ustawień w Kubernetes. Najważniejsze opcje to ustawienie zmiennej środowiskowej oraz podmontowania trwałych katalogów znajdujących się na współdzielonej przestrzeni dyskowej.

Ustawienie zmiennej `GITLAB_OMNIBUS_CONFIG`

```yaml
env:
  - name: GITLAB_OMNIBUS_CONFIG
    value: "external_url 'http://gitlab.example.com'"
```

::: important HTTPS
Zmienna external_url celowo została skonfigurowana z urlem http, ze względu na to, że ssl jest zaterminowany na poziomie traefika (proxy). Jest to workaround, który rozwiązuje problem z dostępem do gitlaba przez przeglądarkę.
:::

Katalogi, które są przechowywane na współdzielonym storage.

```yaml
volumes:
  enabled: true
  mountPath:
    - config:/etc/gitlab
    - logs:/var/log/gitlab
    - data:/var/opt/gitlab
```

::: info Syntax
Powyższa składnia nie jest częścią standardowych manifestów kubernetes. Jest to mój autoski helmchart
:::

## Konfiguracja Gitlaba
Głównym plikiem konfiguracyjnym jest plik `/storage/gitlab/config/gitlab.rb`. Plik możemy edytować bezpośrednio z serwera storage, który udostępnia współdzieloną przestrzeń dla aplikacji dziających na klastrze kubernetes w HomeLAB.

Po wykonaniu konfiguracji należy wykonać polecenia:

```bash
gitlab-ctl reconfigure
gitlab-ctl restart
```
Pierwsze polecenie powoduje wygenerowanie standardowych plików konfiguracyjnych dla usług działających w kontenerze. Drugie znich wykonujemy aby zrestartować usługi, których konfiguracja uległa zmianie.

polecenia wykonujemy będąc wewnątrz poda gitlaba

```bash
kubectl get pods | grep gitlab
gitlab-55c57f6844-cvz95                    1/1     Running     0          11d
```
```bash
kubectl exec --stdin --tty gitlab-55c57f6844-cvz95 -- /bin/bash
root@gitlab-55c57f6844-cvz95:/#
```

### Konfiguracja SMTP

Gitlab został skonfigurowany w taki sposób aby wysyłać maile na mój lokalny serwer SMTP.

```bash
gitlab_rails['smtp_enable'] = true
gitlab_rails['smtp_address'] = "smtp-service.local"
gitlab_rails['smtp_port'] = 25
gitlab_rails['gitlab_email_enabled'] = true
gitlab_rails['gitlab_email_from'] = 'gitlab@angrybits.example'
gitlab_rails['gitlab_email_display_name'] = 'Gitlab'
gitlab_rails['gitlab_email_reply_to'] = 'noreply@angrybits.example'
```
