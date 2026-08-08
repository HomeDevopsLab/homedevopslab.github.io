---
title: Gitlab
icon: fa-brands fa-gitlab
order: 1
category:
  - Guide
tag:
  - cicd
---

## Architektura

![Architektura wdrożenia Gitlaba](/assets/image/gitlab-infra.svg)

W HomeLAB'ie używam Gitlaba w wersji CE (Community Edition). Jest to zintegrowane narzędzie, które zapewnia mi potrzebne funkcjonalności:

- rejestr kontenerów dockera (registry)
- pipelines
- terraform states

## Dostęp do repozytoriów
Gitlab daje możliwość pracy z repozytoriami z użyciem protokołów **https** oraz **ssh**. Dostęp ssh wymaga skonfigurowania klienta.

### Konfiguracja ssh

Do pliku `~/.ssh/config` należy wprowadzić wpis analogiczny do poniższego

``` :no-line-numbers
Host gitlab.example.com
  HostName gitlab.example.com
  Port 2224
  IdentityFile ~/.ssh/id_rsa_homelab
```


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

::: info HelmRelease
Fragmenty konfiguracji poniżej opierają się na składni [appchart](https://github.com/HomeDevopsLab/appchart)
:::

Ustawienie zmiennej `GITLAB_OMNIBUS_CONFIG`

```yaml
env:
  - name: GITLAB_OMNIBUS_CONFIG
    value: |
      external_url 'https://gitlab.example.com';
      nginx['listen_port'] = 80;
      nginx['listen_https'] = false;
      nginx['proxy_set_headers'] = {
        "Host" => "code.angrybits.pl",
        "X-Forwarded-Proto" => "https",
        "X-Forwarded-Ssl" => "on"
      };
```

Katalogi, które są przechowywane na współdzielonym storage.

```yaml
volumes:
ownership: 0:0
nfs:
  server: persistent-storage.host
  path: /storage
  mountPath:
    - config:/etc/gitlab
    - logs:/var/log/gitlab
    - data:/var/opt/gitlab
```

## Konfiguracja Gitlaba

Głównym plikiem konfiguracyjnym jest plik `/storage/gitlab/config/gitlab.rb`. Plik możemy edytować bezpośrednio z serwera storage, który udostępnia współdzieloną przestrzeń dla aplikacji działających na klastrze Kubernetes w HomeLAB.

Po wykonaniu konfiguracji należy wykonać polecenia:

```bash :no-line-numbers
gitlab-ctl reconfigure
gitlab-ctl restart
```

Pierwsze polecenie powoduje wygenerowanie standardowych plików konfiguracyjnych dla usług działających w kontenerze. Drugie z nich wykonujemy, aby zrestartować usługi, których konfiguracja uległa zmianie.

Polecenia wykonujemy, będąc wewnątrz poda Gitlaba.

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
Za działanie serwera Gitlab odpowiada usługa **gitlab-workhorse**. Komunikuje się ona ze środowiskiem zewnętrznym poprzez instancję nginx'a, która nasłuchuje na porcie `80` w kontenerze.

Konfiguracja w **gitlab.rb**

```bash
nginx['referrer_policy'] = 'false'
nginx['listen_port'] = 80
nginx['listen_https'] = false
```
Na podstawie tej konfiguracji generowany jest plik: **/storage/gitlab/data/nginx/conf/gitlab-http.conf**.

### Registry
Serwer registry zintegrowany z Gitlabem współdzieli z nim część konfiguracji. Jeśli chcemy aby kontenery dla określonego projektu były dostępne publicznie, musimy ustawić w opcjach repozytorium dostęp publiczny. Jeśli repozytorium będzie miało ustawiony poziom dostępu: **Internal**, dostęp do kontenerów będzie wymagał zalogowania się do registry. Taki poziom dostępu mają repozytoria w środowisku HomeLAB.

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

Usługa registry uruchomiona jest na porcie `5000`. Jest to domyślny port i nie ma potrzeby jego definiowania, chyba, że chcielibyśmy to z jakiegoś powodu zmienić. Registry jest udostępniane poza kontener za pomocą dedykowanego procesu nginx'a, który działa na porcie: `5050`.

Na podstawie pliku `gitlab.rb` powstają pliki konfiguracyjne usługi registry: 

* /storage/gitlab/data/registry/config.yml
* /storage/gitlab/data/nginx/conf/gitlab-registry.conf

### Tuning

Aby zaoszczędzić pamięć wyłączone zostały poniższe usługi:

* Prometheus
* Prometheus Alert Manager

```bash
monitoring_role['enable'] = false
prometheus['enable'] = false
alertmanager['enable'] = false
```

## Gitlab Runner

Gitlab runner uruchomiony jest na osobnej vm-ce: gl-runner w kontenerze dockera. Runner w mojej instancji Gitlaba jest typu **instance**. Dzięki temu mogę go używać we wszystkich projektach bez potrzeby dodawania go do nich.

Gitlab runner został dodany w sekcji: `Admin Area / Runners`. Aby dodać runnera, klikamy **New instance runner**. W dalszym kroku wybieramy platformę: Linux.
Po kliknięciu **Create runner** pojawia się instrukcja, która opisuje jak zarejestrować runnera. Zawiera ona informacje potrzebne w dalszych krokach.

```bash
gitlab-runner register  --url http://gitlab.angrybits.pl  --token glrt-xxxxxxxxx
```

### Uruchomienie

```bash
docker run -d --name gitlab-runner --restart always \
  -v /home/cloud-user/containers/gitlab-runner/config:/etc/gitlab-runner \
  -v /var/run/docker.sock:/var/run/docker.sock \
  gitlab/gitlab-runner:latest
```

### Rejestracja
Następnym krokiem jest rejestracja runnera w gitlabie, aby mógł on przyjmować zadania.

```bash
docker exec -it gitlab-runner gitlab-runner register
```
Po wykonaniu polecenia należy postępować zgodnie z instrukcjami wyświetlanymi na ekranie.

### Konfiguracja DIND
Do budowania kontenerów dockera poprzez runnera, który jest uruchomiony jako kontener dockera potrzebne jest skonfigurowanie funkcjonalności DIND (Docker IN Docker).
W pliku **/home/ubuntu/docker-data/gitlab-runner/config/config.toml** w sekcji `[[runners]]` zastępujemy obecny blok `[runners.docker]` poniższą konfiguracją.

```bash
[runners.docker]
  tls = false
  image = "docker:28.5.2"
  privileged = true
  disable_entrypoint_overwrite = false
  oom_kill_disable = false
  disable_cache = false
  volumes = ["/cache", "/var/run/docker.sock:/var/run/docker.sock"]
```

Aby to zadziałało należy zrestartować proces runnera w kontenerze, lub cały kontener.

```bash
docker restart gitlab-runner
```

## Container Registry

Container Registry wymaga zalogowania się do niego. W tym celu używany jest personal token.
Generowanie tokena robi się poprzez: `Edit Profile / Access Tokens`.

### Pipeline

::: tip Vault
Wygenerowany token zapisany jest w lokalnej instancji HashiCorp Vault w ścieżce: `kv/platforms/docker/DOCKER_CODE_REGISTRY_TOKEN` 
:::

Wykorzystanie tokena w pipeline.

::: code-tabs#pipeline

@tab x86_64

```yaml
publish to docker registry:
  stage: deploy
  image: docker:latest
  services:
    - docker:dind
  script:
    - echo "$DOCKER_CODE_REGISTRY_TOKEN" | docker login $CI_REGISTRY -u $CI_REGISTRY_USER --password-stdin
    - docker build -t ${CI_REGISTRY_IMAGE}:$CI_COMMIT_TAG .
    - docker push ${CI_REGISTRY_IMAGE}:$CI_COMMIT_TAG
  only:
    - tags
  except:
    - branches

```

@tab multiarch

```yaml
publish to docker registry:
  stage: deploy
  needs:
    - vault secret

  image: jdrouet/docker-with-buildx:stable

  variables:
    DOCKER_HOST: unix:///var/run/docker.sock
    DOCKER_TLS_CERTDIR: ""
    DOCKER_DRIVER: overlay2

  script:
    - source secrets.env
    - rm -f secret.env
    - echo "$DOCKER_CODE_REGISTRY_TOKEN" | docker login $CI_REGISTRY -u $CI_REGISTRY_USER --password-stdin
    - docker buildx create --use
    - docker buildx build
      --build-arg GIT_TAG=$CI_COMMIT_TAG
      --build-arg BUILD_DATE=$(date +'%d.%m.%Y')
      --platform linux/arm64/v8,linux/amd64
      --tag ${CI_REGISTRY_IMAGE}:$CI_COMMIT_TAG
      --push .
  only:
    - tags
  except:
    - branches

```
:::

Powyższy pipeline uruchamia budowanie dockera po wystawieniu nowego taga na branchu main. Zmienne zaczynające się od `$CI_` są wbudowane w gitlaba i nie trzeba ich nigdzie wcześniej definiować

* **CI_REGISTRY**: ścieżka do registry pod którą zostaną opublikowane kontenery (przykład: registry.lab/nazwa_grupy)
* **CI_REGISTRY_USER**: login naszego konta gitlab
* **CI_REGISTRY_IMAGE**: nazwa obrazu kontenera, jest to pełna ścieżka do obrazu dockera (przykład: registry.lab/nazwa_grupy/nazwa_repozytorium)
* **CI_COMMIT_TAG**: ostatnio zacommitowany tag.

### Kubernetes

Za komunikację z registry odpowiedzialne są w moim klastrze Kubernetes dwa komponenty:

* ImageRepository
* kubelet

ImageRepository jest to CRD (Custom Resource Definition) od Flux'a, który zapewnia warstwę delivery w całym pipeline. ImageRepository co 1m (timer zdefiniowany w manifeście) skanuje registry w poszukiwaniu nowych tagów kontenerów do wdrożenia. Jeśli takowe się pojawią, wtedy zaczyna się cały proces aktualizacji aplikacji pracującej w kontenerze. 
Aby Kubernetes był w stanie współpracować z private registry, trzeba w pierwszej kolejności utworzyć secret w odpowiednim namespace.

ImageRepository uruchomiony jest w namespace flux-system, natomiast aplikacje uruchomione na klastrze działają w namespace: default. W związku z tym secret zawierający token do registry trzeba utworzyć w obu tych namespace'ach.

```bash
kubectl create secret docker-registry regcred \
  --docker-server=registry.lab \
  --docker-username=gitlablogin \
  --docker-password=glpat-_xxxxxx \
  --docker-email=user.email@example.com \
  -n default
```

Dodatkowo należy skonfigurować odpowiednio manifesty

::: code-tabs#secret
@tab ImageRepository
```yaml
apiVersion: image.toolkit.fluxcd.io/v1beta2
kind: ImageRepository
metadata:
  name: podinfo
  namespace: flux-system
spec:
  image: <your-private-image>
  interval: 1h
  secretRef:
    name: regcred
```
@tab Pod
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: private-app
  namespace: default
spec:
  containers:
  - name: private-app
    image: <your-private-image>
  imagePullSecrets:
  - name: regcred
```
:::

W przypadku użycia [appchart](https://github.com/HomeDevopsLab/appchart) wystarczy w definicji HelmRelease ustawić odpowiednio klucz values

```yaml
values:
...
  image:
    registrySecret: regcred
    imagePolicy: true
    repository: registry.lab/groupname/appimage
```

Helmchart odpowiednio skonfiguruje obiekty ImageRepository oraz Deployment za nas.

## Terraform

Terraform state obsługiwany jest poprzez backend typu `http` w Terraformie. Dostęp do niego realizowany jest z wykorzystaniem Personal Access Token (PAT).

```hcl
generate "backend" {
  path      = "backend.tf"
  if_exists = "overwrite_terragrunt"
  contents  = <<EOF
terraform {
  backend "http" {
    address        = "https://gitlab.local/api/v4/projects/76/terraform/state/${local.tfstate_name}"
    lock_address   = "https://gitlab.local/api/v4/projects/76/terraform/state/${local.tfstate_name}/lock"
    unlock_address = "https://gitlab.local/api/v4/projects/76/terraform/state/${local.tfstate_name}/lock"
    username       = "${local.gitlab_username}"
    password       = "${local.gitlab_access_token}"
    lock_method    = "POST"
    unlock_method  = "DELETE"
    retry_wait_min = 5
  }
}
EOF
}
```


### Uprawnienia tokena

| Nazwa tokena | Uprawnienia |
| -------------| ------------|
| terraform-state | api, read_api, read_registry, write_registry |

