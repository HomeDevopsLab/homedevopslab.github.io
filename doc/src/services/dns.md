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

## Architektura

![Architektura lokalnego DNS](/assets/image/dns-arch.svg)

## Konfiguracja

Konfiguracja usługi DNS znajduje się w repozytorium: homelab-services. Aby wprowadzić zmiany należy zmodyfikować plik `group_vars/group_dns`.

### Opcje ogólne

| Zmienna | Opis |
| --------| -----|
| bind_image | Wskazanie na obraz dockera wraz z jego wersją po dwukropku |
| bind_volume | Ścieżka do katalogu, który będzie podmontowany w kontenerze |
| timezone | Strefa czasowa ustawiona w kontenerze |
| serial | Serial ustawiany we wszystkich strefach DNS |

Taka konfiguracja kontenera pozwala przechowywać dane na wypadek jego restartu. Dane są przechowywane w ścieżke wskazanej w konfigu.

### Domeny publiczne
Niektóre usługi uruchomione w ramach środowiska HomeLAB jest dostępnych publicznie. Ze względu na problemy sieciowe związane z NAT utrzymuję w ramach serwera DNS lokalne wersje domen publicznych. Różnią się one tym, że wybrane subdomeny (lub wildcardy) wskazują na lokalne adresy IP klastra kubernetes.

::: important Let's encrypt
Przed wykonaniem wdrożenia aplikacji korzystającej z SSL należy koniecznie utworzyć lokalny wpis w DNS. Nie dotyczy to subdomen, które łapią się w wildcard *.lab.angrybits.pl
:::

Do konfiguracji domen zewnętrznych służy opcja: `extzones`. Zawiera ona listę domen, które z kolei zawierają listę subdomen, które mają być dostępne pod lokalnymi adresami IP.

```yaml
extzones:
  domena1.pl: ["www", "ftp", "*.wildcard", "subdomena"]
  example.com: ["@", "www"]
```