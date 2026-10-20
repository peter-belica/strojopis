# Plán vydania projektu Strojopis

Stav k **19. októbru 2026**, časové pásmo Europe/Prague. Koordinátor: **Codex**. Vlastník produktu: **Peter**.

Projekt je dostupný na [verejnej adrese](https://peter-belica.github.io/strojopis/). Najbližší cieľ je dostať na túto adresu aktuálne úpravy klávesníc, rúk a tréningu a potvrdiť ich funkčnosť po nasadení. Samotná dostupnosť staršej stránky tento cieľ nespĺňa.

## Princíp riadenia

Každá úloha má vlastníka, stav a overiteľnú podmienku dokončenia. **Hotovo** znamená, že existuje dôkaz. **Otvorené** znamená, že práca alebo kontrola chýba. **Čaká** znamená závislosť od uvedenej úlohy. Zlyhaná kontrola vráti príslušnú úlohu do otvoreného stavu.

Codex pri pokračovaní práce aktualizuje túto tabuľku a výsledky kontrol. Peter poskytuje spätnú väzbu k používaniu a skúšku fyzického vstupu, ktorú automatizácia nedokáže nahradiť. Termín vydania sa určí po uzavretí otvorených kontrol pred vydaním. Automatické kontroly projektu bežia pri zmenách na GitHube; samostatný pravidelný dohľad týmto plánom nie je nastavený.

## Rozsah najbližšieho vydania

- Existujúci GitHub Pages hosting a adresa `/strojopis/`.
- Počítač s fyzickou klávesnicou; čitateľné rozhranie aj na menšej obrazovke.
- Slovenské rozhranie, český a britský anglický kurz, štyri úrovne tréningu.
- Samostatné nastavenie jazyka klávesnice, systému a fyzického modelu; aktuálne vedenie rúk.
- Miestne profily, voliteľné zapamätanie, zachovanie progresu a vymazanie údajov.

Vlastná doména, nový slovenský kurz, účty, synchronizácia medzi zariadeniami, analytika a dotyková výučba zostávajú mimo tohto vydania. Ich pridanie sa posúdi samostatne, aby neodsúvalo dokončenie existujúceho produktu.

## Riadiaca tabuľka úloh

Identifikátor `ON` označuje úlohy vydania online. Poradie zohľadňuje závislosti, nie iba číselný zoznam.

| Úloha | Vlastník | Stav | Podmienka dokončenia a dôkaz |
| --- | --- | --- | --- |
| **ON-01 Zistiť stav verejného webu** | Codex | Hotovo | Verejná stránka odpovedá úspešne a otvorí tréning. Overené 19. 10.; posledné úspešné publikovanie je zo 16. 10., commit `57069b8`. |
| **ON-02 Ohraničiť vydanie** | Codex | Hotovo | Rozsah a odložené možnosti sú uvedené vyššie; nevzniká závislosť od nového hostingu alebo služby. |
| **ON-03 Overiť funkcie a produkčné zostavenie** | Codex | Hotovo pre kontrolované zdroje | Typy, 107 testov pravidiel, 4 testy reportu, obsah, zostavenie a 57 kontrol v troch prehliadačoch prešli. Výsledky a identita zostavenia sú nižšie. Zmena aplikačných zdrojov vyžaduje zodpovedajúce nové overenie. |
| **ON-04 Overiť licencie distribúcie** | Codex | Hotovo pre kontrolované zdroje | `npm run validate:licenses` prešiel: 84 záznamov závislostí a Fullik 1.3.3, pôvod, kontrolné súčty a oznámenia. Produkčné zostavenie obsahuje `THIRD_PARTY_NOTICES.txt`. |
| **ON-05 Prijať ovládanie a vedenie prstov** | Peter, vyhodnotenie Codex | Otvorené | Krátky scenár nižšie prejde na skutočnej klávesnici; zaznamená sa systém, rozloženie, prehliadač a výsledok. Chyby, ktoré bránia písaniu alebo ukazujú nesprávny prst v skúšanom postupe, sa vyriešia. |
| **ON-06 Pripraviť konkrétnu verziu vydania** | Codex | Otvorené | Skontrolovať rozdiely a nové súbory, zahrnúť zdroje, mapy, licencie a testy, vytvoriť identifikovaný commit. Overiť čistú inštaláciu z lockfile a kontroly nad týmto commitom. Aktuálne úpravy sú stále necommitnuté. |
| **ON-07 Overiť návrat pri chybe** | Codex | Otvorené | Určiť poslednú funkčnú verziu a lokálne preveriť návrat aj s uloženými dátami formátu 3. Zapísať výsledok a spôsob ochrany progresu. Samotný postup nižšie ešte nie je vykonanou skúškou. |
| **ON-08 Publikovať aktuálne vydanie** | Codex | Čaká na ON-05 až ON-07 | Odoslať pripravenú verziu do `main`; kontrola a publikovanie na GitHube musia skončiť úspešne pre rovnaký commit. Zapísať commit a odkaz na beh. |
| **ON-09 Overiť výsledok na verejnej adrese** | Codex | Čaká na ON-08 | Potvrdiť zhodu verejných súborov s vydaním, oba kurzy, klávesnicové mapy, písanie, dokončenie, obnovenie testovacieho profilu a absenciu chýb konzoly či chýbajúcich súborov. Uložiť výsledok do `DEPLOYMENT.md`. |
| **ON-10 Odovzdať prevádzku** | Codex, vlastník Peter | Čaká na ON-09 | Záznam vydania obsahuje adresu, verziu, hranice overenia, otvorené drobnosti a postup obnovy. Dohodnúť spôsob hlásenia chýb a ďalšiu kontrolu; prípadné pravidelné sledovanie má mať výslovne určený interval. |

**Najbližšia technická úloha: ON-06.** Skúška ON-05 môže prebiehať súbežne s prípravou vydania a overením návratu ON-07. ON-08 sa uzavrie až po dokončení týchto krokov; ON-09 overuje už skutočne nasadený výsledok.

## Krátka používateľská skúška pred vydaním

Na lokálnej ukážke aktuálneho produkčného zostavenia:

1. Nastaviť skutočný fyzický model, operačný systém a jazyk klávesnice. Zapísať aj názov prehliadača.
2. Vytvoriť skúšobný profil, začať lekciu a napísať správny aj nesprávny znak. Nesprávny znak neposunie tréning; oprava umožní pokračovať.
3. Vyskúšať dolný a horný rad, medzeru, veľké písmeno a dostupnú kombináciu s diakritikou. Skontrolovať cieľový kláves, prst a vzhľad ruky.
4. Vo voľnom tréningu dokončiť krátke cvičenie, overiť výsledok a pokračovanie. Prepnúť jazyk klávesnice bez straty rozpracovaného textu.
5. Zapnúť zapamätanie, obnoviť stránku a overiť profil aj progres. Vymazanie skúšobného profilu musí vyžadovať potvrdenie.

Záznam ON-05: **zatiaľ nevykonané**. Automatické testy a údaje výrobcov pokrývajú mapy; nepreukazujú fyzické stláčanie každej kombinácie macOS/Windows a národnej klávesnice. Ďalšie fyzické kombinácie sa budú dopĺňať podľa dostupných zariadení.

## Výsledky aktuálnej kontroly

Kontrola prebehla 19. októbra 2026 nad pracovnými zdrojmi na vetve `main`, ktorých posledný commit bol `d41164b`. Na začiatku bolo 23 zmenených sledovaných súborov a 35 nových nesledovaných súborov; tento počet nezahŕňa neskôr doplnený plán. Samotný commit preto neurčuje testovaný obsah.

| Kontrola | Výsledok |
| --- | --- |
| `npm run typecheck` | Bez diagnostických chýb |
| `npm test` | 107/107, 7 súborov |
| `npm run test:report` | 4/4 |
| `npm run validate:content`, vykonané cez build | 240 viet, po 120 a 16 lekcií pre každý z dvoch kurzov |
| `npm run validate:licenses`, vykonané cez build | 84 záznamov závislostí a Fullik 1.3.3, úspech |
| `npm run build` | Úspech; kurzy, klávesnicové mapy a licenčné oznámenie sú v `dist/` |
| `npm run test:e2e` | 57/57, Chromium/Firefox/WebKit, 57,4 s, nad čerstvým produkčným zostavením |
| `git diff --check` | Bez problémov s bielymi znakmi |
| Verejná adresa | HTTP 200 cez HTTPS; otvorenie tréningu potvrdené v prehliadači |

Použitý Node.js: **22.16.0**. Prvý pokus o prehliadačové testy zlyhal pri spustení prehliadačov v sandboxe; úspešný úplný beh prebehol po povolení mimo sandboxu. Čistá inštalácia `npm ci` sa pri tejto kontrole neopakovala, patrí do ON-06 a do automatického procesu vydania.

Identita miestneho zostavenia:

- JavaScript: `dist/assets/index-Dp7PBv9X.js`.
- SHA-256 súboru: `4365ee70a7e95224cfe3d68481ee652eba7bfe8b05a15d58866b445a9cf84c04`.
- Súhrnný odtlačok 61 zdrojových a kontrolných súborov: `c4d8aff5d9bd6d2a02f2b2cfb0acd0e5131e2bf4e58819e7971b3bccd33b9663`.

Súhrnný odtlačok vznikol z abecedne zoradených existujúcich súborov v `assets/`, `content/`, `scripts/`, `tests/`, `.github/` a súborov `index.html`, `package.json`, `package-lock.json`, `vite.config.js`, `playwright.config.js`, `tsconfig.json`, `THIRD_PARTY_NOTICES.txt`. Pre každý súbor sa do SHA-256 pridala jeho relatívna UTF-8 cesta, nulový bajt a binárny SHA-256 obsahu. Dokumentačné zmeny tento odtlačok nemenia.

Verejný web pri kontrole používal `index-hdeREean.js` a `index-D3gg1AHj.css`; miestne zostavenie používa `index-Dp7PBv9X.js` a `index-CtGE1xyA.css`. Posledný [úspešný beh publikovania](https://github.com/peter-belica/strojopis/actions/runs/38856678711) patrí commitu `57069b80c9c48042cf52f4917e522386974cc4f2` zo 16. októbra. **Aktuálne miestne úpravy teda ešte nie sú verejným vydaním.**

## Postup pri chybe po vydaní

1. Zapísať chybu, ovplyvnený používateľský postup a identifikátor nasadenej verzie. Zlyhaná dostupnosť, nemožnosť písania alebo strata progresu majú prednosť pred vizuálnymi drobnosťami.
2. Ak zlyhá overenie pred publikovaním, nové vydanie sa podľa existujúceho procesu nepublikuje. Skontrolovať, či verejná stránka naďalej zodpovedá poslednému úspešnému vydaniu.
3. Ak chyba vznikne až po publikovaní, pripraviť opravu alebo nový commit vracajúci dotknutú zmenu. Pred odoslaním preveriť uložené dáta a zopakovať relevantné kontroly. Potom použiť rovnaký proces publikovania a verejné overenie ON-09.
4. Pri návrate pred zavedenie dátového formátu 3 nepredpokladať, že stará aplikácia sprístupní nový progres. Pred vydaním preveriť konkrétnu starú verziu s testovacími dátami formátu 3; dáta nemažúce náhradné správanie ani zachovanie výsledkov zatiaľ nie sú týmto plánom potvrdené.

Podrobnosti hostingu: [DEPLOYMENT.md](DEPLOYMENT.md). Historické overenia: [VALIDATION.md](VALIDATION.md). Pôvod klávesnicových máp: [KEYBOARD_PROFILES.md](KEYBOARD_PROFILES.md). Licencie: [DEPENDENCIES.md](DEPENDENCIES.md).

## Význam skratiek

- **E2E** — end-to-end, kontrola celého používateľského postupu v prehliadači.
- **CI/CD** — continuous integration / continuous delivery, automatická kontrola zmien a doručovanie overenej verzie; tu cez GitHub Actions.
- **HTTP 200** — úspešná odpoveď webového servera. **HTTPS** — webové spojenie so šifrovaním.
- **SHA-256** — kontrolný odtlačok obsahu, ktorým rozlišujeme konkrétne súbory alebo zostavenia.
- **npm** — správca balíčkov pre Node.js; `npm ci` inštaluje presné závislosti podľa `package-lock.json`.
- **Commit** — pomenovateľný uložený stav zmien v Gite. **Build** — zostavenie zdrojov na statické súbory pre návštevníkov.
