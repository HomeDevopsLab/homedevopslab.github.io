---
title: Odtwarzanie
icon: rotate-left
order: 2
category:
  - Guide
tag:
  - backup
---

## Odtwarzanie maszyny wirtualnej

Aby odtworzyć maszynę wirtualną, należy zalogować się na jeden z serwerów Proxmox, wybrać magazyn danych **vm-backups** (`1`), a następnie plik backupu do odtworzenia (`2`). Operację zatwierdzamy, klikając **Restore** (`3`).

![Backup list](/assets/image/backup-restore-1.png)

Po kliknięciu **Restore** otworzy się okno, w którym można skonfigurować maszynę wirtualną, zanim zostanie odtworzona. Dzięki temu możemy odtworzyć maszynę z backupu obok działającej instancji produkcyjnej.

### Parametry odtwarzania

::: important
Opcja `Start after restore` musi pozostać niezaznaczona.
:::

![Restore options](/assets/image/backup-restore-2.png)

::: tip Test odtwarzania backupu
| Parametr | Wymagalność | Zalecenia |
| -------- | ----------- | --------- |
| Storage  | <Badge text="Opcjonalny" type="tip" /> | Domyślnie wybrana jest przestrzeń dyskowa przypisana do źródłowej maszyny wirtualnej. |
| VM       | <Badge text="Wymagany" type="danger" /> | Jeśli chcemy odtworzyć maszynę obok działającej (np. testując backup), trzeba wybrać nieużywany VMID. |
| Unique   | <Badge text="Wymagany" type="danger" /> | Zaznaczamy, aby wygenerować unikalny adres MAC. |
| Name     | <Badge text="Zalecany" type="warning" /> | Warto nadać maszynie nową nazwę, aby uniknąć pomyłki. |
:::

### Weryfikacja backupu

Przed uruchomieniem odtworzonej maszyny wirtualnej należy zmienić jej adres IP w ustawieniach **Cloud-Init**. Jest to krok konieczny, aby podczas testowania backupu uniknąć konfliktu adresów IP z działającą instancją. Można też wybrać opcję DHCP, dzięki której nowa maszyna automatycznie otrzyma adres IP.

![Cloud-Init change IP Address](/assets/image/backup-restore-3.png)

Po uruchomieniu odtworzona maszyna wirtualna jest gotowa do dalszej pracy.
