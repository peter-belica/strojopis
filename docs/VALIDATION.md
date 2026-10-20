# Overenie výsledku – 15. októbra 2026

Lokálna definícia dokončenia z `AUTONOMOUS_DEVELOPMENT.md` je splnená. Overenie sa týka aktuálnych zdrojov a produkčných statických súborov `dist/`. Verejný hosting spravovaný súbežnou prácou má samostatný záznam v `DEPLOYMENT.md`; tento dokument nepotvrdzuje jeho stav.

## Prostredie a príkazy

- macOS 26, Apple Silicon, **Node.js v22.16.0**, npm 10.9.2, Python 3.
- Vite 8.3.4, TypeScript 7.0.2, Vitest 5.0.4, Playwright 1.64.1; presné verzie sú v lockfile.
- Referenčná binárka Node.js je `/usr/local/bin/node`. Cesta Homebrew `node@24` na tomto stroji v skutočnosti smerovala na 25.2.1, preto bola verzia overená priamo a finálne kontroly použili podporovanú 22.16.0.

| Kontrola | Výsledok |
| --- | --- |
| `npm ci` v čistom dočasnom priečinku bez `node_modules` | Úspech, 41 nainštalovaných balíčkov, audit 42 balíčkov, 0 známych zraniteľností v čase kontroly |
| `npm run typecheck` | Úspech, bez diagnostických chýb |
| `npm test` | **45 / 45 testov**, 3 súbory |
| `npm run validate:content` | **240 viet**, 120 na jazyk, po 30 na každú úroveň, bez chýb |
| `npm run build` | Úspech; HTML, CSS, JavaScript, lokálna SVG ikona a úplný adresár `content/` |
| `npm run test:e2e` | **33 / 33 testov**, 11 postupov × 3 prehliadače, 25,2 sekundy |
| `git diff --check` | Bez problémov s bielymi znakmi |

Čistá inštalácia bola overená v `/private/tmp/strojopis-clean.Dy9fYm` skopírovaním zdrojov a konfiguračných súborov bez existujúcich závislostí alebo buildu. Po `npm ci` tam opäť prešli typová kontrola, všetkých 45 testov, validácia obsahu a produkčné zostavenie. Testy prehliadačov bežali nad aktuálnym `dist/` hlavného projektu cez obyčajný Python statický server na porte 4174. Vývojový server sa na E2E nepoužíva.

Produkčný JavaScript: `dist/assets/index-hdeREean.js`, 37,07 kB (12,14 kB gzip). Jeho SHA-256, kontrolný odtlačok súboru, je:

```text
42bf3ecba8c7900d1dca45709c0108124e0bd55fed972dfc13598cf640014727
```

Prvé inštalačné a prehliadačové pokusy zablokoval sandbox. Po povolení prístupu k npm a spustenia lokálnych testovacích prehliadačov prebehli finálne kontroly úspešne. Tieto obmedzenia prostredia neboli obídené zmenou testovaných podmienok.

## Pravidlá, údaje a obsah

`tests/storage.test.js` overuje predvolené používanie bez zápisu, výslovné zapamätanie, obnovu nastavení, poškodený JSON, neplatnú štruktúru a identifikátory, rozsahy hodnôt, duplicity profilov, metriky, podporovaný formát 1 a ochranu novšej verzie. Pokrýva nedostupné čítanie, vyčerpanú kapacitu, neoverený zápis, migráciu oboch historických cookie formátov, zachovanie cookies pri zlyhaní aj obnovenie zápisu po vedomom vymazaní chráneného záznamu. Mazanie jedného profilu, všetkých vlastných kľúčov a vypnutie zapamätania zachováva cudzie údaje.

