---
title: Docker services
index: false
icon: fa-brands fa-docker
category:
  - Guide
---
## Logi konternerów
Wszystkie usługi pracujące w kontenerach mają skonfigurowe rotowanie logów

```yaml
log_driver: json-file
log_options:
  max-size: "10m"
  max-file: "3"
```
Plik nie logu kontenera nie może przekraczać 10MB oraz nie przechowujemy więcej niż trzech plików z logami. Logi, które wykraczają poza te parametry są usuwane

<Catalog />