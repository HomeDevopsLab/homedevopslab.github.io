# Ilustracje sekcji

Jak powstają grafiki sekcji na stronie głównej (`homelab-security.jpg`,
`gitops-ecosystem.jpg`) i towarzyszące im tła. Trzymaj się tego przepisu, żeby
kolejne ilustracje wyglądały jak rodzeństwo już istniejących, a nie jak zbiór
przypadkowych obrazków.

## 1. Ilustracja główna

Generowana przez serwer MCP `nano-banana` (Gemini):

| parametr | wartość |
| --- | --- |
| `aspectRatio` | `16:9` |
| `resolution` | `2K` |
| `thinking` | `high` |
| `returnInlineImage` | `false` |

### Kanon wizualny

Te elementy powtarzaj w każdym promptcie — one budują spójność:

- izometryczna infografika techniczna, tło ciemny granat `#0a1420`
- akcenty w cyjanie i elektrycznym błękicie, świecące neonowo
- subtelna siatka heksagonalna w tle
- low-poly ikony 3D stojące na cienkich, świecących heksagonalnych podestach
- łączące je linie przepływu danych z drobnymi wędrującymi cząstkami światła
- kinowe światło, ostre wektorowe krawędzie, szeroka kompozycja 16:9
   z dużą ilością pustej ciemnej przestrzeni

### Etykiety

Model potrafi przekręcić dłuższy tekst. Wypisz w promptcie **dokładnie** te
kilka krótkich etykiet, które mają się pojawić (np. `PROXMOX`, `NAS / NFS`,
`AWS S3`, `GRAFANA`), i zamknij prompt zdaniem w rodzaju: _Only the short
labels mentioned above, spelled exactly, in a clean sans-serif font. No other
text, no paragraphs, no watermark, no logos._ Po wygenerowaniu **przeczytaj
obrazek** i sprawdź pisownię — poprawka to ponowna generacja, nie retusz.

Referencyjny prompt, który dał `homelab-security.jpg`, znajdziesz w historii
commita dodającego ten plik.

## 2. Usunięcie watermarku Gemini

```bash
npx -y -p @pilio/gemini-watermark-remover -p sharp \
  gwr remove <plik-wejsciowy> --output <plik-wyjsciowy>
```

Skill `gemini-watermark-remover` woła CLI `gwr`, którego nie ma w PATH — stąd
wywołanie przez `npx` z jawnie dociągniętym `sharp` (bez niego CLI kończy się
błędem `Image codec is unavailable`).

## 3. Optymalizacja

Zasada doboru szerokości: **około 2× największego rozmiaru renderowania**.
Obrazy sekcji strony głównej wyświetlają się do `50rem` (800 px), więc 2000 px;
obrazy w artykułach siedzą w kolumnie ~740 px, więc 1500 px wystarcza.

```js
import sharp from 'sharp';

await sharp(input)
  .resize({ width: 2000, withoutEnlargement: true })
  .jpeg({ quality: 82, progressive: true, mozjpeg: true, chromaSubsampling: '4:2:0' })
  .toFile(output);
```

Dla grafik płaskich z przezroczystością (logo, diagramy) zamiast JPEG-a:

```js
.png({ palette: true, compressionLevel: 9, effort: 10 })
```

Zanim podmienisz plik, porównaj rozmiar przed i po. Dobrze skompresowane
zdjęcie potrafi po ponownym zakodowaniu **urosnąć** — wtedy zostaw oryginał
(tak jest z `k3s.jpg`).

## 4. Tła sekcji

Każda sekcja `highlights/highlights` potrzebuje pary teł SVG: `<nazwa>-bg.svg`
(dark) i `<nazwa>-bg-light.svg` (light). Kanwa `1440x560`,
`preserveAspectRatio="none"`.

Paleta — trzymaj się rodziny, w której są `gitops-bg` i `security-bg`:

| rola | dark | light |
| --- | --- | --- |
| tło | `#0e2a47` | `rgba(254, 254, 255, 1)` |
| linie | `#132e65` | `rgba(149, 156, 169, 1)` |
| akcent | `#356cb1` | `#7c93e8` |
| punkty | `#8b9ad9` | `#c3cefa` |
| poświata (środek) | `#1735b3` | `rgba(135, 156, 245, 1)` |

Wariant light wymaga znacznie niższego kontrastu niż dark — siatka
heksagonalna przy `rgba(149, 156, 169, 0.13)` i łuki przy `stroke-opacity 0.3`,
inaczej tło zaczyna walczyć o uwagę z treścią. W sekcji obowiązuje
`filter: brightness(0.5) contrast(0.8)`, co dodatkowo przyciemnia oba warianty.

## 5. Podpięcie sekcji

1. Wpis `highlights` w `doc/src/README.md` **i** `doc/src/en/README.md`
   (uwaga: pliki różnią się wcięciem listy — dopasuj się do sąsiadów).
2. W `doc/src/.vuepress/styles/config.scss`:
   - dopisz sekcję do właściwej grupy Z-pattern (`row` / `row-reverse`) —
     układ jest przypisywany jawnie przez `:has(img[src*="..."])`, bo sekcja
     „Baza Wiedzy" zajmuje własny slot w DOM i psuje parzystość `nth-child`,
   - skopiuj blok boksów z sekcji GitOps i zmień kolor akcentu,
   - dodaj kolor przycisku `.vp-section-cta`.
3. Nagłówek i opis wymagają jawnego `color` z `text-shadow` — domyślny kolor
   tekstu motywu nie przechodzi WCAG na tłach sekcji.