`tests/training.test.js` overuje chybu bez posunu, správny posun, konzistentnú presnosť, dokončenie presne raz, nový beh, prázdnu lekciu a aktívny čas bez prestávok. Výsledný zložený znak rozhoduje nezávisle od fyzického kódu. Pomocné udalosti, modifikátory a skratky sa nepočítajú. Progres profilov a kurzov zostáva izolovaný, najlepší výsledok má definované poradie a história sa pri 105 výsledkoch obmedzí na posledných 100 pri zachovaní agregovaných súhrnov.

`tests/content.test.js` a `scripts/validate-content.js` kontrolujú identifikátory, jazyk, úroveň, neprázdny normalizovaný text, duplicity, témy, interpunkciu a stanovené rozsahy slov. Každý postupný kurz bol overený na všetkých úrovniach vrátane veľkých písmen, medzery a interpunkcie. Pri chýbajúcej vhodnej vete sa použije pomenované cvičenie klávesov alebo slov. Voľný tréning umožňuje všetky úrovne a pri viacerých kandidátoch sa neopakuje posledná veta.

Všetkých 240 pôvodných viet bolo pri implementácii jazykovo prečítaných: prirodzené vety, bežné detské témy na prvých úrovniach, neutrálne vysvetlenia a spolupráca na vyšších úrovniach. Britské texty používajú napríklad `Mum`, `coloured`, `centre`, `favourite` a `neighbours`. Nejde o nezávislú odbornú jazykovú certifikáciu.

## Prehliadače a celé používateľské postupy

Finálny beh používal:

- Chromium 156.0.8078.4, Playwright build 1248;
- Firefox 157.0, build 1555;
- WebKit 27.2, build 2370.

Vo všetkých troch prehliadačoch prešlo rovnakých 11 postupov:

1. Vytvorenie Anny a Borisa; rozdielna klávesnica, náročnosť a vedenie prstov; dokončenie lekcie; prepnutie jazykov; reload a obnovenie správneho profilu, nastavení, poslednej lekcie a progresu každého kurzu.
2. Oba jazyky a všetky štyri úrovne vo voľnom tréningu. Zmena posuvníka zachová rozpracovaný text aj pozíciu; vedomý reštart použije vybranú úroveň.
3. Nesprávny a správny znak, modifikátory, skratka prehliadača a oddelenie písania do prezývky či ovládania posuvníka. Potvrdené skladanie `a` + akút do `á`, vrátane následného duplicitného `input`, sa započíta raz.
4. Staré platné cookies sa neprenesú pred voľbou zapamätania; po overenom prenose sa odstránia a údaje prežijú reload. Nové profily nevytvárajú cookies.
5. Zlyhanie migračného zápisu ponechá cookies, zobrazí pravdivú správu a dovolí dokončiť tréning v pamäti.
6. Nedostupný `localStorage` nebráni vytvoreniu dočasného profilu a dokončeniu lekcie; po reloade sa údaje nepredstierajú ako uložené.
7. Potvrdenie aj zrušenie mazania, odstránenie jedného profilu a všetkých vlastných údajov bez zásahu do cudzieho kľúča.
8. Produkčné súbory bez cudzích požiadaviek; šírky 390, 768 a 1366 pixelov bez vodorovného pretekania stránky, načítanie českého JSON a dokončenie vety.
9. Poškodený aj novší neznámy formát zostanú nezmenené, zatiaľ čo dočasný profil môže trénovať.
10. Výsledok ponúkne opakovanie a pokračovanie; nevzniknú dokončenia samotným otvorením lekcie. Nová karta obnoví vybranú lekciu aj agregovaný progres.
11. Klávesnicový postup cez výbery, posuvník, otvorenie profilu a jeho vytvorenie, viditeľný obrys zamerania a rešpektovanie obmedzených animácií. WebKit na macOS používa Option+Tab; natívny výber lekcie je v headless teste ovládaný vyhľadaním písmenom `v`.

