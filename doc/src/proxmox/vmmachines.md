---
title: VM Machines
icon: computer
order: 2
category:
  - Guide
tag:
  - proxmox
---

Konfiguracja, dodawanie maszyn VM odbywa się z użyciem repozytorium angrybits-homelab. Konfiguracja maszyn VM zawiera się w obszarze katalogu: `vms`. Jego obecna struktura wygląda w sposób następujący:

```bash::no-line-numbers title="📁 /vms"
├── 📁 dockerhosts
│   ├── params.hcl
│   └── terragrunt.hcl
├── 📁 kubernetes
│   ├── params.hcl
│   └── terragrunt.hcl
├── 📁 storagehosts
│   ├── params.hcl
│   └── terragrunt.hcl
├── 📁 vanilla
│   ├── params.hcl
│   └── terragrunt.hcl
└── vms.hcl
```

## Grupy VM

Maszyny wirtualne podzielone są na grupy, które decydują o wstępnej konfiguracji z jaką są tworzone. Obecnie są to grupy:

- dockerhosts
- kubernetes
- storagehosts
- vanilla

::: info Grupy
Wszystkie grupy oprócz `vanilla` mają kod, który uruchamia odpowiedniego playbooka ansible odpowiedzialnego za przygotowanie konfiguracji. Dodając nową grupę funkcjonalną należy pamiętać o zapewnieniu playbooka w `modules/ansible`. Plik z kodem ansible ma mieć określoną nazwę: `bootstrap-nazwa_grupy.yaml` (np. bootstrap-kubernetes.yaml)
:::

### Dockerhosts

Maszyny VM należące do tej grupy mają zainstalowaną usługę docker wraz z konfiguracją, która umożliwia łączenie się z systemów w sieci lokalnej. Ta specyficzna konfiguracja powstała w celu umożliwienia z poziomu kodu IaC scentralizowane zarządzenie kontenerami dockera.

### Kubernetes

W tej grupie instalowane są pakiety: resolvconf oraz nfs-common. Dodatkowo wyłączane jest nadpisywanie `/etc/resolv.conf` aby zmusić system do korzystania z wewnętrznych serwerów DNS. Pakiet nfs-common umożliwia podom w klastrze kubernetes montowanie wspólnego storage.

### Storagehosts

Storagehosts instaluje i konfiguruje usługę NFS. Jedynym udziałem jaki jest konfigurowany jest `/storage`, który jest udostępniany dla każdego hosta w sieci.

### Vanilla

Grupa vanilla dostarcza system w domyślnej konfiguracji, jaka znajduje się w oficjalnych obrazach cloud-init. Jedyną customizacją jest tutaj konfiguracja konta administracyjnego (dostęp do niego za pomocą kluczy ssh) oraz instalacja qemu-guest-agent. Jest to dobra grupa dla maszyn vm dla różnych testowych zastosowań, gdzie mamy potrzebę dostarczenia konfiguracji samodzielnie.

## Utworzenie VM

Aby stworzyć maszynę VM i przypisać ją do odpowiedniej grupy wystarczy utworzyć odpowiedni wpis w pliku: `/vms/vms.hcl`.

### Struktura pliku vms.hcl

```mermaid
graph TD
  %% Definicje stylów (kolorystyka)
  classDef dockerStyle fill:#e1f5fe,stroke:#01579b,stroke-width:2px;
  classDef k8sStyle fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px;
  classDef defaultStyle fill:#f5f5f5,stroke:#666666,stroke-width:1px;

  %% Węzeł główny
  Root[locals]
  class Root defaultStyle;

  %% Grupy główne
  DH[dockerhosts]
  SH[storagehosts]
  VN[vanilla]
  KB[kubernetes]

  %% Połączenia od korzenia
  Root --> DH
  Root --> SH
  Root --> VN
  Root --> KB

  %% Gałąź Docker (Niebieska)
  DH --> D1[vm-docker1]
  DH --> D2[vm-docker2]
  class DH,D1,D2 dockerStyle;

  %% Gałąź Storage (Szara/Standardowa)
  SH --> S1[vm-storage1]
  class SH,S1 defaultStyle;

  %% Gałąź Vanilla (Szara/Standardowa)
  VN --> V1[vm-vanilla1]
  class VN,V1 defaultStyle;

  %% Gałąź Kubernetes (Zielona)
  KB --> K1[vm-k8s1]
  KB --> K2[vm-k8s2]
  class KB,K1,K2 k8sStyle;
```

