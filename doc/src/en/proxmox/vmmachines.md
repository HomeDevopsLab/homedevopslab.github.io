---
title: VM Machines
icon: computer
order: 2
category:
  - Guide
tag:
  - proxmox
---

Configuration and addition of VMs is done using the `angrybits-homelab` repository. VM configuration is contained within the `vms` directory. Its current structure looks as follows:

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

## VM Groups

Virtual machines are divided into groups, which determine the initial configuration they are created with. Currently, these groups are:

- dockerhosts
- kubernetes
- storagehosts
- vanilla

::: info Groups
All groups except `vanilla` have code that runs the appropriate ansible playbook responsible for preparing the configuration. When adding a new functional group, remember to provide a playbook in `modules/ansible`. The ansible code file should have a specific name: `bootstrap-group_name.yaml` (e.g., bootstrap-kubernetes.yaml)
:::

### Dockerhosts

VMs belonging to this group have the docker service installed along with a configuration that allows connecting from systems on the local network. This specific configuration was created to enable centralized management of docker containers using IaC code.

### Kubernetes

In this group, the following packages are installed: `resolvconf` and `nfs-common`. Additionally, overwriting of `/etc/resolv.conf` is disabled to force the system to use internal DNS servers. The `nfs-common` package allows pods in the kubernetes cluster to mount shared storage.

### Storagehosts

Storagehosts installs and configures the NFS service. The only share configured is `/storage`, which is shared for every host on the network.

### Vanilla

The vanilla group provides the system in the default configuration found in official cloud-init images. The only customization here is the configuration of the administrative account (access to it via ssh keys) and the installation of `qemu-guest-agent`. This is a good group for VMs for various test applications where we need to provide the configuration ourselves.

## Creating a VM

To create a VM and assign it to the appropriate group, simply create the appropriate entry in the file: `/vms/vms.hcl`.

### vms.hcl file structure

```mermaid
graph TD
  %% Style definitions (colors)
  classDef dockerStyle fill:#e1f5fe,stroke:#01579b,stroke-width:2px;
  classDef k8sStyle fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px;
  classDef defaultStyle fill:#f5f5f5,stroke:#666666,stroke-width:1px;

  %% Root node
  Root[locals]
  class Root defaultStyle;

  %% Main groups
  DH[dockerhosts]
  SH[storagehosts]
  VN[vanilla]
  KB[kubernetes]

  %% Connections from root
  Root --> DH
  Root --> SH
  Root --> VN
  Root --> KB

  %% Docker branch (Blue)
  DH --> D1[vm-docker1]
  DH --> D2[vm-docker2]
  class DH,D1,D2 dockerStyle;

  %% Storage branch (Gray/Standard)
  SH --> S1[vm-storage1]
  class SH,S1 defaultStyle;

  %% Vanilla branch (Gray/Standard)
  VN --> V1[vm-vanilla1]
  class VN,V1 defaultStyle;

  %% Kubernetes branch (Green)
  KB --> K1[vm-k8s1]
  KB --> K2[vm-k8s2]
  class KB,K1,K2 k8sStyle;
```

### VM definition

The virtual machine definition must be placed in the appropriate group in `locals`. If you want to add another vm with docker installed, you create code in the `dockerhosts` group

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

::: tip IP Address
Before adding a new vm, make sure that the IP address you want to use has not been assigned or reserved for another service. You can do this using netbox.
:::
::: important cloud-init
Setting the correct `cloudinit` is necessary so that the initial VM configuration corresponds to the template from which it was created. If we don't do this here, the vm will be created with the default `userdata.yaml`, which is not 100% compatible with the configuration for the distribution we are installing.
:::

| Option        | Variants                                      | Description                                                                                                   |
| ------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| node          | [hp1, hp2, proxmox]                           | name of the proxmox cluster node on which the vm is to be run                                                |
| network       | -                                             | Network configuration, here we mainly define the VM's IP address                                           |
| template_name | [debian-13-amd64, ubuntu-2404-amd64]          | name of the template from which the vm is to be installed                                                      |
| cloudinit     | [userdata-debian.yaml, userdata-ubuntu.yaml]  | definition of cloud-init instructions with which the vm is to be launched.                                     |
| disk          | [storage = ceph-storage, storage = local-lvm] | The option is used to allocate disk space and determine on which storage this disk is to be created |
| cpu           | -                                             | Number of threads to be assigned to the vm                                                                    |
| memory        | -                                             | amount of memory in MB                                                                                        |

### Default options

Common options for all VMs are defined in `locals/common`.

| Option  | Description                                                                       |
| ------- | --------------------------------------------------------------------------------- |
| network | Network parameters such as: gateway, nameserver, and network mask (prefix) |
| onboot  | Whether the VM should start with the proxmox node. Default: `true`             |

## Deploying changes

Deployment can be performed manually or (recommended) using ci/cd.

### Deployment with CI/CD

The change should be prepared on a dedicated branch and published in the repository. We make a merge request based on the branch. The merge request triggers a pipeline that executes `terragrunt plan` in the appropriate directory. After verifying the plan, we perform a merge, which triggers the plan again, and the pipeline waits for manual action: apply, which executes `terragrunt apply`.

### Manual deployment

::: info Requirements
Installed tools: terragrunt, terraform, ansible, python
:::

#### Installing tools

Installing IaC tools on Debian: terragrunt, terraform, ansible.

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

#### Preparing the account

Ansible SSH key

::: info Vault
The SSH key for ansible is located in the vault at the path: `kv/ssh_keys/ansible/ANSIBLE_SSH_KEY_PRIV`
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

SSH client configuration

```bash title="~/.ssh/confg"
Host gitlab.domena.pl
  HostName gitlab.domena.pl
  Port 2223
  IdentityFile ~/.ssh/id_rsa
```

Environment variables

| Variable            | Description                                                    |
| ------------------- | -------------------------------------------------------------- |
| PM_API_TOKEN_ID     | Proxmox API Token ID                                           |
| PM_API_TOKEN_SECRET | Token secret                                                   |
| PM_API_URL          | Proxmox api url: https://proxmox-server-address:8006/api2/json |
| GITLAB_USERNAME     | Account in gitlab                                              |
| GITLAB_PAT          | Personal Access Token for account in gitlab                    |

Exporting required variables

```bash
export PM_API_TOKEN_ID="<PROXMOX_USER>"
export PM_API_TOKEN_SECRET="<PROXMOX_PASSWORD>"
export PM_API_URL="https://<PROXMOX_HOST>:8006/api2/json"
export GITLAB_USERNAME="<GITLAB_USERNAME>"
export GITLAB_PAT="<GITLAB_PERSONAL_ACCESS_TOKEN>"
```

#### Running the deployment

After making the desired change in `vms.hcl`, you need to perform the following steps. The example below shows adding a VM to the `dockerhosts` group.

```bash title="Preparing the plan"
cd amgrybits-homelab
mkdir tgplans
cd vms/dockerhosts
terragrunt plan -out=plan.out -no-color > plan.log
terragrunt show -json plan.out > ../../tgplans/$(basename $dir)_plan.json
```

::: tip Deployment plan
Before running the deployment, we can display it with the command: `terragrunt plan`.
:::

Executing the deployment

```bash
terragrunt plan
terragrunt apply
```

::: warning Ansible
After executing `apply`, there might be a problem with running the playbook.

```bash :no-line-numbers
E: Could not get lock /var/lib/dpkg/lock-frontend. It is held by process 2711 (apt-get)
```

In such a case, you have to wait a few minutes and try again.
:::

After the deployment is finished, the vm is ready to work and has the necessary software installed.
