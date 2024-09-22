---
title: Lokalny DNS
icon: globe
order: 2
category:
  - Guide
tag:
  - docker
---

Lokalna usługa DNS powstała na potrzeby uruchamiania różnych aplikacji działających wyłącznie sieci lokalnej, oraz tych, które są dostępne na zewnątrz. Drugą jej funkcją jest lokalny cache dns dla komputerów i innych urządzeń sieciowych.

DNS uchuchomiony jest na vmce: `srv-dns3` w kontenerze dockera.

| CPU | RAM | Disk | OS                                              |
| --- | --- | ---- | ----------------------------------------------- |
| 1   | 2GB | 20GB | ![ubuntu](/assets/image/ubuntu.png =20x) Ubuntu |

## Architektura

<!--
#TODO: Obrazek architektury jest już nieaktualny
-->

![Architektura lokalnego DNS](/assets/image/dns-arch.svg)

## Konfiguracja

Konfiguracja usługi DNS znajduje się w repozytorium: homelab-services. Aby wprowadzić zmiany należy zmodyfikować plik `group_vars/group_dns`.

### Opcje ogólne

| Zmienna     | Opis                                                        |
| ----------- | ----------------------------------------------------------- |
| bind_image  | Wskazanie na obraz dockera wraz z jego wersją po dwukropku  |
| bind_volume | Ścieżka do katalogu, który będzie podmontowany w kontenerze |
| timezone    | Strefa czasowa ustawiona w kontenerze                       |
| serial      | Serial ustawiany we wszystkich strefach DNS                 |

Taka konfiguracja kontenera pozwala przechowywać dane na wypadek jego restartu. Dane są przechowywane w ścieżke wskazanej w konfigu.

<!--
#TODO: Trzeba zrobić review obecnej konfiguracji group_dns i wprowadzić zmiany. Na pewno trzeba będzie dodać opis konfiguracji domen external z ipkami z cloudflare
-->

### Domeny publiczne

Niektóre usługi uruchomione w ramach środowiska HomeLAB jest dostępnych publicznie. Ze względu na problemy sieciowe związane z NAT utrzymuję w ramach serwera DNS lokalne wersje domen publicznych. Różnią się one tym, że wybrane subdomeny (lub wildcardy) wskazują na lokalne adresy IP klastra kubernetes.

::: important Let's encrypt
Przed wykonaniem wdrożenia aplikacji korzystającej z SSL należy koniecznie utworzyć lokalny wpis w DNS. Nie dotyczy to subdomen, które łapią się w wildcard \*.lab
:::

Do konfiguracji domen zewnętrznych służy opcja: `extzones`. Zawiera ona listę domen, które z kolei zawierają listę subdomen, które mają być dostępne pod lokalnymi adresami IP.

```yaml
extzones:
  domena1.pl: ["www", "ftp", "*.wildcard", "subdomena"]
  example.com: ["@", "www"]
```

### Adresy serwerów

Adresy IP hostów lokalnych konfiguruje się za pomocą opcji `servers`.

```yaml
servers:
  host1: 1.2.3.4
  host2: 1.2.3.5
  host3: 1.2.3.6
```

Na podstawie tej konfiguracji generują się w pisy w strefie lan. Czyli: host1.lan, host2.lan, host3.lan, które wskazują na adresy IP wpisane w konfigu.

### Aplikacje lokalne

Podobnie jak serwery, aplikacje działające lokalnie też mają wpisy w domenie LAN. W odóżnieniu od tych dostępnych z internetu, nie mają uruchomionego SSL.  

Do tworzenia wpisów dla aplikacji lokalnych służy opcja: `internal_apps`

::: tip Kubernetes
Wdrożenie aplikacji lokalnej i wpis w DNS można wykonać w dowolnej kolejności.
:::

```yaml
internal_apps:
  - app1
  - app2
```

Przykładowa konfiguracja wygeneruje wpisy odpowiednio: app1.lan, app2.lan. Adresy IP będą kierować na lokalne adresy IP klastra kubernetes.

## Wdrażanie zmian

Wdrożenie zmian powinno zostać wykonane poprzez złożenie pull requesta z brancha zawierającego zmiany w pliku: **group_vars/group_dns**. Po code review, zmergowaniu kodu oraz dodaniu taga z wersją następuje wdrożenie zmian w kontenerze. Za wdrożenie zmian odpowiedzialny jest pipeline skonfigurowany w repozytorium git.

Kontener z serwerem DNS zostaje zrestartowany po wykryciu zmian w plikach.