### Definicja VM

Definicję maszyny wirtualnej trzeba umieścić w odpowiedniej grupie w `locals`. Jeśli chcemy dodać kolejną vm z zainstalowanym dockerem tworzymy kod w grupie `dockerhosts`

```hcl {7,8}
dockerhosts = {
  srv-test = {
    node = "hp1"
    network = merge(local.common.network, {
      ip = "192.168.3.xx/${local.common.network.prefix}"
    })
    template_name = "debian-13-amd64"
    cloudinit = "userdata-debian.yaml"
    disk = {
      size    = "20G"
      storage = "ceph-storage"
    }
    cpu = 2
    memory = {
      size = 4096
    }
  }
}
```

::: tip Adres IP
Przed dodaniem nowej vm trzeba się upewnić, że adres IP, który chcemy użyć nie został przypisany lub zarezerwowany dla innej usługi. Można to zrobić za pomocą netboxa.
:::
::: important cloud-init
ustawienie właściwego `cloudinit` jest konieczne, żeby wstępna konfiguracja VM odpowiadała template'owi z którego została powołana. Jeśli tego nie zrobimy w tym miejscu, to vm stworzy się z domyślnym userdata.yaml, który nie jest w 100% zgodny z konfiguracją dla dystrybucji, którą instalujemy.
:::

| Opcja         | Warianty                                      | Opis                                                                                                           |
| ------------- | --------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| node          | [hp1, hp2, proxmox]                           | nazwa node'a clustra proxmox, na którym ma zostać uruchomiona vm                                               |
| network       | -                                             | Konfiguracja sieci, w tym miejscu definiujemy głównie adres IP maszyny VM                                      |
| template_name | [debian-13-amd64, ubuntu-2404-amd64]          | nazwa template'u z której ma być instalowana vm                                                                |
| cloudinit     | [userdata-debian.yaml, userdata-ubuntu.yaml]  | definicja instrukcji cloud-init, którymi ma zostać uruchomiona vm.                                             |
| disk          | [storage = ceph-storage, storage = local-lvm] | Opcja służy do przydzielenia przestrzeni dyskowej oraz określenia, na którym storage ten dysk ma być utworzony |
| cpu           | -                                             | Liczba wątków, które ma mieć przypisana vm                                                                     |
| memory        | -                                             | ilość pamięci w MB                                                                                             |

### Opcje domyślne

Opcje wspólne dla wszystkich VM zostały zdefiniowane w `locals/common`.

| Opcja   | Opis                                                                      |
| ------- | ------------------------------------------------------------------------- |
| network | Parametry sieci, takie jak: gateway, nameserver oraz maska sieci (prefix) |
| onboot  | Czy VM ma uruchamiać się razem z nodem proxmox. Domyślnie: `true`         |

## Wdrożenie zmian

Wdrożenie można przeprowadzić ręcznie, lub (zalecane) przy użyciu ci/cd.

### Wdrożenie z CI/CD

Zmianę należy przygotować na dedykowanym branchu i opublikować go w repozytorium. Na podstawie brancha robimy merge request. Merge request uruchamia pipeline, który we właściwym katalogu wykonuje `terragrunt plan`. Po weryfikacji planu wykonujemy merge, który ponownie uruchamia plan i pipeline oczekuje na wykonanie manual action: apply, która wykonuje `terragrunt apply`.

### Wdrożenie ręczne

::: info Wymagania
Zainstalowane narzędzia: terragrunt, terraform, ansible, python
:::

#### Instalacja narzędzi

