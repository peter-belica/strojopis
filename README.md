# Strojopis · Prst po prste

**[Spustiť aplikáciu v prehliadači →](https://peter-belica.github.io/strojopis/)**

[![Build a publikovanie](https://github.com/peter-belica/strojopis/actions/workflows/pages.yml/badge.svg)](https://github.com/peter-belica/strojopis/actions/workflows/pages.yml) · [Hotový build v repozitári](https://github.com/peter-belica/strojopis/tree/gh-pages) · [Publikovanie a princíp zostavenia](docs/DEPLOYMENT.md)

[Riadenie vydania: úlohy, zodpovednosti a výsledky kontrol](docs/ONLINE_PLAN.md). Verejná verzia a aktuálne miestne úpravy majú oddelený stav; dokončenie vydania potvrdzuje až kontrola na verejnej adrese.

Lokálna aplikácia na precvičovanie písania s animovanými polopriehľadnými rukami nad klávesnicou. Hlavná plocha obsahuje trojriadkové okno prepisovaného textu a klávesnicu; nastavenia, pokyny a výsledky sú vľavo. Rozhranie je slovenské. Český a britský anglický kurz majú po 16 postupných lekciách a voľný tréning. Úrovne 1, 2, 3 a 4 obsahujú 3, 6, 9 a 12 rôznych viet v cvičení zo zásoby 240 viet. Okno zobrazuje tri riadky znakov a priebežne sa posúva za aktuálnym znakom.

Fyzická klávesnica je nezávislá od jazyka textu aj systémového mapovania. Referencia je MacBook Air M3 ISO s vysokým Enterom; dostupné sú aj ANSI a Dell XPS 2018. Slovenčina, čeština, španielčina zo Španielska, US a britské rozloženie majú samostatné profily pre macOS a Windows, vrátane kombinácií a mŕtvych klávesov. [Pôvod máp a hranice overenia](docs/KEYBOARD_PROFILES.md).

Aplikácia nepotrebuje backend, účet ani platenú službu. Všetky zdroje vrátane textov a ikon sa podávajú lokálne. Internet je potrebný na inštaláciu vývojových nástrojov; pri tréningu stačí bežiaci statický server.

## Prostredie a inštalácia

Použi Node.js **24 LTS** (dlhodobo podporovanú vetvu) s npm. Podporované sú tiež Node.js 22.12+ v rámci vetvy 22 a verzie 26+. Node.js 25 nie je podporovaný všetkými testovacími závislosťami. Testy používajú aj **Python 3** ako jednoduchý statický server.

```bash
npm ci
npx playwright install chromium firefox webkit
npm run dev
```

Otvor adresu vypísanú serverom, zvyčajne [http://127.0.0.1:5173](http://127.0.0.1:5173). `npm ci` nainštaluje presné verzie z `package-lock.json`. Na Linuxe môže prvá príprava prehliadačov vyžadovať `npx playwright install --with-deps`.

## Kontroly a statické zostavenie

```bash
npm run typecheck
npm test
npm run validate:content
npm run build
npm run test:e2e
npm run test:report
```

E2E (end-to-end, celý používateľský postup) spúšťa Chromium, Firefox a WebKit nad **produkčným `dist/`**, nie vývojovým serverom. Pred E2E preto vždy zostav aktuálny kód. Testovací port 4174 musí byť voľný. Výsledky sú v `playwright-report/`, snímky responzivity v `test-results/`.

Produkčnú ukážku spustíš:

```bash
npm run preview -- --port 4173
```

Otvor [http://127.0.0.1:4173](http://127.0.0.1:4173). Hosting potrebuje iba obsah `dist/`, vrátane `dist/content/`. Relatívne cesty umožňujú aj umiestnenie pod `/strojopis/`. Otvorenie `index.html` cez `file://` nie je podporované, pretože texty sa načítavajú cez `fetch`.

## Krátke predvedenie

1. Otvor **Tvoj profil**, zadaj prezývku a vytvor profil. Bez ďalšej voľby zostávajú údaje iba v otvorenej stránke.
2. Ak chceš pokračovať aj po zatvorení, vyber **Zapamätať tréning**. Vysvetlenie účelu je zobrazené pred prvým uložením.
3. Vyber kurz a **Voľný tréning viet**. Posuvníkom si vyskúšaj všetky štyri úrovne. **Odznova** použije novú úroveň; rozpracovaný text sa pri samotnom posune nemení.
4. Klikni na okno prepisovaného textu a píš. Chyba nechá kurzor na rovnakom znaku. Po poslednom znaku celej dávky viet sa vľavo zobrazí výsledok a voľby opakovať alebo pokračovať.
5. Vyber inú lekciu, prepni jazyk a vráť sa späť. Každý kurz si drží vlastné miesto. Pri zapamätaní sa po opätovnom otvorení obnoví profil aj progres.
6. Vytvor druhý profil a zvoľ mu inú náročnosť, klávesnicu a vedenie prstov. Prepnutie profilov obnoví ich vlastné nastavenia.

Klávesnica sa prispôsobuje šírke panela. Hlavné použitie je počítač s fyzickou klávesnicou. Pri chýbajúcom overenom mapovaní znaku aplikácia vysvetlí obmedzenie pomôcky. Zmena jazyka klávesnice, systému alebo fyzického modelu zachová rozpracovaný text aj jeho pozíciu.

## Práca agentov a spotreba

[CSV report po úlohách agentov](docs/agent-usage.csv) obsahuje model, skutočnú úroveň uvažovania, stav, čas a zaznamenané počítadlá tokenov. [Metodika merania](docs/AGENT_USAGE.md) vysvetľuje čiastočné snímky a nedostupné údaje. Obnovenie z lokálnych záznamov tohto chatu: `npm run report:agents`. Report neexportuje text konverzácií.

## Knižnice a licencie

Kĺbový model rúk používa Fullik 1.3.3 s bezplatnou licenciou MIT povoľujúcou komerčné použitie. Články prstov sa nepredlžujú; ohýbajú sa v priestore a dosah dopĺňa pohyb dlane. [Zdroje a licencie všetkých závislostí](docs/DEPENDENCIES.md) zahŕňajú aj kontrolu pri zostavení: `npm run validate:licenses`. Autorské oznámenia sa dodávajú v `THIRD_PARTY_NOTICES.txt` aj v produkčnom zostavení.

## Údaje a metriky

Zapamätanie používa `localStorage` iba v tomto prehliadači. Ukladá prezývku, nastavenia, poslednú lekciu v každom kurze, súhrny výsledkov a najviac 100 posledných výsledkov na profil. Profily nemajú prihlasovanie ani synchronizáciu. Vlastné údaje môžeš vymazať v rozhraní; mazanie vyžaduje potvrdenie. Pri chybe úložiska tréning funguje v pamäti a oznam vysvetlí, že nové zmeny sa nezachovajú.

Presnosť = správne znaky / všetky pokusy × 100, zaokrúhlená na celé percentá. Čas začína prvým pokusom; prestávky pri strate zamerania alebo skrytí stránky sa nepočítajú. Rýchlomer ukazuje správne znaky za minútu z posledných piatich sekúnd; prvá sekunda slúži na rozbehnutie merania. Po dvoch sekundách bez správneho znaku sa panáčik zastaví. Jeho chôdza, beh a šprint reagujú na aktuálne tempo. Priemer za celú lekciu zostáva zobrazený aj vo výsledku a vypočíta sa zo správnych znakov a aktívneho času. Pri systémovom obmedzení pohybu sa animácia vypne, číselná rýchlosť zostáva dostupná.

Podrobnosti: [architektúra](docs/ARCHITECTURE.md), [plán](docs/IMPLEMENTATION_PLAN.md), [história práce](docs/PROGRESS.md), [výsledky overenia](docs/VALIDATION.md), [úplné zadanie](docs/AUTONOMOUS_DEVELOPMENT.md).
