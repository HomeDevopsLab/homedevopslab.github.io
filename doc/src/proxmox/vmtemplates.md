---
title: VM Templates
icon: paste
order: 1
category:
  - Guide
tag:
  - proxmox
---

Do tworzenia templateów maszyn wirtualnych służy repozytorium proxmox-vm-templates. Kod napisany jest przy użyciu Ansible. Playbook, który tworzy template'y znajduje się w pliku: `deploy-vm-templates.yaml`. Template'y wdrażane są na wszystkich serwerach będących częścią clustra proxmox i zapisują się na przestrzeni dyskowej: `local-lvm`.

Źródłem obrazów systemu są publicznie dostępne obrazy cloud-init popularnych dystrybucji linuksa.

- Ubuntu: [https://cloud-images.ubuntu.com/](https://cloud-images.ubuntu.com/)
- Debian: [https://cloud.debian.org/images/cloud/](https://cloud.debian.org/images/cloud/)
- Rocky Linux: [https://rockylinux.org/alternative-images](https://rockylinux.org/alternative-images)

Klonowanie repozytorium.

```bash
git clone git@gitlab.example.com:homelab/proxmox-vm-templates.git
```

## Konfiguracja wstępna

Aby ansible był w stanie stworzyć template'y trzeba wygenerować i dodać na każdym z serwerów klucz ssh dla ansible.

::: important vault
Wygenerowane klucze trzeba dodać do zbioru kv w lokalnym hashicorp vault. Klucze ssh dla ansible są zapisane w ścieżce `kv/ssh_keys/ansible`
:::

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

Logujemy się przez ssh na serwery proxmox na konto root i do pliku `~/.ssh/authorized_keys` dodajemy zawartość pliku **ansible.pub**, który wygenerowany został w poprzednim kroku. Ten krok jest konieczny do prawidłowego wykonania planu.

## Pliki konfiguracyjne

Do repozytorium zostały dodane dwa pliki typu `cloud-init`. Zostały one podzielone względem dystrybucji linuksa dla której zostały przygotowane:

- userdata-debian.yaml
- userdata-ubuntu.yaml

Ich głównym zadaniem jest zainstalowanie programu qemu-guest-agent wymaganego przez proxmoxa oraz przygotowanie konta administracyjnego na maszynach wirtualnych. Dzięki kluczom ssh dostęp do konta ma dostęp automatyka (ansible) oraz wszyscy administratorzy homelab.

```yaml title="⚙️ Przykładowy userdata.yaml"
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

::: tip ssh
Poza kluczami administratorów, trzeba do tego pliku dodać również klucz publiczny ansible.pub. Ansible będzie wykonywał również inne zadania konfiguracyjne na stworzonych maszynach VM
:::

W pliku `group_vars/proxmox_hosts` definiujemy, jakie template'y mają zostać wygenerowane.

```yaml title="⚙️ group_vars/proxmox_hosts"
templates_config:
  cores: 1
  vcpus: 1
  memory: 1024
  bridge: "vmbr0"
vm_templates:
  ubuntu-2404-basic-amd64:
    url: "https://cloud-images.ubuntu.com/noble/current/noble-server-cloudimg-amd64.img"
    vmid: 2000
  debian-13-amd64:
    url: "https://cloud.debian.org/images/cloud/trixie/latest/debian-13-genericcloud-amd64.raw"
    vmid: 3000
```

## Uruchomienie ręczne

Aby wygenerować template'y ręcznie musimy mieć na komputerze odpowiednio przygotowane środowisko, które składa się z zainstalowanego ansible'a, wygenerowanego klucza SSH, który będzie potrzebny do przeprowadzenia wdrożenia na proxmoxie oraz ustawionych zmiennych środowiskowych.

::: tip Vault
Jeśli klucze ssh dla ansible są zapisane w lokalnym vault, możemy je sobie pobrać i zapisać na koncie na lokalnej lub zdalnej maszynie na którym będziemy uruchamiać playbook
:::

### Instalacja ansible

Instalacja ansible'a na przykładzie Ubuntu

```bash
sudo apt-add-repository ppa:ansible/ansible
sudo apt update
sudo apt install ansible
```

### Zmienne środowiskowe

Zanim uruchomiony zostanie playbook trzeba ustawić trzy zmienne środowiskowe:

- PROXMOX_API_USER
- PROXMOX_API_PASS
- PROXMOX_API_HOST
- ANSIBLE_SSH_KEY_PUB

Najprostszym sposobem aby je ustawiać jest stworzenie pliku `.env` o takiej zawartości

```bash
export PROXMOX_API_USER="login@pam"
export PROXMOX_API_PASS="Password"
export PROXMOX_API_HOST="1.2.3.4"
export ANSIBLE_SSH_KEY_PUB="ssh-rsa AAAAB3Nzaxxxxxxxx"
```

Możemy również wczytać te zmienne bezpośrednio z hashicorp vault

::: important
Ten sposób wymaga [zainstalowania](https://developer.hashicorp.com/vault/tutorials/get-started/install-binary) klienta `vault`.
:::

```bash
# Proxmox API Configuration for Ansible
export PROXMOX_API_HOST=$(vault kv get -field=PROXMOX_API_HOST kv/platforms/proxmox)
export PROXMOX_API_USER=$(vault kv get -field=PROXMOX_API_USER kv/platforms/proxmox)
export PROXMOX_API_PASS=$(vault kv get -field=PROXMOX_API_PASS kv/platforms/proxmox)
export ANSIBLE_SSH_KEY_PUB=$(vault kv get -field=PROXMOX_API_PASS kv/ssh_keys/ansible)
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

## CI/CD Pipeline

W repozytorium skonfigurowany jest pipeline, wdrażający template'y na serwerach proxmox. Aby mógł on poprawnie wykonać zadanie, musimy mieć uruchomiony Gitlab Runner, który będzie podłączony do instancji gitlaba.

### Zmienne środowiskowe

Pipeline jest zintegrowany z Vault. Do jego prawidłowego wykonania potrzebne są odpowiednie zmienne środowiskowe.

::: important Zmienne środowiskowe
Zmienne muszą zostać ustawione na poziomie grupy Homelab a nie pojedynczego repozytorium
:::

![Dodawanie zmiennych środowiskowych w Gitlabie](/assets/image/add_vars.png)

| Key             | Typ      | Environments | Value                                                       |
| --------------- | -------- | ------------ | ----------------------------------------------------------- |
| VAULT_ADDR      | Variable | All          | Adres lokalnej instancji Vault                              |
| VAULT_AUTH_ROLE | Variable | All          | Rola w vault, która ma uprawnienia do odczytywania secretów |

### Wdrażanie zmian

Zaleca się wprowadzanie zmian z użyciem branchy. Pozwala to przeprowadzić code review w celu uniknięcia potencjalnych błędów.

![Infografika CICD pipeline](/assets/image/vmtemplates-cicd.png)

### Pipeline

Pipeline reaguje na dwa zdarzenia:

- merge request
- ustawienie taga
- manual action

#### Fazy wykonywania:

| Faza       | Warunki                                           | Opis                                                                                              |
| ---------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| initialize | merge request<br>merge do main<br>ustawienie taga | Przygotowanie środowiska do uruchomienia ansible: instalacja klucza ssh, przygotowanie artefaktów |
| check      | merge request<br>merge do main<br>ustawienie taga | check konfiguracji: `ansible-playbook -i hosts deploy-vm-templates.yaml --diff --check`           |
| build      | merge (push) do main i wykonanie manual action    | wykonanie wdrożenia: `ansible-playbook -i hosts deploy-vm-templates.yaml`                         |
