---
title: Pipeline schedules
icon: clock
order: 1
category:
  - Guide
tag:
  - cicd
---
Funckcjonalność pipeline schedules pozwala na uruchamianie cyklicznych zadań zdefiniowanych w potoku CI/CD. Dzięki niej jestem w stanie wykonywać cykliczne aktualizacje systemu maszyn wirtualnych oraz wykonywać przeglądy infrastruktury.

Repozytorium **angrybits-homelab** zostało wzbogacone o dodatkową konfigurację w katalogu: `.gitlab`.

* `.gitlab/mcp/alerts_ack-mcp.json.tpl`: konfiguracja serwera MCP do Grafany
* `.gitlab/mcp/firewall-mcp.json.tpl`: konfiguracja serwera MCP do Cloudflare graphql
* `.gitlab/prompts`: katalog, w ktorym umieszczone są pliki z promptami. Ich nazwy są podawane jako zmienne dla zadań w harmonogramie
* `.opencode/opencode.json`: konfiguracja opencode. Zawiera listę dostępnych modeli, połączenie do lokalnego LLM oraz definicję uprawnień

## Zdefiniowane zadania

| Nazwa harmonogramu | Harmonogram | Repozytorium | Zmienne |
| -------------------| ------------| -------------| --------|
| System upgrades    | 7 7 * * 6   | homelab-tasks | Brak   |
| Grafana Storage Alerts  | 00 20 * * *   | angrybits-homelab | MODEL=vllm/Qwen3.8-27B-UD-Q4_K_M<br>PROMPT_FILE=grafana-storage-alerts.md  |
| IP Blacklist update | 00 7 * * *    | angrybits-homelab | MODEL=claude-opus-5<br>PROMPT_FILE=cloudflare-review.md  |

## System upgrades

Zadanie uruchamiane jest w każdą sobotę o godzinie 7:07. Wykonuje aktualizacje systemów na maszynach wirtualnych. Na końcu każdego przebiegu wysyłany jest raport na kanał techniczny komunikatora. Raport zawiera informacje, które hosty zostały zaktualizowane, które nie wymagały aktualizacji oraz które wymagają restartu.

![Notyfikacja z System upgrades =500x](/assets/image/system-upgrades.png)

## Grafana Storage Alerts

Zadanie wykorzystuje opencode z lokalnym LLM oraz serwer MCP do grafany. Wykonywany jest skill: **pause-and-resume-alerts**. Skill opisuje proces odczytania aktualnych wartości miejsca na dyskach serwerów oraz zasady aktualizacji kodu konfiguracyjnego alertów. Celem zadania jest wstrzymywanie alertów po przekroczeniu progu 80% zajętości oraz wznawianie alertowania jeśli ilość miejsca wzrośnie.

![Grafana Alerts Remediation diagram](/assets/image/grafana-alerts-remediation.png)

### Parametry

W definicji zadania możemy wybrać model LLM oraz wskazać nazwę pliku z promptem do wykonania.

### Wynik

* Modyfikacja pliku: `apps/grafana/alerts/hosts.hcl`
* Przygotowanie merge requesta.

## IP Blacklist update

Zadanie korzysta z narzędzia claude code oraz frontierowego modelu Claude Opus 5. Do realizacji używany jest skill: **cloudflare-ip-threat-mitigate**. Skill opisuje proces analizy logów cloudflare. Skill analizuje dwie grupy danych:

* httpRequestsAdaptiveGroups w oknie 7-dniowym
* firewallEventsAdaptive w oknie 24h.

![IP Blacklist Update Process](/assets/image/ip-blacklist-update.png)


Wynikiem tej analizy jest aktualizacja IP Black Listy na cloudflare oraz na moim loklanym routerze.

### Parametry

W definicji zadania możemy wybrać model LLM oraz wskazać nazwę pliku z promptem do wykonania.

### Wynik

* Modyfikcja plików: 
  * `apps/cloudflare/security/ip-blacklist.hcl`
  * `apps/mikrotik/firewall/ip-blacklist.hcl`
* Przygotowanie merge requesta