# Architektúra

## Princíp a technológie

Strojopis je klientská aplikácia v HTML (štruktúra stránky), CSS (štýly) a moduloch JavaScriptu. Vite pripravuje vývojový server a produkčné statické súbory. V produkcii nebeží aplikačný server, iba podávanie súborov. Nie sú tu bežné runtime závislosti, externé fonty, skripty, obrázky ani generovanie textov na diaľku.

Existujúci vizuálny smer a moduly klávesnice zostali zachované. React ani ďalší framework by tu nevyvážil cenu prepisu. TypeScript kontroluje JavaScript cez `checkJs` a typové komentáre JSDoc; `types.d.ts` pomenúva dátové rozhrania. Kontrola `null` je zapnutá, úplný prísny režim sa zavádza postupne. TypeScript nemení formát uložených údajov ani nevaliduje JSON počas behu; na to slúži samostatný validátor.

Vite 8.3.4, Vitest 5.0.4, TypeScript 7.0.2 a Playwright 1.64.1 boli zvolené ako aktuálne stabilné vydania v npm pri implementácii 15. októbra 2026. Presné tranzitívne závislosti obsahuje `package-lock.json`. Podporu prostredia určujú aj `engines` jednotlivých balíčkov. Používame npm ako jediného správcu balíčkov.

