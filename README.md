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

A program adatai (támogatás, pontozás, dokumentumok) az AFM finanszírozási útmutatójából származnak. A kalkulátor képlete a hatályos 1.904/2026-os miniszteri rendelet (Ordin) 19. cikkét követi, a rendelet szövegével (PDF) egyeztetve: önerő pontja = 30 × (önerő ÷ AFM-támogatás lejben), max. 50; kapacitás = kWh × 2,5, max. 50 (20 kWh felett); a támogatás legfeljebb 15 000 lej és a projekt teljes értékének 75%-a (az önerő háromszorosa), az 1 500 lej/kWh feletti rész és a hibrid inverter az önerőt növeli (5. és 6. cikk). A képlet a PDF-ben képként szerepel, a szövegkinyerés kihagyja. Holtverseny esetén (19. cikk (9)): az önerő összege, a tárolókapacitás, a jelentkezés dátuma és időpontja.

**Függő módosítás:** a minisztérium 2026. nov. 6-án közvitára bocsátott egy módosítási tervezetet, amely a 19. cikk képletét is megváltoztatná (önerő max. 35 pont: `max(0, önerő − 5000) ÷ 10000 × 25 + 10`; kapacitás max. 40 pont: `4 × kWh − 20`, 15 kWh-nál; új 25 pont, ha nem volt korábbi közpénzes tárolótámogatás; holtversenynél a korábbi támogatás is szempont). Amíg nincs elfogadva, a fenti hatályos képlet él. Ha elfogadják, a JS számítását (`recalc`) és a „Pontozás” szekció szövegét mindkét nyelven át kell írni.
