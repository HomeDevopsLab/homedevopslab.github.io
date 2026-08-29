# Changelog

## [5.0.0] - 2026-08-29

### Added

- Security: new top-level section documenting how the homelab protects its data — VM snapshot backups on the Proxmox cluster and database backups following the 3-2-1 strategy, with schedules and monitoring, published in both Polish and English.

## [4.1.0] - 2026-08-14

### Added

- Kubernetes: new article describing the cluster upgrade procedure — sequential, node-by-node update of control-plane and worker nodes with ETCD snapshot and drain/uncordon steps, published in both Polish and English.

## [4.0.2] - 2026-08-09

### Changed

- Gitlab: opis wdrożenia zaktualizowany do aktualnego stanu środowiska — konfiguracja kontenera dla pracy za reverse proxy, montowanie katalogów z NFS, nowy port ssh oraz nazwa tokena registry w Vault (PL/EN).
- Kubernetes: tabela rozmieszczenia nodów uzupełniona o nowy worker na hoście hp2 (PL/EN).

### Removed

- Gitops: repozytorium `grafana-alerts-remediate` wycofane z ekosystemu — usunięty opis, zaktualizowany graf architektury i sekcja na stronie głównej (PL/EN).
- Gitlab: usunięte nieaktualne fragmenty — listing konfiguracji registry oraz osobna sekcja o nginx, której ustawienia trafiły do konfiguracji kontenera (PL/EN).

## [4.0.0] - 2026-07-09

### Added

- Gitops: new top-level section documenting the homelab's repository ecosystem and the Gitlab CI/CD platform, published in both Polish and English.

### Fixed

- Kubernetes (EN): corrected article ordering in the sidebar so the English section matches the Polish one.

## [3.6.1] - 2026-06-27

### Fixed

- Homepage: fixed horizontal overflow of the "Wirtualizacja & High Availability" section on laptop screens by introducing a responsive breakpoint (≥1400px) for the full-width layout and reducing fixed dimensions for smaller viewports.

## [3.6.0] - 2026-06-27

### Added

- SOPS (EN): full English translation of the SOPS article.

### Changed

- SOPS (PL): style fixes — typos (`żadnuch` → `żadnych`, `pasującą co wzorca` → `pasującą do wzorca`), consistent use of `szyfrowanie` instead of `enkrypcja`, capitalisation of proper nouns (Kubernetes), correct Polish genitive `klastra` instead of `clustra`.

## [3.5.0] - 2026-06-22

### Added

- Let's Encrypt (EN): full English translation of the Let's Encrypt article.

### Changed

- Let's Encrypt (PL): style fixes — typos, consistent use of `cert-manager` name, capitalisation of proper nouns (Kubernetes, Traefik, Flux, DNS, IP), impersonal form throughout, duplicate section title resolved, punctuation.

## [3.4.0] - 2026-06-22

### Added

- FluxCD (EN): full English translation of the FluxCD article.

### Changed

- FluxCD (PL): style fixes — typos, consistent capitalisation of proper nouns, punctuation, impersonal form throughout.

## [3.3.0] - 2026-06-20

### Added

- HelmChart (EN): pełne tłumaczenie artykułu na język angielski.

### Changed

- HelmChart (PL): poprawki literówek, korekty stylistyczne (forma bezosobowa, wielkie litery nazw własnych, interpunkcja).

## [3.2.0] - 2026-06-15

### Added

- Kube-VIP article covering floating IP setup via kube-vip (Polish and English).

## [2.7.0] - 2024-10-15

### Added

- Let's Encrypt documentation

## [2.6.0] - 2024-09-22

### Added

- FluxCD documentation
- SOPS documentation
