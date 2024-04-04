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

W HomeLAB'ie używam Gitlaba w wersji CE (Community Edition). Posiada on wystarczające funkcjonalności na potrzeby zbudowania pełnego środowiska CI/CD. Posiada on zintegrowaną funkcjonalność registry dla kontenerów dockera oraz współpracującego z nim zewnętrznej instancji runnera. Runner uruchomiony jest na oddzielnej vm-ce w kontenerze dockerowym.

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

### SMTP

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
### Nginx (Gitlab)
### Registry
Serwer registry zintegrowany z gitlabem współdzieli z nim część konfiguracji. Jeśli chcemy aby kontenery dla określonego projektu były dostępne publicznie, musimy ustawić w opcjach repozytorium dostęp publiczny. Jeśli repozytorium będzie miało ustawiony poziom dostępu: **Internal**, dostęp do kontenerów będzie wymagał zalogowania się do registry. Taki poziom dostępu mają repozytoria w środowisku HomeLAB.

```bash
registry_external_url 'https://registry.lab'
registry['enable'] = true
gitlab_rails['registry_enabled'] = true
gitlab_rails['registry_host'] = "registry.lab"
gitlab_rails['api_url'] = "http://registry.lab"
registry_nginx['enable'] = true
registry_nginx['listen_port'] = 5050
registry_nginx['listen_https'] = false
registry_nginx['proxy_set_headers'] = {
  "Host" => "$http_host",
  "X-Real-IP" => "$remote_addr",
  "X-Forwarded-For" => "$proxy_add_x_forwarded_for",
  "X-Forwarded-Proto" => "https",
  "X-Forwarded-Ssl" => "on"
}

gitlab_rails['rack_attack_git_basic_auth'] = {
   'enabled' => true,
   'ip_whitelist' => ["127.0.0.1"],
   'maxretry' => 10,
   'findtime' => 600,
   'bantime' => 136000
}
registry['env'] = {
  "REGISTRY_HTTP_RELATIVEURLS" => true
}
nginx['real_ip_trusted_addresses'] = ['10.0.0.0/8', '192.168.0.0/16']
nginx['real_ip_header'] = 'X-Real-IP'
nginx['real_ip_recursive'] = 'on'
```

Usługa registstry uruchomiona jest na porcie `5000`. Jest to domyślny port i nie ma potrzeby jego definiowania, chyba, że chcielibyśmy to z jakiegoś powodu zmienić. Registry jest udostępniane poza koneter za pomocą dedykowanego procesu nginx'a, który działa na porcie: `5050`.

Na podstawie pliku `gitlab.rb` powstają pliki konfiguracyjne usługi registry: 

* /storage/gitlab/data/registry/config.yml
* /storage/gitlab/data/nginx/conf/gitlab-registry.conf

::: normal-demo /storage/gitlab/data/registry/config.yml
```yaml
version: 0.1
log:
  level: info
  formatter: text
  fields:
    service: registry
    environment: production
storage: {"filesystem":{"rootdirectory":"/var/opt/gitlab/gitlab-rails/shared/registry"},"cache":{"blobdescriptor":"inmemory"},"delete":{"enabled":true}}
http:
  addr: 127.0.0.1:5000
  secret: "**********************************"
  headers:
    X-Content-Type-Options: [nosniff]
health:
  storagedriver:
    enabled: true
    interval: 10s
    threshold: 3
auth:
  token:
    realm: https://gitlab.lab/jwt/auth
    service: container_registry
    issuer: omnibus-gitlab-issuer
    rootcertbundle: /var/opt/gitlab/registry/gitlab-registry.crt
    autoredirect: false
validation:
  disabled: true
```
:::

::: warning Realm
Zanim wykonamy polecenie `gitlab-ctl` restart należy upewnić się, że w config.yml w realm: ustawiony jest url https. W przeciwnym razie kubernetes będzie miało problemy z pobieraniem obrazów dockera.
:::




### Zbędne usługi
## Gitlab Runner
dind
## CI / CD
### Pipelines
### Kubernetes