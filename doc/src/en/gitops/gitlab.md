---
title: Gitlab
icon: fa-brands fa-gitlab
order: 1
category:
  - Guide
tag:
  - cicd
---

## Architecture

![Gitlab deployment architecture](/assets/image/gitlab-infra.svg)

I run Gitlab CE (Community Edition) in the HomeLAB. It's an integrated tool that provides all the functionality I need:

- docker container registry
- pipelines
- terraform states

## Repository access

Gitlab lets you work with repositories using the **https** and **ssh** protocols. SSH access requires configuring the client.

### SSH configuration

Add an entry like the one below to `~/.ssh/config`.

``` :no-line-numbers
Host gitlab.example.com
  HostName gitlab.example.com
  Port 2223
  IdentityFile ~/.ssh/id_rsa_homelab
```


## The gitlab-ce container

The [gitlab-ce](https://hub.docker.com/r/gitlab/gitlab-ce) container ships with all the components required to run. It includes:

* nginx
* postgresql
* redis
* sshd
* the gitlab server
* the registry server

### Container configuration

The Gitlab container doesn't need much configuration on Kubernetes. The most important settings are the environment variable and mounting persistent directories located on shared storage.

::: info HelmRelease
The configuration snippets below are based on the [appchart](https://github.com/HomeDevopsLab/appchart) syntax.
:::

Setting the `GITLAB_OMNIBUS_CONFIG` variable.

```yaml
env:
  - name: GITLAB_OMNIBUS_CONFIG
    value: "external_url 'https://gitlab.example.com'"
```

Directories stored on shared storage.

```yaml
volumes:
  enabled: true
  mountPath:
    - config:/etc/gitlab
    - logs:/var/log/gitlab
    - data:/var/opt/gitlab
```

## Configuring Gitlab

The main configuration file is `/storage/gitlab/config/gitlab.rb`. We can edit it directly from the storage server, which exposes shared space for applications running on the Kubernetes cluster in the HomeLAB.

After making changes, run the following commands:

```bash :no-line-numbers
gitlab-ctl reconfigure
gitlab-ctl restart
```

The first command regenerates the standard configuration files for the services running in the container. We run the second one to restart the services whose configuration changed.

We run these commands from inside the Gitlab pod.

```bash
kubectl get pods | grep gitlab
gitlab-55c57f6844-cvz95                    1/1     Running     0          11d
```
```bash
kubectl exec --stdin --tty gitlab-55c57f6844-cvz95 -- /bin/bash
root@gitlab-55c57f6844-cvz95:/#
```

### SMTP

Gitlab is configured to send emails through my local SMTP server.

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
The **gitlab-workhorse** service handles the Gitlab server. It communicates with the outside world through an nginx instance listening on port `80` inside the container.

Configuration in **gitlab.rb**

```bash
nginx['referrer_policy'] = 'false'
nginx['listen_port'] = 80
nginx['listen_https'] = false
```
Based on this configuration, the following file is generated: **/storage/gitlab/data/nginx/conf/gitlab-http.conf**.

### Registry
The registry server, integrated with Gitlab, shares part of its configuration. If we want a project's containers to be publicly accessible, we need to set the repository's visibility to public. If a repository has the **Internal** visibility level, access to its containers requires logging in to the registry. This is the visibility level used by repositories in the HomeLAB environment.

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

The registry service runs on port `5000`. This is the default port and there's no need to define it explicitly unless we want to change it for some reason. The registry is exposed outside the container through a dedicated nginx process listening on port `5050`.

Based on the `gitlab.rb` file, the following registry configuration files are generated:

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
Before running `gitlab-ctl restart`, make sure the realm: value in config.yml is set to an https url. Otherwise Kubernetes will have trouble pulling docker images.
:::

### Tuning

To save memory, the following services have been disabled:

* Prometheus
* Prometheus Alert Manager

```bash
monitoring_role['enable'] = false
prometheus['enable'] = false
alertmanager['enable'] = false
```

## Gitlab Runner

The Gitlab runner runs on a separate VM: gl-runner, inside a docker container. The runner in my Gitlab instance is of the **instance** type. That lets me use it across all projects without adding it to each one individually.

The Gitlab runner was added in the `Admin Area / Runners` section. To add a runner, we click **New instance runner**. Next, we select the platform: Linux.
After clicking **Create runner**, instructions appear describing how to register the runner. They contain the information needed for the next steps.

```bash
gitlab-runner register  --url http://gitlab.angrybits.pl  --token glrt-xxxxxxxxx
```

### Running it

```bash
docker run -d --name gitlab-runner --restart always \
  -v /home/cloud-user/containers/gitlab-runner/config:/etc/gitlab-runner \
  -v /var/run/docker.sock:/var/run/docker.sock \
  gitlab/gitlab-runner:latest
```

### Registration
The next step is registering the runner with Gitlab so it can start accepting jobs.

```bash
docker exec -it gitlab-runner gitlab-runner register
```
After running the command, follow the instructions shown on screen.

### DIND configuration
To build docker containers through a runner that itself runs as a docker container, the DIND (Docker IN Docker) feature needs to be configured.
In the **/home/ubuntu/docker-data/gitlab-runner/config/config.toml** file, in the `[[runners]]` section, replace the existing `[runners.docker]` block with the configuration below.

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

For this to take effect, restart the runner process in the container, or the entire container.

```bash
docker restart gitlab-runner
```

## Container Registry

The Container Registry requires logging in. A personal token is used for this.
Tokens are generated through: `Edit Profile / Access Tokens`.

### Pipeline

::: tip Vault
The generated token is stored in the local HashiCorp Vault instance at path: `kv/platforms/docker/DOCKER_REGISTRY_TOKEN`
:::

Using the token in a pipeline.

::: code-tabs#pipeline

@tab x86_64

```yaml
publish to docker registry:
  stage: deploy
  image: docker:latest
  services:
    - docker:dind
  script:
    - echo "$DOCKER_REGISTRY_TOKEN" | docker login $CI_REGISTRY -u $CI_REGISTRY_USER --password-stdin
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
    - echo "$DOCKER_REGISTRY_TOKEN" | docker login $CI_REGISTRY -u $CI_REGISTRY_USER --password-stdin
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

The pipeline above builds the docker image whenever a new tag is created on the main branch. Variables starting with `$CI_` are built into Gitlab and don't need to be defined anywhere beforehand.

* **CI_REGISTRY**: path to the registry under which the containers will be published (example: registry.lab/group_name)
* **CI_REGISTRY_USER**: our Gitlab account login
* **CI_REGISTRY_IMAGE**: the container image name, i.e. the full path to the docker image (example: registry.lab/group_name/repository_name)
* **CI_COMMIT_TAG**: the most recently committed tag.

### Kubernetes

Two components in my Kubernetes cluster are responsible for communicating with the registry:

* ImageRepository
* kubelet

ImageRepository is a CRD (Custom Resource Definition) from Flux that provides the delivery layer across the whole pipeline. Every 1m (an interval defined in the manifest), ImageRepository scans the registry for new container tags to deploy. If any are found, the whole update process for the application running in the container begins.
For Kubernetes to be able to work with a private registry, a secret must first be created in the appropriate namespace.

ImageRepository runs in the flux-system namespace, while the applications running on the cluster run in the default namespace. Because of this, the secret containing the registry token needs to be created in both namespaces.

```bash
kubectl create secret docker-registry regcred \
  --docker-server=registry.lab \
  --docker-username=gitlablogin \
  --docker-password=glpat-_xxxxxx \
  --docker-email=user.email@example.com \
  -n default
```

The manifests also need to be configured accordingly.

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

If you're using [appchart](https://github.com/HomeDevopsLab/appchart), it's enough to set the appropriate values key in the HelmRelease definition.

```yaml
values:
...
  image:
    registrySecret: regcred
    imagePolicy: true
    repository: registry.lab/groupname/appimage
```

Helmchart will configure the ImageRepository and Deployment objects for us accordingly.

## Terraform

The Terraform state is handled through a backend of type `http` in Terraform. Access to it is done using a Personal Access Token (PAT).

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


### Token permissions

| Token name | Permissions |
| -----------| ------------|
| terraform-state | api, read_api, read_registry, write_registry |

