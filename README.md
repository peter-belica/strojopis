# Strojopis · Prst po prste

**[Spustiť aplikáciu v prehliadači →](https://peter-belica.github.io/strojopis/)**

[![Build a publikovanie](https://github.com/peter-belica/strojopis/actions/workflows/pages.yml/badge.svg)](https://github.com/peter-belica/strojopis/actions/workflows/pages.yml) · [Hotový build v repozitári](https://github.com/peter-belica/strojopis/tree/gh-pages) · [Publikovanie a princíp zostavenia](docs/DEPLOYMENT.md)

Lokálna aplikácia na precvičovanie písania s mapou klávesnice a prepínateľným vedením prstov. Rozhranie je slovenské. Obsahuje český a britský anglický kurz po 16 postupných lekciách a samostatný voľný tréning. Pre každý jazyk sú pripravené štyri úrovne po 30 pôvodných vetách: spolu 240 viet.

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
4. Píš do poľa pod cvičením alebo mimo ovládacích prvkov. Chyba nechá kurzor na rovnakom znaku. Po poslednom znaku sa zobrazí výsledok a voľby opakovať alebo pokračovať.
5. Vyber inú lekciu, prepni jazyk a vráť sa späť. Každý kurz si drží vlastné miesto. Pri zapamätaní sa po opätovnom otvorení obnoví profil aj progres.
6. Vytvor druhý profil a zvoľ mu inú náročnosť, klávesnicu a vedenie prstov. Prepnutie profilov obnoví ich vlastné nastavenia.

Na malej obrazovke môžeš klávesnicu posúvať vo vnútri jej rámu. Hlavné použitie je počítač s fyzickou klávesnicou. Pri chýbajúcom fyzickom mapovaní zloženého znaku aplikácia vysvetlí obmedzenie pomôcky.

## Údaje a metriky

Zapamätanie používa `localStorage` iba v tomto prehliadači. Ukladá prezývku, nastavenia, poslednú lekciu v každom kurze, súhrny výsledkov a najviac 100 posledných výsledkov na profil. Profily nemajú prihlasovanie ani synchronizáciu. Vlastné údaje môžeš vymazať v rozhraní; mazanie vyžaduje potvrdenie. Pri chybe úložiska tréning funguje v pamäti a oznam vysvetlí, že nové zmeny sa nezachovajú.

Presnosť = správne znaky / všetky pokusy × 100, zaokrúhlená na celé percentá. Čas začína prvým pokusom; prestávky pri strate zamerania alebo skrytí stránky sa nepočítajú. Rýchlosť v slovách za minútu sa nezobrazuje.

Podrobnosti: [architektúra](docs/ARCHITECTURE.md), [plán](docs/IMPLEMENTATION_PLAN.md), [história práce](docs/PROGRESS.md), [výsledky overenia](docs/VALIDATION.md), [úplné zadanie](docs/AUTONOMOUS_DEVELOPMENT.md).