Žiadny testovaný hlavný postup nemal neošetrenú JavaScript chybu. Sieťový a responzívny test navyše overil prázdny zoznam chýb konzoly a odpovedí HTTP 400+. Automatické snímky všetkých deviatich kombinácií prehliadača a šírky zostávajú v `test-results/`; vybrané kontrolované snímky sú zachované v repozitári:

- [Desktop, Chromium 1366 px](screenshots/desktop.png)
- [Tablet, Firefox 768 px](screenshots/tablet.png)
- [Mobil, WebKit 390 px](screenshots/mobile.png)

## Lokálna ukážka a rozsah ručného overenia

Aktuálny `dist/` bol otvorený aj v Codex prehliadači na `http://127.0.0.1:4173/`. Natívnym ovládaním sa overil výber druhej lekcie šípkami a potvrdením. Vstup `a`, chybné `x`, následne správne `s` skončil na pozícii 3, s jednou chybou a presnosťou 67 %. Konzola bola bez chýb a varovaní. Ukážka bola vrátená na začiatok a zostala pripravená na skúšanie; pôvodný auditovací server na porte 8000 sa zastavil.

Toto je natívne ovládanie v dostupnom prehliadači, nie ručné overenie každej kombinácie fyzickej klávesnice a operačného systému. Zložené české znaky a poradie udalostí IME (input method editor, systém skladania znakov) pokrýva automatizovaný test. Úplná matica fyzických českých, britských a ďalších klávesníc nebola dostupná a jej správnosť sa z týchto testov nevyvodzuje. Chýbajúce fyzické mapovania majú vysvetlenie bez zavádzajúceho prsta.

## Údaje, sieť a obmedzenia

- Pred prvým uložením je zobrazený účel zapamätania aj možnosť pokračovať bez neho. V rozhraní sú informácie o rozsahu údajov, vymazaní a dostupnosti ďalším používateľom toho istého profilu prehliadača.
- Požiadavky na cudzie domény boli počas sieťového testu blokované; aplikácia žiadnu nevytvorila a zostala plne použiteľná. Statický server musí bežať aj bez internetu. Inštalovateľná aplikácia po vypnutí servera nie je v rozsahu.
- Audit sa týka miestneho pôvodu. Cookies, požiadavky, prevádzkové záznamy a právne posúdenie verejného hostingu patria k jeho samostatnému overeniu. Technický princíp účelového lokálneho ukladania a podklady EDPB sú v `ARCHITECTURE.md`.
- Progres sa neprenáša medzi zariadeniami ani pôvodmi. Viac súčasne editujúcich kariet nemá automatické zlučovanie; posledný zápis môže nahradiť starší stav.
- Hlavné použitie je desktop s fyzickou klávesnicou. Malý displej má čitateľné ovládanie a vnútorný posuv klávesnice; samostatná dotyková výučba nie je súčasťou tejto verzie.

Žiadna povinná podmienka lokálneho zadania nezostala nesplnená. Uvedené hranice overenia sa neprezentujú ako potvrdenie nezmeraných fyzických rozložení alebo verejného hostingu.


## Aktualizácia – 19. októbra 2026

Nové zdroje boli zostavené cez Vite a testované nad aktuálnym dist:

| Kontrola | Výsledok |
| --- | --- |
| npm test | 100/100, 7 súborov |
| npm run typecheck | Bez diagnostických chýb |
| npm run validate:content | 240 viet, 16 lekcií v každom z dvoch kurzov |
| npm run build | Úspech, lokálne zdroje a všetkých 10 systémových profilov |
| npm run test:report | 4/4 testy časových hraníc, duplicít, resetu a nedostupných počítadiel |
| npm run test:e2e | 57/57, 19 postupov × Chromium/Firefox/WebKit; posledný beh 45,8 s |
| git diff --check | Bez problémov |

