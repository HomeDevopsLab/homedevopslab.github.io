---
title: Pipeline schedules
icon: clock
order: 2
category:
  - Guide
tag:
  - cicd
---
Funkcjonalność pipeline schedules pozwala uruchamiać zadania zdefiniowane w potoku CI/CD według harmonogramu. Dzięki niej regularnie aktualizuję systemy maszyn wirtualnych oraz przeprowadzam przeglądy infrastruktury.

Repozytorium **angrybits-homelab** zostało wzbogacone o dodatkową konfigurację:

* `.gitlab/mcp/alerts_ack-mcp.json.tpl`: konfiguracja serwera MCP dla Grafany.
* `.gitlab/mcp/firewall-mcp.json.tpl`: konfiguracja serwera MCP dla Cloudflare GraphQL API.
* `.gitlab/prompts`: katalog z plikami promptów. Ich nazwy są przekazywane jako zmienne do zadań w harmonogramie.
* `.opencode/opencode.json`: konfiguracja OpenCode. Zawiera listę dostępnych modeli, połączenie z lokalnym LLM oraz definicję uprawnień.

## Zdefiniowane zadania

| Nazwa harmonogramu     | Harmonogram | Repozytorium      | Zmienne |
| ---------------------- | ----------- | ----------------- | ------- |
| System upgrades        | 7 7 * * 6   | homelab-tasks     | Brak    |
| Grafana Storage Alerts | 00 20 * * * | angrybits-homelab | MODEL=vllm/Qwen3.8-27B-UD-Q4_K_M<br>PROMPT_FILE=grafana-storage-alerts.md |
| IP Blacklist update    | 00 7 * * *  | angrybits-homelab | MODEL=claude-opus-5<br>PROMPT_FILE=cloudflare-review.md |

## System upgrades

Zadanie uruchamiane jest w każdą sobotę o godzinie 7:07 i aktualizuje systemy na maszynach wirtualnych. Na końcu każdego przebiegu na kanał techniczny komunikatora wysyłany jest raport z informacją, które hosty zostały zaktualizowane, które nie wymagały aktualizacji, a które wymagają restartu.

![Powiadomienie z zadania System upgrades =500x](/assets/image/system-upgrades.png)

## Grafana Storage Alerts

Zadanie wykorzystuje OpenCode z lokalnym LLM oraz serwer MCP dla Grafany. Wykonywany jest skill **pause-and-resume-alerts**, który opisuje proces odczytu aktualnej zajętości dysków serwerów oraz zasady aktualizacji kodu konfiguracji alertów. Celem zadania jest wstrzymywanie alertów po przekroczeniu progu 80% zajętości oraz wznawianie ich, gdy ilość wolnego miejsca ponownie wzrośnie.

![Diagram procesu Grafana Alerts Remediation](/assets/image/grafana-alerts-remediation.png)

### Parametry

W definicji zadania można wybrać model LLM oraz wskazać nazwę pliku z promptem do wykonania.

### Wynik

* Modyfikacja pliku `apps/grafana/alerts/hosts.hcl`.
* Przygotowanie merge requesta.

## IP Blacklist update

Zadanie korzysta z narzędzia Claude Code oraz modelu Claude Opus 5. Do realizacji używany jest skill **cloudflare-ip-threat-mitigate**, który opisuje proces analizy logów Cloudflare. Analiza obejmuje dwa zbiory danych:

* `httpRequestsAdaptiveGroups` w oknie 7-dniowym,
* `firewallEventsAdaptive` w oknie 24-godzinnym.

![Proces aktualizacji IP Blacklist](/assets/image/ip-blacklist-update.png)

Wynikiem analizy jest aktualizacja czarnej listy adresów IP w Cloudflare oraz na moim lokalnym routerze.

### Parametry

W definicji zadania można wybrać model LLM oraz wskazać nazwę pliku z promptem do wykonania.

### Wynik

* Modyfikacja plików:
  * `apps/cloudflare/security/ip-blacklist.hcl`
  * `apps/mikrotik/firewall/ip-blacklist.hcl`
* Przygotowanie merge requesta.