Oficiálne podklady: [Vite](https://vite.dev/guide/), [Vitest](https://vitest.dev/guide/), [kontrola JavaScriptu cez TypeScript](https://www.typescriptlang.org/docs/handbook/type-checking-javascript-files.html), [prehliadače Playwright](https://playwright.dev/docs/browsers).

## Zodpovednosti modulov

| Modul | Zodpovednosť |
| --- | --- |
| `app.js` | Prepája rozhranie, vstup, profily, načítanie kurzu a zobrazenie výsledku. Počas načítania zakáže spustenie lekcie starého kurzu; číslovanie požiadaviek chráni pred oneskorenou odpoveďou. |
| `typing-engine.js` | Čisté pravidlá pozície, pokusov, chýb, dokončenia a aktívneho času. Nepristupuje k stránke ani úložisku. Čas je injektovateľný pre testy. |
| `sentences.js` | Štyri úrovne, validácia korpusu a testovateľný výber vety podľa jazyka, náročnosti a povolených znakov. |
| `lessons.js` | Normalizuje postupné lekcie, kumuluje naučené znaky a pripraví cvičenie alebo poctivý náhradný tréning klávesov a slov. |
| `lesson-loader.js` | Načítava katalóg a kurz cez lokálny `fetch`. |
| `profiles.js` | Aktívny profil, jeho nastavenia, posledná lekcia podľa kurzu, agregované výsledky a ohraničená história. |
| `data-model.js` | Verzia formátu, rozsahy a identifikátory, validácia nedôveryhodných údajov a migrácia podporovanej verzie. |
| `storage.js` | Pamäťový režim, čítanie/zápis `localStorage`, overenie zápisu, bezpečné chyby, migrácia starých cookies a mazanie vlastných údajov. |
| `keyboard-models.js` | Geometria MacBook Air M3 a Dell XPS 2018, varianty ISO/ANSI, normalizované súradnice a body stlačenia. |
| `keyboard-layouts.js` | Načíta a vyrieši národnú mapu podľa systému aj geometrie; priame aj postupné kombinácie klávesov. |
| `hand-guide.js` | Mapovanie klávesov na prsty, čistý výpočet polohy rúk, animované SVG nad klávesnicou a súčasné kombinácie. SVG znamená škálovateľnú vektorovú grafiku. |

## Tok vstupu a výsledku

1. Rozhranie zachytí výsledný znak z `keydown` alebo potvrdený vstup cez pole cvičenia. Prezývka, posuvník, výbery a bežné skratky prehliadača sú oddelené od tréningu.
2. Samotné modifikátory, `Dead`, opakovanie držaného klávesu a pomocné udalosti skladania sa nepočítajú. Skladanie sa potvrdí cez `compositionend`; nasledujúci duplicitný `input` sa vynechá. NFC, kanonická normalizácia Unicode, spojí napríklad písmeno a prízvuk do výsledného znaku.
3. Engine porovná výsledný znak. Správny znak posunie pozíciu, nesprávny zvýši počet chýb a ponechá rovnaký cieľ. Fyzický `event.code` pomáha zobrazovaniu a neurčuje správnosť textu.
4. Po poslednom znaku zostáva stav dokončený. `claimResult` dovolí prevzatie výsledku daného behu iba raz. Nový beh dostane nový náhodný identifikátor; nejde o sledovací identifikátor a neopúšťa prehliadač.
5. Profilový modul uloží výsledok, aktualizuje súhrn lekcie a obmedzí históriu na posledných 100 záznamov. Bežné stlačenie klávesu nespôsobuje zápis úložiska.

Presnosť = `round((attempts - errors) / attempts * 100)`. Bez pokusu sa ukazuje 100 %. Dokončený výsledok musí mať `attempts - errors === length`. Čas začína prvým pokusom, zahŕňa opravy chýb a končí posledným správnym znakom. Skrytie stránky, strata zamerania okna alebo prechod na ovládacie prvky pozastaví meranie; ďalší znak ho obnoví. Údaje obsahujú trvanie v milisekundách aj dátum dokončenia. WPM (words per minute, slová za minútu) sa v tejto verzii nevypočítava.

Rekordy sú oddelené podľa verzie cvičenia, náročnosti a počtu viet v `bestByFormat`. Najlepší výsledok má najvyššiu presnosť; pri rovnakej presnosti vyhrá kratší aktívny čas na znak, pretože náhodné vety majú rôznu dĺžku. Samotné otvorenie alebo reštart lekcie nevytvára dokončený výsledok.

## Obsah a pedagogické obmedzenie

`content/courses/` obsahuje dva kurzy po 16 lekciách. Každá lekcia zavádza explicitné `introducedCharacters`. Množina sa postupne rozširuje. Medzera je zavedená od prvej lekcie na oddelenie skupín klávesov; veľké písmená, diakritika, čísla a interpunkcia majú vlastné kroky. `introducedKeys` zachováva fyzické metadáta pôvodných kurzov; pri výbere textu rozhoduje presný znak.

`content/sentences/<language>.json` obsahuje 120 viet na jazyk. Každá má stabilné `id`, `language`, `difficulty`, `text` a `topics`. Počet slov a znakov sa odvodzuje z textu. Zdroje vznikli pri vývoji a boli jazykovo prečítané; nie sú prevzaté z cudzích článkov.

Výber najprv filtruje jazyk a úroveň, potom vyžaduje všetky naučené znaky vrátane medzery, interpunkcie a veľkosti písmen. Ak vhodná veta nie je dostupná, kurz použije dostupné slová alebo klávesové skupiny a vysvetlí dôvod. Neprípustné slová sa vynechajú celé, aby nevznikali skomolené fragmenty. Voľný tréning túto pedagogickú hranicu nemá. Pri viacerých vhodných vetách sa bezprostredne neopakuje posledné `textId` v aktuálne otvorenej lekcii.

Zmena úrovne nemení rozpracovaný text. Nastavenie sa uloží k profilu a použije sa pri ďalšom cvičení, opakovaní, pokračovaní alebo vedomom reštarte. Štyri orientačné vekové pásma sú informácia o obsahu; vek sa nezisťuje.

Nový obsah sa pridáva do JSON a overí `npm run validate:content`. Nový kurz vyžaduje aj identifikátory v `data-model.js`, layout a testy migrácie/progresu. JSON je textový formát štruktúrovaných údajov.

## Úložisko a verzovanie

Jediný aktuálny kľúč v `localStorage` je `strojopis_data`:

```text
schemaVersion: 3
activeProfileId: string | null
profiles: [
  id, name, keyboardModel, languageLayout, keyboardLocale, keyboardPlatform, difficulty, guideEnabled,
  createdAt, updatedAt,
  courses: {
    <language>: {
      lastLessonId,
      lessons: { <lessonId>: { completedAttempts, bestResult, lastResult } }
    }
  },
  history: [najviac 100 výsledkov]
]
```

Výsledok obsahuje `id`, `lessonId`, prvé `textId`, všetky `textIds`, `sentenceCount`, `exerciseVersion`, jazyk, použitú náročnosť, pokusy, chyby, presnosť, čas, dĺžku textu a dátum dokončenia. Neukladá stlačenia klávesov, vek, e-mail, celý napísaný text ani polohu rozpracovaného znaku. Úložisko je obmedzené na 50 profilov; dĺžky prezývok, identifikátory, kurzy a rozsahy metrík sa validujú.

Podporované sú staršie verzie 1 a 2. Verzia 1 doplní úroveň 1, historické vedenie prstov, dátum a prázdny progres. Obe staršie verzie dostanú `keyboardLocale` podľa pôvodného jazyka a `keyboardPlatform` podľa modelu (Dell → Windows, MacBook → macOS), pričom verzia 2 zachová výsledky a progres. Čítanie nemení záznam na disku; migrácia sa zapíše pri ďalšom významnom uložení. Poškodený či neplatný záznam a novšia neznáma verzia sa chránia pred prepísaním. Nová relácia môže trénovať v pamäti. Obnovenie zápisu po takom stave vyžaduje vedomé vymazanie vlastných starých údajov v rozhraní.

Bez existujúceho platného záznamu sa trvalo nezapisuje, kým používateľ nezvolí **Zapamätať tréning**. Už existujúci platný záznam obnovuje predchádzajúcu voľbu. Pri každom významnom zápise sa záznam spätne prečíta a porovná. Chyba kapacity, prístupu alebo overenia prepne ďalšiu prácu do pamäte a zobrazí pravdivý oznam. Predchádzajúci úspešný záznam môže zostať na disku, čo oznam netají.

Mazanie profilu zachová ostatné profily. Vymazanie všetkých údajov zasahuje iba vlastný menný priestor `strojopis_`, nikdy `localStorage.clear()`. Vypnutie zapamätania odstráni aktuálny záznam a ponechá reláciu v pamäti. Všetky tri deštruktívne voľby majú potvrdzovací dialóg. Súbežná editácia viacerých kariet sa nezlučuje; posledný zápis môže nahradiť stav inej karty.

### Migrácia cookies

Bez js-cookie, natívnym čítaním `document.cookie`, sa pri vyžiadaní zapamätania jednorazovo spracujú:

- `strojopis_profiles_index`, `strojopis_active_profile_id`, `strojopis_profile_<id>`;
- najstarší `strojopis_active_profile`;
- spoločné `strojopis_finger_guide` ako predvolená hodnota pre prenesené profily.

Platné údaje sa skontrolujú a zlúčia bez nahradenia existujúcich profilov rovnakého ID (identifikátora). Až po úspešnom zápise a totožnom spätnom načítaní sa odstránia prenesené cookies. Pri chybe zostávajú všetky pôvodné cookies. Neplatné profily sa nepreberú a ich cookies sa nemažú. Nové profily cookies nevytvárajú.

## Účel zapamätania a rozsah overenia

Účel každého uloženého údaja je obnovenie používateľom vyžiadaného tréningu: prezývka rozlišuje profily, nastavenia obnovujú voľby, posledná lekcia miesto v kurze a výsledky progres. Údaje neopúšťajú zariadenie; nie je tu analytika, reklama ani vzdialená synchronizácia. Nejde o všeobecný právny súhlas a rozhranie ho tak nenazýva.

Samotné použitie `localStorage` nevylučuje pôsobnosť čl. 5 ods. 3 ePrivacy. [Usmernenia EDPB 2/2023, v2.0](https://www.edpb.europa.eu/system/files/documents/2024-10/edpb_guidelines_202302_technical_scope_art_53_eprivacydirective_v2_en_0.pdf), odseky 1 a 4 a poznámka 4, opisujú technický rozsah; oprávnenosť konkrétnej výnimky z požiadavky súhlasu sa posudzuje osobitne podľa vnútroštátnej úpravy. EDPB je Európsky výbor pre ochranu údajov. Toto overenie dokumentuje implementovaný účel a tok údajov, nepotvrdzuje právne posúdenie verejného nasadenia ani prevádzku budúceho hostingu.

Lokálne profily nie sú chránené prihlasovaním. Ďalší používateľ toho istého profilu prehliadača ich môže vidieť. Vymazanie dát prehliadača, zmena pôvodu alebo zariadenia znemožní prístup k miestnemu progresu; prenos medzi zariadeniami nie je súčasťou prvej verzie.

## Klávesnica, prsty a dlhšie cvičenia

Jazyk textu, fyzická geometria, jazyk klávesnice a systém sú nezávislé nastavenia. Päť národných máp pre macOS/Windows obsahuje aj varianty ISO/ANSI; podklady a obmedzenia sú v `KEYBOARD_PROFILES.md`. Zmena mapovania premapuje ciele rozpracovaného textu cez `remapTargets` a zachová pozíciu, výsledky aj čas. Neznáma kombinácia alebo fyzicky chýbajúci kláves nemá vymyslenú nápovedu.

Každý znak môže mať `steps`, postup fyzických stlačení s konkrétnymi modifikátormi. Mŕtvy kláves posunie iba krok nápovedy; cvičenie sa posunie až po prijatí správneho výsledného znaku. Držané fyzické klávesy sa sledujú cez keydown/keyup a vyčistia pri strate zamerania. Bežné systémové skratky sa nepreberajú ako text. Shift sa odporúča opačnej ruke, viac modifikátorov dostane samostatné prsty.

Klávesy a ruky zdieľajú normalizovaný súradnicový priestor. SVG vrstva je nad klávesnicou, polopriehľadná a nepreberá kliknutia. `buildHandPose` určuje končeky podľa geometrie, `updateHandGuide` animuje pripojené prsty k novej polohe a ruší starší pohyb. V režime obmedzeného pohybu zobrazí cieľ hneď. Veľkosť SVG sa mení spolu s klávesnicou; vysoký Enter má explicitný bod stlačenia v skutočnom tvare.

Hlavný panel obsahuje iba riadok a klávesnicu. Skutočný prístupný textarea vstup je vizuálne vložený do riadka; stav, pokyny, nastavenia, zapamätanie aj výsledok sú vľavo. Na úzkej obrazovke je tréning pred doplnkovými panelmi. Vypnutie vedenia skryje ruky a nápovedu. Stabilné uzly klávesnice sa pri bežnom znaku nevytvárajú znova.

Úroveň d pripraví d rôznych viet zo zodpovedajúcej náročnosti. `textIds`, `sentenceCount` a kumulatívne `sentenceEnds` určujú identitu a priebeh dávky; `exerciseVersion: 2` odlišuje staré jednovetné výsledky. Medzi vetami je jedna medzera. V úvodnom kurze sa zachová filter naučených znakov; pri nedostatku kompatibilných viet sa bezpečné cvičenie slov/klávesov predĺži d-krát a pravdivo označí ako náhrada, so `sentenceCount: 0`. Samotné dokončenie prvej vety dávku neukončí.

## Report práce agentov

Lokálny report `agent-usage.csv` vzniká cez `npm run report:agents` z metadát a počítadiel samostatných agentov. Neexportuje text ich rozhovorov. Hranice merania, čiastočný záznam koordinátora a význam polí vysvetľuje `AGENT_USAGE.md`.
