# Solar Invest · Casa Verde Baterii 2026

Önálló, kétnyelvű (román/magyar) statikus kampányoldal. Nem igényel adatbázist, PHP-t vagy szerveroldali feldolgozást.

## Felépítés

- `ro/index.html` és `hu/index.html`: azonos szerkezet, csak a szöveg különbözik. Változtatáskor mindkét fájlt frissítsd.
- `assets/css/casa-verde-2026.css`: a két oldal közös stíluslapja.
- `assets/js/casa-verde-2026.js`: pontszámkalkulátor, jogosultsági teszt, visszaszámláló és a solar-flux link. A kalkulátor és a teszt dinamikus üzenetei a fájl elején lévő `STR` szótárban vannak (hu/ro).

## Funkciók be- és kikapcsolása

Minden új funkció a `<body>` elem `data-features` attribútumával kapcsolható, mindkét HTML-fájlban:

```html
<body data-features="countdown eligibility calculator flux">
```

Egy funkció kikapcsolásához töröld a nevét a listából, bekapcsolásához add hozzá. A `flux` konfigurátor mindkét nyelvű oldalon **be van kapcsolva**.

| Kapcsoló | Mit kapcsol |
|---|---|
| `countdown` | Jelentkezési visszaszámláló a hero-ban |
| `eligibility` | Jogosultsági gyorsteszt |
| `calculator` | Pontszámkalkulátor |
| `flux` | „Konfiguráld a rendszert és nézd meg az árakat” gombok és a 3 lépéses leírás. Kikapcsolva a hero-ban és a mobil sávban „Ajánlatot kérek” gomb jelenik meg helyette |

Ha az `eligibility` és a `calculator` is ki van kapcsolva, a „Kalkulátor” szekció és a menüpont is eltűnik. Ha csak az egyik marad, az teljes szélességben jelenik meg.

## solar-flux összekötés

A `data-flux` attribútumú gombok a `https://solarflux.solar-invest.ro/green-house-configurator` címre mutatnak. A JS hozzáfűzi a nyelvet és a forrást (`source=casa-verde-2026`), valamint a kiválasztott akkumulátor modelljét, típusát és demóárát (`battery_model`, `battery_type`, `battery_price_demo`), a kapacitást (`battery_kwh`), az önerőt (`own_contribution`), a becsült finanszírozást (`financing_amount`) és a pontszámot (`estimated_score`). A „Vezi oferta” / „Ajánlat megtekintése” gombok az ajánlatok szekcióhoz görgetnek. Ha a `flux` funkció ki van kapcsolva, a `data-fallback="flux"` gomb e-mailes ajánlatkérést biztosít helyette.

## Visszaszámláló dátumai

A `.countdown` elem `data-start` és `data-end` attribútuma (romániai idő, +02:00). A szöveges dátumsort (`.countdown-range`) külön kell frissíteni. A határidő lejárta után a visszaszámláló magától eltűnik.

## cPanel feltöltés

Töltsd fel a teljes `casa-verde-2026` mappát a `public_html` könyvtárba, a mappaszerkezet megtartásával. Az oldal a `/casa-verde-2026/` címen érhető el, alapértelmezetten románul nyílik meg, a RO/HU váltó a fejlécben van.

A régi `/casa-verde-2027/` címet a `static-site/.htaccess` átirányítja az új mappára.

## Tartalom frissítése

A program adatai (támogatás, pontozás, dokumentumok) az AFM finanszírozási útmutatójából származnak (Ordin MMAP 1.904/2026, módosítva az Ordin MMAP 2.314/2026-tal, Monitorul Oficial 953/2026.11.16.).

A kalkulátor képlete (19. cikk, a 2.314/2026-os módosítás szerint), max. 100 pont:
- kapacitás: `min(40, 4 × kWh − 20)`, 10 kWh = 20 pont, 15 kWh-tól 40 pont;
- önerő: `max(10, min(35, 37,5 × önerő ÷ AFM-támogatás − 2,5))`, 25% önerőnél 10 pont, ha az önerő ≥ AFM-támogatás, 35 pont;
- korábbi közpénzes tárolótámogatás nélkül 25 pont, különben 0 (a korábbi támogatás nem kizáró ok).

A támogatás legfeljebb 15 000 lej és a projekt teljes értékének 75%-a, az 1 500 lej/kWh feletti rész és a hibrid inverter az önerőt növeli (5. és 6. cikk). Holtverseny esetén: önerő, tárolókapacitás, korábbi tárolós támogatás, végül a jelentkezés dátuma és időpontja.

Megjegyzés: az önerő-képletet a módosító rendeletet idéző források alapján vettük át; az AFM 2026.11.17-i közleménye (10 pont 5 000 lej, 35 pont 15 000 lej önerőnél 15 000 lej támogatás mellett) ezzel egyezik. A rendelet PDF-jével még egyeztetni kell.