Instalacja na Debianie narzędzi IaC: terragrunt, terraform ansible.

::: code-tabs#shell

@tab terragrunt

```bash
curl -sSfL --proto '=https' --tlsv1.2 https://terragrunt.com/install | bash
echo 'export PATH="/home/cloud-user/.terragrunt/bin:$PATH"' >> /home/${USER}/.bashrc
source /home/cloud-user/.bashrc
```

@tab terraform

```bash
sudo apt-get update && sudo apt-get install -y gnupg software-properties-common
wget -O- https://apt.releases.hashicorp.com/gpg | gpg --dearmor | sudo tee /usr/share/keyrings/hashicorp-archive-keyring.gpg > /dev/null
gpg --no-default-keyring --keyring /usr/share/keyrings/hashicorp-archive-keyring.gpg --fingerprint
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(grep -oP '(?<=UBUNTU_CODENAME=).*' /etc/os-release || lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
sudo apt update
sudo apt-get install terraform
```

@tab ansible

```bash
sudo apt install ansible
```

:::

#### Przygotowanie konta

Klucz ssh ansible

::: info Vault
Klucz SSH dla ansible znajduje się w vault w ścieżce: `kv/ssh_keys/ansible/ANSIBLE_SSH_KEY_PRIV`
:::

```bash
mkdir .ssh
cat << 'EOF' > ~/.ssh/id_rsa
-----BEGIN OPENSSH PRIVATE KEY-----
xxxxxxx
-----END OPENSSH PRIVATE KEY-----
EOF
chmod 700 ~/.ssh
chmod 600 ~/.ssh/id_rsa
```

Konfiguracja klienta ssh

```bash title="~/.ssh/confg"
Host gitlab.domena.pl
  HostName gitlab.domena.pl
  Port 2223
  IdentityFile ~/.ssh/id_rsa
```

Zmienne środowiskowe

| Zmienna             | Opis                                                           |
| ------------------- | -------------------------------------------------------------- |
| PM_API_TOKEN_ID     | Proxmox API Token ID                                           |
| PM_API_TOKEN_SECRET | Secret tokena                                                  |
| PM_API_URL          | Proxmox api url: https://proxmox-server-address:8006/api2/json |
| GITLAB_USERNAME     | Konto w gitlabie                                               |
| GITLAB_PAT          | Personal Access Token do konta w gitlabie                      |

Eksportujemy wymagane zmienne

```bash
export PM_API_TOKEN_ID="<PROXMOX_USER>"
export PM_API_TOKEN_SECRET="<PROXMOX_PASSWORD>"
export PM_API_URL="https://<PROXMOX_HOST>:8006/api2/json"
export GITLAB_USERNAME="<GITLAB_USERNAME>"
export GITLAB_PAT="<GITLAB_PERSONAL_ACCESS_TOKEN>"
```

#### Uruchomienie wdrożenia

Po wprowadzeniu porządanej zmiany w `vms.hcl` trzeba wykonać następujące kroki. Poniższy przykład przedstawia dodanie maszyny VM do grupy `dockerhosts`

```bash title="Przygotowanie planu"
cd amgrybits-homelab
mkdir tgplans
cd vms/dockerhosts
terragrunt plan -out=plan.out -no-color > plan.log
terragrunt show -json plan.out > ../../tgplans/$(basename $dir)_plan.json
```

::: tip Plan wdrożenia
Zanim puścimy wdrożenie możemy go sobie wyświetlić poleceniem: `terragrunt plan`.
:::

Wykonanie wdrożenia

```bash
terragrunt plan
terragrunt apply
```

::: warning Ansible
Po wykonaniu `apply` może wystąpić problem z wykonaniem playbooka.

```bash :no-line-numbers
E: Could not get lock /var/lib/dpkg/lock-frontend. It is held by process 2711 (apt-get)
```

W takim przypadku trzeba poczekać kilka minut i spróbować ponownie.
:::

Po zakończeniu wdrożenia vm jest gotowa do pracy i ma zainstalowane potrzebne oprogramowanie.