Testy navyše pokrývajú presný počet rôznych viet, bezpečné náhradné cvičenia, dokončenie až po celej dávke, migráciu schémy 3, nezávislé mapovanie bez resetu textu, všetkých 20 kombinácií systém/jazyk/geometria, tvar Enteru, existenciu klávesov a dosah končekov prstov. Klávesnica a ruky zdieľajú súradnice aj pri 390/1366 px; celé rozhranie sa overilo aj pri 768 px. Systémové obmedzenie pohybu, Shift/Option aj klávesnicové ovládanie prešli vo všetkých troch prehliadačoch. E2E znamená end-to-end, kontrolu celého používateľského postupu.

Prvý pokus o spustenie testovacích prehliadačov zamietol sandbox; finálne behy boli povolené mimo neho. Dve chyby automatizácie sa opravili: fyzický KeyL pri držanom Shifte namiesto požiadavky na doslovné malé l a poradie Tabu podľa presunutých ovládacích prvkov. Ich 6 kontrol následne prešlo a po finálnom zostavení prešlo všetkých 57.

Hranice: syntetické udalosti a natívne textové vloženie v testoch nie sú fyzickým overením národného vstupu. Apple mapy sa overili natívnym prekladom; Windows mapy tabuľkami výrobcu. Fyzické testy všetkých klávesníc a systémov sa netvrdia. Podrobné zdroje sú v KEYBOARD_PROFILES.md. Spotreba modelov je zaznamenaná v agent-usage.csv s metodikou AGENT_USAGE.md; záznam koordinátora sa končí pred záverečnou odpoveďou.

Vizuálna úprava rúk podľa používateľovej predlohy: po poslednej zmene prešlo 8/8 testov `hand-guide`, typová kontrola, validácia obsahu, produkčné zostavenie a 15/15 kontrol `keyboard.spec.js` (19,7 s) v Chromium/Firefox/WebKit. Tieto kontroly opätovne overili pohyb na stredy klávesov pri šírkach 390/1366 px, základnú polohu, obmedzenie pohybu a súčasné modifikátory. Vzhľad siluet a vytratenie zápästí sa ručne overili v lokálnom náhľade na porte 4185; dôkaz je `screenshots/hand-reference-update.png`.

Následná oprava proporcií používa Fullik a pevné články v troch rozmeroch. Prešlo 107/107 jednotkových testov, typová kontrola, validácia obsahu a licencií, produkčné zostavenie a celý beh 57/57 prehliadačových kontrol (1,2 minúty). Po spresnení interpolácie otáčania dlane prešlo ďalších 15/15 prehliadačových kontrol rúk (42,7 sekundy). Posledný mäkký prechod pri nasadení palca je výhradne vizuálny; po jeho pridaní znovu prešla typová kontrola a build, vzhľad overený v náhľade.

Nové invarianty kontrolujú dĺžku každého článku v troch rozmeroch, odchýlku končeka od kontaktu pod 0,002 klávesovej jednotky, polohu nad klávesnicou, odlíšené proporcie prstov, posun dlane pri vzdialenom dosahu a zachovanie šírky dlane počas otáčania. Rozsah: všetky podporované fyzické klávesy na štyroch hardvérových modeloch a kombinácie až piatich kontaktov. Testy sú rozdelené podľa hardvéru, aby ich súhrnný čas pri súčasnom behu prehliadačov nespôsoboval falošný časový limit. Kontakty širokých klávesov sa kontrolujú vo vnútri klávesu, bežné písmená zostávajú presne v strede. Overuje sa skutočný koncový bod vypočítaného článku, nie iba požadovaný cieľ.

Licenčná kontrola overila 84 záznamov v package-lock.json (MIT/Apache-2.0/MPL-2.0/ISC/BSD-3-Clause) a Fullik 1.3.3 (MIT), kontrolné súčty prevzatých súborov a úplné oznámenie v produkčnom zostavení. Metodika a povinnosti sú v DEPENDENCIES.md. Snímka `screenshots/anatomical-hands-w.png` zachytáva dosah na W, pri ktorom bolo naťahovanie pôvodného modelu výrazné.
