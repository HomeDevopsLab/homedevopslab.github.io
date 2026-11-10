---
title: Restore
icon: rotate-left
order: 1
category:
  - Guide
tag:
  - backup
---

## Restore VM

W celu odtworzenia maszyny wirtualnej trzeba zalogować się na jeden z serwerów proxmox i wybrać magazyn danych (`1`): **vm-backups** oraz plik do odtworzenia (`2`). Zatwierdzamy klikając: **Restore** (`3`).

![Backup list](/assets/image/backup-restore-1.png)

Po kliknięciu **Restore** Otworzy się okienko, które umożliwia skonfigurowanie maszyny VM, zanim zostanie ona odtworzona. Dzięki temu możemy odtworzyć z backupu maszynę wirtualną obok działającej produkcyjnej instancji.

### Parametry Restore

::: important
`Start after restore` pozostaje nie zaznaczona.
:::

![Restore options](/assets/image/backup-restore-2.png)

::: tip Test odtwarzania backupu
| Parametr | Wymagany | Zalecenia |
| ---------| ---------| ----------|
| Storage  | <Badge text="Opcjonalny" type="tip" />   | Domyślną wartością jest nazwa przestrzeni dyskowej przypisanej do wzorcowej maszyny wirtualnej. |
| VM       | <Badge text="Wymagany" type="danger" /> | Jeśli chcemy odtworzyć maszynę obok działającej (np. testując backup), trzeba wybrać nieużywany VMID |
| Unique   | <Badge text="Wymagany" type="danger" /> | Zaznaczamy aby wygenerować unikalny MAC-adres. |
| Name     | <Badge text="Zalecany" type="warning" />   | Warto dać nową nazwę dla maszyny VM aby uniknąć pomyłki |
:::

### Weryfikacja backupu

Zanim uruchomiona zostanie odtworzona z backupu maszyna wirtualna trzeba zmienić jej adres IP w parametrach **Cloud-Init**. Jest to krok konieczny aby uniknąć konfliktu adresów IP w przypadku testowania backupu. Można też użyć opcji DHCP aby nowa maszyna VM pobrała automatycznie adres IP.

![Cloud-Init change IP Address](/assets/image/backup-restore-3.png)

Uruchomiona maszyna wirtualna jest gotowa do dalszych działań.