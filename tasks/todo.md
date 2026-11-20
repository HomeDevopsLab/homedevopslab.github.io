# Redesign strony głównej (makieta; motyw IT — „kosmiczny” = efektowny)

Makieta: https://claude.ai/artifact/QRXUSMiWBuFpux1Z2B6ShG (artboard Main)

## Plan
- [x] Własny layout `SpaceHome` (Vue) oparty o `MainLayout` z vuepress-theme-hope — navbar, wyszukiwarka, przełącznik języka i motywu zostają z motywu
- [x] Treść strony głównej we frontmatterze `README.md` (PL) i `en/README.md` (EN) — `layout: SpaceHome`
- [x] Sekcje: hero z orbitami i planetą, Kamienie milowe (oś czasu), Baza Wiedzy (karty), 4 sekcje tematyczne (statystyki / listy), stopka-terminal
- [x] Animacje: scroll-driven (progress bar, planeta, reveal) z fallbackiem i `prefers-reduced-motion`
- [x] Tryb jasny i ciemny (tokeny CSS)
- [x] Nowe logo (SVG + PNG + favicon), nowa ilustracja „Kamienie milowe”
- [x] Usunięcie starych nadpisań `.vp-highlight` z `config.scss`
- [x] Weryfikacja: `docs:build` + zrzuty ekranu 390 / 768 / 1440 px, PL i EN, jasny i ciemny

## Review (2026-11-11)
- `docs:build` OK, brak błędów w konsoli przeglądarki
- Zrzuty: 1440 (PL, ciemny), 1440 (EN, jasny), 768, 390, reduced-motion, animacje scroll, strona /proxmox/ (stopka z sidebarem)
- Poza zakresem: ikona Talos w navbarze jest biała (`cdn.simpleicons.org/talos/fff`) i niewidoczna w trybie jasnym — było tak wcześniej
