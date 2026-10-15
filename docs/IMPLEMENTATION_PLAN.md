# Implementačný plán

Platný rozsah určuje `AUTONOMOUS_DEVELOPMENT.md`. Starší plán s cookies, CDN a pevným americkým rozložením bol nahradený 15. októbra 2026. CDN znamená sieť na podávanie cudzích zdrojov; výsledná aplikácia ju nepotrebuje.

| Míľnik | Výstup | Overiteľná podmienka |
| --- | --- | --- |
| 1. Audit a plán | Zachovaný checkout, zaznamenaný východiskový stav a pôvodný postup | `INITIAL_STATE.md`, otvorenie pôvodnej aplikácie a kontrola konzoly |
| 2. Spoľahlivé základy | npm a lockfile, Vite, kontrola JavaScriptu cez TypeScript, lokálne zdroje, verzované úložisko | Typová kontrola, testy poškodených údajov, budúcej verzie, migrácie a zlyhania zápisu |
| 3. Obsah a ovládanie | 240 viet, štyri úrovne, voľný tréning, nezávislé zavádzanie znakov | `validate:content`, testy výberu podľa jazyka, úrovne a presných povolených znakov |
| 4. Dokončený tréning | Koniec presne raz, metriky, výsledky, pokračovanie podľa profilu a kurzu | Testy pravidiel a obnovenia po opätovnom otvorení stránky |
| 5. Overenie a odovzdanie | Produkčné statické súbory, lokálna ukážka, pravdivá dokumentácia | Všetkých päť kontrolných príkazov, tri prehliadače, šírky 390/768/1366 a výsledky v `VALIDATION.md` |

Princíp: najprv ohraničiť dátové a tréningové pravidlá, potom ich prepojiť s existujúcim rozhraním. Chybové stavy úložiska sa testujú injektovanými adaptérmi; hlavný používateľský postup sa overuje skutočným prehliadačom. E2E znamená end-to-end, overenie celého postupu od ovládania až po obnovu uložených údajov.

Každý míľnik má záznam v `PROGRESS.md`. Historické checkpointy zostávajú históriou a nepredstavujú aktuálne požiadavky. Dokončenie celého cieľa je dovolené až po splnení všetkých povinných položiek zadania.

## Rozhodnutia

- Zachovať HTML, CSS a moduly JavaScriptu; prepis do frameworku by nepriniesol primeraný úžitok.
- Vite rieši server počas vývoja a zostavenie; v produkcii stačí statické podávanie súborov.
- `checkJs` s JSDoc kontroluje existujúci JavaScript postupne. Zapnutá je kontrola možného `null`; úplný režim `strict` zatiaľ nie je cieľom tejto migrácie. JSDoc sú typové komentáre čitateľné aj bez prekladača.
- Bez závislostí počas behu aplikácie. TypeScript, Vitest, Playwright a Vite sú iba vývojové nástroje.
- Náročnosť viet je obsahová voľba bez zberu veku. Naučené znaky sa kontrolujú samostatne, vrátane medzery, veľkosti písmen a interpunkcie.
- Skoré lekcie používajú klávesové skupiny alebo skutočné slová; zmysluplné vety sú dostupné ihneď vo voľnom tréningu.

## Ďalšie možnosti mimo prvej verzie

- Export a import miestneho progresu, riešenie súbežného používania viacerých kariet.
- Ručné overenie ďalších fyzických rozložení a systémových vstupných metód.
- Nové kurzy, vlastné texty a podrobnejší prehľad histórie.
- Dotyková výučba alebo inštalovateľný režim bez bežiaceho servera.

Verejný hosting a jeho prevádzkové kontroly sú oddelené od tejto lokálnej implementácie; tento plán sám publikovanie nevykonáva.
