---
title: VM Templates
icon: paste
order: 1
category:
  - Guide
tag:
  - proxmox
---
Do tworzenia templateów maszyn wirtualnych służy repozytorium proxmox-vm-templates. Źródłem obrazów są publicznie dostępne obrazy cloud-init popularnych dystrybucji linuksa.

* Ubuntu: [https://cloud-images.ubuntu.com/](https://cloud-images.ubuntu.com/)
* Debian: [https://cloud.debian.org/images/cloud/](https://cloud.debian.org/images/cloud/)
* Rocky Linux: [https://rockylinux.org/alternative-images](https://rockylinux.org/alternative-images)

Kod templatów znajduje się w repozytorium git.

```bash
git clone git@gitlab.example.com:homelab/proxmox-vm-templates.git
```

## Konfiguracja wstępna
### Generowanie klucza ssh
Do wygenerowania klucza ssh służy polecenie ssh-keygen.
```bash
bash ~$ ssh-keygen 
Generating public/private rsa key pair.
Enter file in which to save the key (/root/.ssh/id_rsa): /root/.ssh/ansible
Enter passphrase (empty for no passphrase): 
Enter same passphrase again: 
Your identification has been saved in /root/.ssh/ansible
Your public key has been saved in /root/.ssh/ansible.pub
The key fingerprint is:
SHA256:cqIvLsgVt7uvMxmUiKwhzdMLRE98q1vWVHhTDtyOrdc root@node1
The key's randomart image is:
+---[RSA 3072]----+
| ....    o.o.    |
|  .o. . . =o.    |
|.+..o... o =.    |
|oo=o.+. . . o    |
|o. o+o+oS  . .   |
|.  .o+o+. . . E  |
|... .++    .     |
|... o*           |
|   o.+B.         |
+----[SHA256]-----+
bash ~$
```
W wyniku polecenia powstaną dwa pliki.
```bash
$ ls -l ~/.ssh/ansible*
-rw-------    1 root     root          2590 Mar 17 18:05 /root/.ssh/ansible
-rw-r--r--    1 root     root           564 Mar 17 18:05 /root/.ssh/ansible.pub
```

### Instalacja klucza na serwerze Proxmox
Logujemy się przez ssh na serwer proxmoxa na konto root i do pliku `~/.ssh/authorized_keys` dodajemy zawartość pliku **ansible.pub**, który wygenerowany został w poprzednim kroku. Ten krok jest konieczny do prawidłowego wykonania planu.

## Pliki konfiguracyjne
W pliku `files/userdata.yaml` zdefiniowana jest instalacja  uruchomienie Qemu Guest Agenta oraz konfiguracja domyślnego konta użytkownika.
::: important ssh
Poza kluczami administratorów, trzeba do tego pliku dodać również klucz publiczny ansible.pub
:::
W pliku `group_vars/proxmox_hosts` definiujemy, jakie template'y mają zostać wygenerowane.

::: normal-demo userdata.yaml
```yaml
#cloud-config
runcmd:
  - apt -y update
  - apt install -y qemu-guest-agent
  - systemctl enable qemu-guest-agent
  - systemctl start qemu-guest-agent
timezone: Europe/Warsaw
system_info:
  default_user:
    name: "default-user"
    lock_passwd: false
    sudo: ALL=(ALL) NOPASSWD:ALL
    ssh_authorized_keys:
      - ssh-rsa AAAAB3Nzaxxxxxxxx
      - ssh-rsa AAAAB3Nzaxxxxxxxx
      - ssh-rsa AAAAB3Nzaxxxxxxxx
ssh_pwauth: yes
package_upgrade: true
package_reboot_if_required: true
```
:::
::: normal-demo proxmox_hosts
```yaml
templates_config:
  cores: 1
  vcpus: 1
  memory: 1024
  bridge: "vmbr0"
  ansible_ssh_key: "{{ lookup('ansible.builtin.env', 'ANSIBLE_SSH_KEY_PUB') }}"
vm_templates:
  ubuntu-2204-amd64:
    url: "https://cloud-images.ubuntu.com/jammy/current/jammy-server-cloudimg-amd64-disk-kvm.img"
    vmid: 8000
  debian-12-amd64:
    url: "https://cloud.debian.org/images/cloud/bookworm/latest/debian-12-genericcloud-amd64.raw"
    vmid: 7000
```
:::


## Uruchomienie ręczne
Aby Wygenerować template'y ręcznie musimy mieć na komputerze odpowiednio przygotowane środowisko, które składa się z zainstalowanego ansible'a, wygenerowanego klucza SSH, który będzie potrzebny do przeprowadzenia wdrożenia na proxmoxie oraz ustawionych zmienych środowiskowych.

### Instalacja ansible
Instalacja ansible'a na przykładzie Ubuntu 22.04

```bash
sudo apt-add-repository ppa:ansible/ansible
sudo apt update
sudo apt install ansible
```

### Ustawienie zmiennych środowiskowych
Zanim uruchomiony zostanie playbook trzeba ustawić trzy zmienne środowiskowe:
* PROXMOX_API_USER
* PROXMOX_API_PASS
* PROXMOX_API_HOST
* ANSIBLE_SSH_KEY_PUB

Najprostrzym sposobem aby je ustawiać jest stworzenie pliku `.env` o takiej zawartości
```bash
export PROXMOX_API_USER="login@pam"
export PROXMOX_API_PASS="Password"
export PROXMOX_API_HOST="1.2.3.4"
export ANSIBLE_SSH_KEY_PUB="ssh-rsa AAAAB3Nzaxxxxxxxx"
```
Wczytanie zmiennych do powłoki.
```bash
source .env
```

### Uruchomienie playbooka
Po załadowaniu zmiennych środowiskowych i skonfigurowaniu ścieżki do klucza można uruchomić tworzenie template'ów.
```bash
ansible-playbook -i hosts deploy-vm-templates.yaml
```
## Uruchomienie automatyczne
W repozytorium skonfigurowany jest pipeline, do wykonania wdrożenia na środowisku HomeLab. Aby mógł on poprawnie się wykonać musimy mieć uruchomiony Gitlab Runner, który będzie podłączony z instancją gitlaba. 

### Zmienne środowiskowe
Dodatkowo trzeba ustawić odpowiednie zmienne środowiskowe w projekcie w gitlabie.

![Dodawanie zmiennych środowiskowych w Gitlabie](/assets/image/add_vars.png)

| Key | Typ | Environments | Value |
| ------| ----| -------------| -----|
| ANSIBLE_SSH_KEY_PRIV | Variable | All | Zawartość pliku /root/.ssh/ansible lub /root/.ssh/id_rsa |
| ANSIBLE_SSH_KEY_PUB | Variable | All | Zawartość pliku /root/.ssh/ansible.pub lub /root/.ssh/id_rsa.pub |
| PROXMOX_API_HOST | Variable | All | Adres IP lub DNS serwera proxmox |
| PROXMOX_API_USER | Variable | All | Nazwa użytkownika z uprawnieniami admina (root) serwera proxmox |
| PROXMOX_API_PASS | Variable | All | Hasło do konta admina serwera proxmox |

### Wdrażanie zmian
Wdrażanie zmian za pomocą repozytorium powinno odbywać się z użyciem poniższego workflow.

```flow:preset
st=>start: Start
createBranch=>operation: Stwórz banch
fileChange=>operation: Modyfikuj pliki
gitpush=>operation: git push
pullReq=>operation: Pull Request
tests=>subroutine: ansible --check --diff
testsRes=>condition: Test się udał?|approved
codeReview=>operation: Code Review
codeRevOK=>condition: Kod OK?
merge=>operation: Merge do main
tag=>operation: git tag
deploy=>subroutine: ansible playbook.yaml
end=>end: Koniec

st->createBranch->fileChange->gitpush->pullReq->tests(right)->testsRes
testsRes(yes)->codeReview(left)->codeRevOK
testsRes(no)->fileChange
codeRevOK(yes)->merge(right)->tag(right)->deploy(right)->end
codeRevOK(no, top)->fileChange
```
Przeprowadzenie wdrożenia zgodnie z tym schematem zminimalizuje ryzyko popełnienia błędu przez osobę przygotowującą wdrożenie.

### Pipeline
Do realizacji opisanego wyżej schematu został odpowiedino przygotowany pipeline

::: normal-demo .gitlab-ci.yml
```yaml
image:
  name: jauderho/ansible:9.3.0-ubuntu

stages:
  - initialize
  - check
  - build
  
initialize environment:
  stage: initialize
  script:
    - ansible --version
    - chmod 755 .
    - mkdir -p ~/.ssh
    - echo "${ANSIBLE_SSH_KEY_PRIV}" > ~/.ssh/id_rsa
    - echo "${ANSIBLE_SSH_KEY_PUB}" > ~/.ssh/id_rsa.pub
    - chmod 600 ~/.ssh/id_rsa
    - chmod 700 ~/.ssh
    - mkdir artifacts
    - cp -a ~/.ssh artifacts/
  artifacts:
    paths:
      - artifacts/
  rules:
    - if: $CI_PIPELINE_SOURCE == 'merge_request_event'
    - if: $CI_COMMIT_TAG
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH

check ansible config:
  stage: check
  script:
    - cp -a artifacts/.ssh /root/
    - ansible-playbook -i hosts deploy-vm-templates.yaml --diff --check
  dependencies:
    - initialize environment
  allow_failure: false
  rules:
    - if: $CI_PIPELINE_SOURCE == 'merge_request_event'
    - if: $CI_COMMIT_TAG
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH

build templates:
  stage: build
  script:
    - cp -a artifacts/.ssh /root/
    - ansible-playbook -i hosts deploy-vm-templates.yaml
  dependencies:
    - initialize environment
  allow_failure: false
  only:
    - tags
  except:
    - branches
```
:::
Pipeline składa się z trzech kroków, które uruchamiają się w zdefiniowanych momentach

| Stage | push na branch | push do main | pull request | merge | tag |
| ------| ---------------| -------------| -------------| ------| ----|
| initialize | NO | YES | YES | YES | NO|
| check | NO | YES | YES | YES | NO |
| build | NO | YES | YES | YES | YES|